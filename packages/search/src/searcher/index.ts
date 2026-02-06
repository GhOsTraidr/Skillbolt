import pLimit from 'p-limit';
import type { LLMAdapter } from '@skillbolt/core';
import { loadTree } from '@skillbolt/tree';
import type { TreeNode, TreeSkill } from '@skillbolt/tree';
import { createSearchConfig } from '../config.js';
import type {
  SearchConfig,
  SearchOptions,
  SearchResult,
  SelectedSkill,
  SearcherOptions,
} from '../types.js';
import { createEventEmitter } from '../events/index.js';
import { buildNodeSelectionPrompt, buildSkillSelectionPrompt } from './prompts.js';
import { parseSelectionResponse } from './parser.js';
import { pruneSkills } from './pruner.js';

const DEFAULT_EXPAND_THRESHOLD = 6;
const DEFAULT_EARLY_STOP_SKILL_COUNT = 14;

export class Searcher {
  private treePath?: string;
  private tree?: TreeNode;
  private llm: LLMAdapter;
  private config: SearchConfig;
  private emitter: ReturnType<typeof createEventEmitter>;
  private llmCalls = 0;
  private parallelRounds = 0;
  private exploredNodes: string[] = [];
  private selectedPaths: string[] = [];
  private expandThreshold = DEFAULT_EXPAND_THRESHOLD;
  private earlyStopSkillCount = DEFAULT_EARLY_STOP_SKILL_COUNT;

  constructor(options: SearcherOptions) {
    if (!options.treePath && !options.tree) {
      throw new Error('Searcher requires a treePath or tree');
    }

    this.treePath = options.treePath;
    this.tree = options.tree;
    this.llm = options.llm;
    this.config = createSearchConfig(options.config);
    this.emitter = createEventEmitter(options.eventCallback);
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    if (!this.tree) {
      if (!this.treePath) {
        throw new Error('Tree path not set');
      }
      this.tree = await loadTree(this.treePath);
    }

    this.llmCalls = 0;
    this.parallelRounds = 0;
    this.exploredNodes = [];
    this.selectedPaths = [];

    this.emitter.emit('search_start', { query });

    const collectedSkills = await this.searchNode(query, this.tree, 0);
    let selectedSkills: SelectedSkill[] = [];

    if (this.config.pruneEnabled && collectedSkills.length > 0) {
      this.emitter.emit('prune_start', {
        skillCount: collectedSkills.length,
        skillIds: collectedSkills.map((skill) => skill.id),
      });

      this.llmCalls += 1;
      selectedSkills = await pruneSkills(query, collectedSkills, this.llm, this.config);

      const selectedIds = selectedSkills.map((skill) => skill.id);
      const selectedSet = new Set(selectedIds);
      const prunedIds = collectedSkills
        .map((skill) => skill.id)
        .filter((id) => !selectedSet.has(id));

      this.emitter.emit('prune_complete', {
        skillCount: selectedSkills.length,
        selectedIds,
        prunedIds,
      });
    } else {
      selectedSkills = collectedSkills.map((skill) =>
        this.toSelectedSkill(skill, skill.selectionReason ?? 'Selected by search')
      );
    }

    if (options.maxSkills && options.maxSkills > 0) {
      selectedSkills = selectedSkills.slice(0, options.maxSkills);
    }

    this.emitter.emit('search_complete', {
      skills: selectedSkills,
      llmCalls: this.llmCalls,
    });

    return {
      query,
      selectedSkills,
      llmCalls: this.llmCalls,
      parallelRounds: this.parallelRounds,
      exploredNodes: [...this.exploredNodes],
      selectedPaths: [...this.selectedPaths],
    };
  }

  private async searchNode(query: string, node: TreeNode, depth: number): Promise<TreeSkill[]> {
    this.emitter.emit('node_enter', {
      nodeId: node.id,
      nodeName: node.name,
      depth,
      isLeaf: node.isLeaf,
      skillCount: node.countAllSkills(),
    });

    this.exploredNodes.push(node.id);

    if (node.isLeaf) {
      if (node.skills.length === 0) {
        return [];
      }
      return this.selectSkills(query, node.skills);
    }

    let selectedChildren: TreeNode[] = [];
    let autoExpand = false;

    if (node.children.length <= this.expandThreshold) {
      selectedChildren = node.children;
      autoExpand = true;
    } else {
      selectedChildren = await this.selectChildren(query, node.children);
    }

    const selectedIds = selectedChildren.map((child) => child.id);
    this.selectedPaths.push(...selectedIds);

    const rejectedIds = node.children
      .map((child) => child.id)
      .filter((id) => !selectedIds.includes(id));

    this.emitter.emit('children_selected', {
      parentId: node.id,
      selected: selectedIds,
      rejected: rejectedIds,
      autoExpand,
    });

    if (selectedChildren.length === 0) {
      return [];
    }

    if (selectedChildren.length === 1) {
      const only = selectedChildren[0]!;
      const totalSkills = only.countAllSkills();
      if (totalSkills <= this.earlyStopSkillCount) {
        this.emitter.emit('early_stop', { nodeId: only.id, skillCount: totalSkills });
        return this.selectSkills(query, only.collectAllSkills());
      }
    }

    if (selectedChildren.length > 1) {
      this.parallelRounds += 1;
      const limit = pLimit(this.config.maxParallel);
      const results = await Promise.all(
        selectedChildren.map((child) => limit(() => this.searchNode(query, child, depth + 1)))
      );
      return results.flat();
    }

    return this.searchNode(query, selectedChildren[0]!, depth + 1);
  }

  private async selectChildren(query: string, children: TreeNode[]): Promise<TreeNode[]> {
    const prompt = buildNodeSelectionPrompt(
      query,
      children.map((child) => ({
        id: child.id,
        name: child.name,
        description: child.description,
        skillCount: child.countAllSkills(),
      }))
    );

    const response = await this.llm.complete(prompt, {
      model: this.config.model,
      temperature: this.config.temperature,
      timeout: this.config.timeout * 1000,
      caching: this.config.caching,
    });
    this.llmCalls += 1;

    const selection = parseSelectionResponse(
      response,
      children.map((child) => child.id)
    );
    const selectedIds = new Set(selection.map((item) => item.id));
    return children.filter((child) => selectedIds.has(child.id));
  }

  private async selectSkills(query: string, skills: TreeSkill[]): Promise<TreeSkill[]> {
    const prompt = buildSkillSelectionPrompt(
      query,
      skills.map((skill) => ({ id: skill.id, description: skill.description }))
    );

    const response = await this.llm.complete(prompt, {
      model: this.config.model,
      temperature: this.config.temperature,
      timeout: this.config.timeout * 1000,
      caching: this.config.caching,
    });
    this.llmCalls += 1;

    const selection = parseSelectionResponse(
      response,
      skills.map((skill) => skill.id)
    );

    const selectedSet = new Set(selection.map((item) => item.id));
    const selectedSkills = skills
      .filter((skill) => selectedSet.has(skill.id))
      .map((skill) => {
        const reason = selection.find((item) => item.id === skill.id)?.reason;
        return { ...skill, selectionReason: reason ?? skill.selectionReason };
      });

    const selectedIds = selectedSkills.map((skill) => skill.id);
    const rejectedIds = skills.map((skill) => skill.id).filter((id) => !selectedSet.has(id));

    this.emitter.emit('skills_selected', {
      selected: selectedIds,
      rejected: rejectedIds,
      totalOptions: skills.length,
    });

    return selectedSkills;
  }

  private toSelectedSkill(skill: TreeSkill, reason: string): SelectedSkill {
    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      path: skill.path,
      skillPath: skill.skillPath,
      reason,
      githubUrl: skill.githubUrl,
      stars: skill.stars,
      isOfficial: skill.isOfficial,
      author: skill.author,
    };
  }

  getTreeData(): ReturnType<TreeNode['toData']> {
    if (!this.tree) {
      throw new Error('Tree not loaded');
    }
    return this.tree.toData();
  }
}

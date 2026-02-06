import path from 'node:path';

import pLimit from 'p-limit';

import type {
  TreeBuildOptions,
  TreeBuildProgress,
  TreeBuildResult,
  TreeBuilderOptions,
  TreeConfig,
} from '../types.js';
import { DEFAULT_ROOT_CATEGORIES } from '../types.js';
import { createTreeConfig } from '../config.js';
import { TreeNode } from '../node/index.js';
import { scanSkillDirectory } from './scanner.js';
import { assignToRootCategories, splitNodeIntoGroups } from './splitter.js';
import { validateSplitQuality } from './validator.js';
import { saveTreeToYAML } from '../serialization/yaml.js';
import { saveTreeToHTML } from '../serialization/html.js';

const getHtmlPath = (outputPath: string): string => {
  const ext = path.extname(outputPath);
  if (ext) {
    return outputPath.slice(0, -ext.length) + '.html';
  }
  return `${outputPath}.html`;
};

// const countNodes = (node: TreeNode): number =>
//   1 + node.children.reduce((total, child) => total + countNodes(child), 0);

export class TreeBuilder {
  private skillsDir: string;
  private outputPath: string;
  private config: TreeConfig;
  private llm?: TreeBuilderOptions['llm'];
  private maxWorkers: number;
  private onProgress?: TreeBuilderOptions['onProgress'];

  constructor(options: TreeBuilderOptions) {
    this.skillsDir = options.skillsDir;
    this.outputPath = options.outputPath;
    this.config = createTreeConfig(options.config);
    this.llm = options.llm;
    this.maxWorkers = options.maxWorkers ?? 4;
    this.onProgress = options.onProgress;
  }

  async build(options: TreeBuildOptions = {}): Promise<TreeBuildResult> {
    const startTime = Date.now();
    const config = this.config;

    this.emitProgress({
      phase: 'scanning',
      totalSkills: 0,
      processedSkills: 0,
      llmCalls: 0,
      pendingNodes: 0,
    });

    const skills = await scanSkillDirectory(this.skillsDir);
    const totalSkills = skills.length;

    this.emitProgress({
      phase: 'classifying',
      totalSkills,
      processedSkills: 0,
      llmCalls: 0,
      pendingNodes: 0,
    });

    if (!this.llm) {
      throw new Error('TreeBuilder requires an LLM adapter to build a tree.');
    }

    const assignments = await assignToRootCategories(skills, DEFAULT_ROOT_CATEGORIES, this.llm);

    const root = new TreeNode({
      id: 'root',
      name: 'Root',
      description: 'Skill capability tree root',
      depth: 0,
      parentId: null,
      children: [],
      skills: [],
    });

    for (const category of DEFAULT_ROOT_CATEGORIES) {
      const assignment = assignments.get(category.id);
      if (!assignment || assignment.skills.length === 0) {
        continue;
      }

      const child = new TreeNode({
        id: category.id,
        name: category.name,
        description: assignment.description ?? category.description,
        depth: 1,
        parentId: root.id,
        children: [],
        skills: [],
      });

      assignment.skills.forEach((skill) => child.addSkill(skill));
      root.addChild(child);
    }

    const limit = pLimit(this.maxWorkers);
    const queue: TreeNode[] = root.children.filter(
      (child) => child.skills.length > config.maxSkillsPerNode && child.depth < config.maxDepth
    );

    let llmCalls = 1;
    let processedSkills = 0;

    while (queue.length > 0) {
      const batch = queue.splice(0, this.maxWorkers);
      this.emitProgress({
        phase: 'splitting',
        totalSkills,
        processedSkills,
        llmCalls,
        pendingNodes: queue.length + batch.length,
      });

      const results = await Promise.all(
        batch.map((node) =>
          limit(async () => {
            if (node.depth >= config.maxDepth) {
              return [] as TreeNode[];
            }

            const context = {
              parentName: node.name,
              parentDescription: node.description,
              depth: node.depth,
            };

            const groups = await splitNodeIntoGroups(node.skills, context, config, this.llm!);
            llmCalls += 1;

            const validation = validateSplitQuality(groups, node.skills.length);
            if (!validation.valid || groups.length === 0) {
              return [] as TreeNode[];
            }

            const newChildren: TreeNode[] = [];
            for (const group of groups) {
              if (group.skills.length === 0) {
                continue;
              }

              const child = new TreeNode({
                id: group.id,
                name: group.name,
                description: group.description,
                depth: node.depth + 1,
                parentId: node.id,
                children: [],
                skills: [],
              });

              group.skills.forEach((skill) => child.addSkill(skill));
              node.addChild(child);
              newChildren.push(child);
            }

            processedSkills += node.skills.length;
            node.skills.length = 0;

            return newChildren;
          })
        )
      );

      results.forEach((children) => {
        children.forEach((child) => {
          if (child.skills.length > config.maxSkillsPerNode && child.depth < config.maxDepth) {
            queue.push(child);
          }
        });
      });
    }

    this.emitProgress({
      phase: 'writing',
      totalSkills,
      processedSkills: totalSkills,
      llmCalls,
      pendingNodes: 0,
    });

    await saveTreeToYAML(root, this.outputPath);

    let htmlPath: string | undefined;
    if (options.generateHtml) {
      htmlPath = getHtmlPath(this.outputPath);
      await saveTreeToHTML(root, htmlPath);
    }

    return {
      tree: root.toData(),
      totalSkills: root.countAllSkills(),
      totalNodes: root.countAllNodes(),
      maxDepth: root.getTreeDepth(),
      llmCalls,
      duration: Date.now() - startTime,
      outputPath: this.outputPath,
      htmlPath,
    };
  }

  private emitProgress(progress: TreeBuildProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }
}

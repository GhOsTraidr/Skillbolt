import { createLLMAdapter } from '@skillbolt/core';
import { Searcher } from '@skillbolt/search';
import type { SearchEvent, SelectedSkill } from '@skillbolt/search';
import {
  addLog,
  createInitialState,
  resetState,
  setExecutionMode,
  setFiles,
  setOrchestrator,
  setSearchComplete,
  setSearchEvents,
  setSearchResult,
  setSelectedSkillIds,
  setStartTime,
  setTask,
  setTaskName,
  setTreeData,
  setWorkDir,
  updatePhase,
} from './state.js';
import { UnifiedPhase } from './types.js';
import type { OrchestratorNode, OrchestratorState, ServerOptions, UnifiedState } from './types.js';
import { WebVisualizer } from './visualizer.js';

export interface SkillGroup {
  id: string;
  name: string;
  description: string;
  treePath: string;
}

const DEFAULT_SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'curated',
    name: 'Curated',
    description: 'Curated skill library for general tasks.',
    treePath: 'data/trees/tree_curated.yaml',
  },
  {
    id: 'top500',
    name: 'Top 500',
    description: 'Top 500 skills from the registry.',
    treePath: 'data/trees/tree_top500.yaml',
  },
  {
    id: 'top1000',
    name: 'Top 1000',
    description: 'Top 1000 skills from the registry.',
    treePath: 'data/trees/tree_top1000.yaml',
  },
];

type BroadcastFn = (type: string, data: Record<string, unknown>) => void;

export class UnifiedService {
  private state: UnifiedState;
  private broadcaster: BroadcastFn | null;
  private readonly options: ServerOptions;
  private readonly visualizer: WebVisualizer;
  private executionTimers: ReturnType<typeof setTimeout>[] = [];
  private executionStarted = false;

  constructor(options: ServerOptions = {}, broadcaster?: BroadcastFn) {
    this.options = options;
    this.state = createInitialState(options);
    this.broadcaster = broadcaster ?? null;
    this.visualizer = new WebVisualizer(this.broadcast.bind(this));
  }

  setBroadcaster(broadcaster?: BroadcastFn): void {
    this.broadcaster = broadcaster ?? null;
  }

  getState(): UnifiedState {
    return this.state;
  }

  getSkillGroups(): SkillGroup[] {
    return DEFAULT_SKILL_GROUPS;
  }

  confirmSearch(): void {
    this.state = updatePhase(this.state, UnifiedPhase.REVIEWING);
    this.emitPhase();
    this.emitState();
  }

  updateSkillSelection(skillIds: string[]): void {
    this.state = setSelectedSkillIds(this.state, skillIds);
    this.broadcast('skills_updated', { selected_ids: this.state.selectedSkillIds });
    this.emitState();
  }

  async startSearch(task: string, taskName?: string, files?: string[]): Promise<void> {
    this.state = setTask(this.state, task);
    this.state = setTaskName(this.state, taskName ?? '');
    this.state = setFiles(this.state, files ?? []);
    this.state = setStartTime(this.state, new Date().toISOString());
    this.state = setSearchEvents(this.state, []);
    this.state = setSearchResult(this.state, null);
    this.state = setSearchComplete(this.state, false);
    this.state = setSelectedSkillIds(this.state, []);
    this.state = setWorkDir(this.state, process.cwd());

    this.state = updatePhase(this.state, UnifiedPhase.SEARCHING);
    this.emitPhase();
    this.broadcast('work_dir', { path: this.state.workDir });
    this.emitState();

    try {
      const group = DEFAULT_SKILL_GROUPS[0];
      const searcher = new Searcher({
        treePath: group?.treePath,
        llm: createLLMAdapter(),
        eventCallback: (event: SearchEvent) => {
          this.state = setSearchEvents(this.state, [...this.state.searchEvents, event]);
          this.broadcast('search_event', { event });
        },
      });

      const result = await searcher.search(task);
      this.state = setSearchResult(this.state, {
        skills: result.selectedSkills,
        llmCalls: result.llmCalls,
      });
      this.state = setSelectedSkillIds(
        this.state,
        result.selectedSkills.map((skill) => skill.id)
      );
      if (typeof searcher.getTreeData === 'function') {
        this.state = setTreeData(this.state, searcher.getTreeData());
      }
      this.state = setSearchComplete(this.state, true);
      this.broadcast('search_complete', {
        skills: result.selectedSkills,
        llm_calls: result.llmCalls,
        selected_ids: this.state.selectedSkillIds,
      });
      this.broadcast('tree_data', { tree: this.state.treeData });
      this.broadcast('skills_updated', { selected_ids: this.state.selectedSkillIds });
      this.emitState();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error during search';
      this.state = addLog(this.state, message, 'error');
      const entry = this.state.logs[this.state.logs.length - 1];
      if (entry) {
        this.broadcast('log', { entry });
      }
      this.state = updatePhase(this.state, UnifiedPhase.ERROR);
      this.emitPhase();
      this.broadcast('error', { message });
      this.emitState();
    }
  }

  async confirmSkills(executionMode: 'dag' | 'freestyle'): Promise<void> {
    this.state = setExecutionMode(this.state, executionMode);

    if (executionMode === 'dag') {
      this.state = updatePhase(this.state, UnifiedPhase.PLANNING);
      this.emitPhase();
      this.preparePlans();
      this.emitState();
      return;
    }

    this.state = updatePhase(this.state, UnifiedPhase.EXECUTING);
    this.emitPhase();
    this.prepareExecution();
    this.emitState();
    this.startExecution();
  }

  selectPlan(index: number): void {
    const orchestrator = this.state.orchestrator;
    if (!orchestrator) {
      return;
    }
    this.state = setOrchestrator(this.state, {
      ...orchestrator,
      selectedPlanIndex: index,
    });
    this.visualizer.selectPlan(orchestrator.plans, index);
    this.state = updatePhase(this.state, UnifiedPhase.EXECUTING);
    this.emitPhase();
    this.prepareExecution();
    this.emitState();
    this.startExecution();
  }

  reset(): void {
    this.executionTimers.forEach((timer) => clearTimeout(timer));
    this.executionTimers = [];
    this.executionStarted = false;
    this.state = resetState(this.state, this.options);
    this.emitPhase();
    this.broadcast('init', { ...this.state });
  }

  ensureAutoStart(): void {
    if (this.state.mode !== 'execute' || this.executionStarted) {
      return;
    }
    void this.startDirectExecution();
  }

  private async startDirectExecution(): Promise<void> {
    if (this.executionStarted) {
      return;
    }
    this.state = setSelectedSkillIds(this.state, this.state.presetSkills);
    this.state = setTask(this.state, this.state.task || 'Execute preset skills');
    this.state = setStartTime(this.state, new Date().toISOString());
    await this.confirmSkills(this.options.runMode === 'freestyle' ? 'freestyle' : 'dag');
    if (this.state.executionMode === 'dag' && this.state.orchestrator?.plans.length) {
      this.selectPlan(0);
    }
  }

  private preparePlans(): void {
    const skills = this.getSelectedSkills();
    const nodes = this.createNodesFromSkills(skills);
    const phases = [
      {
        phaseNumber: 1,
        nodes: nodes.map((node) => node.id),
        mode: 'parallel',
      },
    ];
    const plan = {
      name: 'Plan A',
      description: 'Auto-generated plan based on selected skills.',
      nodes: nodes.map((node) => ({ id: node.id, name: node.name })),
    };
    const orchestrator: OrchestratorState = {
      nodes,
      phases,
      currentPhase: 0,
      plans: [plan],
      selectedPlanIndex: -1,
    };
    this.state = setOrchestrator(this.state, orchestrator);
    this.visualizer.setNodes(nodes, [
      { id: 'phase-1', name: 'Execution', nodeIds: nodes.map((node) => node.id) },
    ]);
    this.visualizer.selectPlan(orchestrator.plans, orchestrator.selectedPlanIndex);
  }

  private prepareExecution(): void {
    const skills = this.getSelectedSkills();
    const nodes = this.createNodesFromSkills(skills);
    const phases = [
      {
        phaseNumber: 1,
        nodes: nodes.map((node) => node.id),
        mode: 'parallel',
      },
    ];
    this.state = setOrchestrator(this.state, {
      nodes,
      phases,
      currentPhase: 0,
      plans: this.state.orchestrator?.plans ?? [],
      selectedPlanIndex: this.state.orchestrator?.selectedPlanIndex ?? 0,
    });
    this.visualizer.setNodes(nodes, [
      { id: 'phase-1', name: 'Execution', nodeIds: nodes.map((node) => node.id) },
    ]);
  }

  private startExecution(): void {
    if (this.executionStarted || !this.state.orchestrator) {
      return;
    }
    this.executionStarted = true;
    const nodes = this.state.orchestrator.nodes;
    this.visualizer.setPhase(0);

    nodes.forEach((node, index) => {
      const startDelay = 350 + index * 450;
      const completeDelay = startDelay + 400;
      this.executionTimers.push(
        setTimeout(() => {
          this.updateNodeStatus(node.id, 'running');
          this.visualizer.addLog(`Running ${node.name}`, 'info', node.id);
          this.state = addLog(this.state, `Running ${node.name}`, 'info');
          this.emitState();
        }, startDelay)
      );
      this.executionTimers.push(
        setTimeout(() => {
          this.updateNodeStatus(node.id, 'completed');
          this.visualizer.addLog(`Completed ${node.name}`, 'ok', node.id);
          this.state = addLog(this.state, `Completed ${node.name}`, 'ok');
          this.emitState();
          if (index === nodes.length - 1) {
            this.completeExecution();
          }
        }, completeDelay)
      );
    });
  }

  private completeExecution(): void {
    this.state = updatePhase(this.state, UnifiedPhase.COMPLETE);
    this.emitPhase();
    this.broadcast('result', {
      status: 'completed',
      stats: {
        total: this.state.orchestrator?.nodes.length ?? 0,
        completed: this.state.orchestrator?.nodes.length ?? 0,
        failed: 0,
        skipped: 0,
      },
    });
    this.emitState();
  }

  private updateNodeStatus(nodeId: string, status: OrchestratorNode['status']): void {
    if (!this.state.orchestrator) {
      return;
    }
    const nodes = this.state.orchestrator.nodes.map((node) =>
      node.id === nodeId ? { ...node, status } : node
    );
    this.state = setOrchestrator(this.state, {
      ...this.state.orchestrator,
      nodes,
    });
    this.visualizer.updateStatus(nodeId, status);
    this.emitState();
  }

  private createNodesFromSkills(skills: SelectedSkill[]): OrchestratorNode[] {
    return skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      type: 'primary',
      dependsOn: [],
      purpose: skill.description,
      status: 'pending',
    }));
  }

  private getSelectedSkills(): SelectedSkill[] {
    if (!this.state.searchResult) {
      return this.state.selectedSkillIds.map((id) => ({
        id,
        name: id,
        description: 'Preset skill',
        path: '',
        skillPath: '',
        reason: 'Preset',
      }));
    }
    const skills = this.state.searchResult.skills as SelectedSkill[];
    const map = new Map(skills.map((skill) => [skill.id, skill]));
    return this.state.selectedSkillIds
      .map((id) => map.get(id))
      .filter((skill): skill is SelectedSkill => Boolean(skill));
  }

  private emitPhase(): void {
    this.broadcast('phase', { phase: this.state.phase });
  }

  private emitState(): void {
    this.broadcast('state', { state: this.state });
  }

  private broadcast(type: string, data: Record<string, unknown>): void {
    if (!this.broadcaster) {
      return;
    }
    this.broadcaster(type, data);
  }
}

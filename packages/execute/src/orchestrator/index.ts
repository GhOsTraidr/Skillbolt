import {
  DependencyGraph,
  buildGraphFromNodes,
  generatePlans,
  ExecutionThrottler,
  NodeStatus,
  NodeFailureReason,
} from '@skillbolt/compose';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { LLMAdapter, LLMMessage } from '@skillbolt/core';
import type {
  AgentClient,
  ExecutionResult,
  ExecutionStats,
  OrchestratorOptions,
  RunOptions,
} from '../types.js';
import { MockAgentClient } from '../client/index.js';
import { RunContext } from '../context/run-context.js';
import { buildArtifactsContext, buildIsolatedExecutorPrompt } from './prompts.js';
import { extractExecutionSummary } from './summary.js';

interface PlanSelection {
  nodes: Record<string, unknown>[];
  raw: Record<string, unknown>;
}

export class SkillOrchestrator {
  private skillDir: string;
  private workspaceDir: string;
  private maxConcurrent: number;
  private nodeTimeout: number;
  private runContext?: RunContext;
  private agentClient: AgentClient;

  constructor(options: OrchestratorOptions, agentClient?: AgentClient) {
    this.skillDir = options.skillDir ?? '.claude/skills';
    this.workspaceDir = options.runContext?.workspaceDir ?? options.workspaceDir ?? 'workspace';
    this.maxConcurrent = options.maxConcurrent ?? 6;
    this.nodeTimeout = options.nodeTimeout ?? 600;
    this.runContext = options.runContext;
    this.agentClient = agentClient ?? new MockAgentClient();
  }

  async runWithVisualizer(options: RunOptions): Promise<ExecutionResult> {
    const { task, skillNames, visualizer, context, planOnly, files } = options;
    await visualizer.setTask(task);

    const runContext = this.runContext ?? RunContext.create(task, { mode: 'dag' });
    this.workspaceDir = runContext.workspaceDir;
    const resolvedSkillDir = resolve(this.skillDir);

    const missingSkills = skillNames.filter((skillName) => {
      const skillPath = join(resolvedSkillDir, skillName);
      return !existsSync(skillPath) || !statSync(skillPath).isDirectory();
    });

    if (missingSkills.length > 0) {
      const message = `Missing skills: ${missingSkills.join(', ')}`;
      await visualizer.addLog(message, 'error');
      return { status: 'failed', error: message };
    }

    try {
      runContext.setup(skillNames, resolvedSkillDir, { copyAll: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to setup run context';
      await visualizer.addLog(message, 'error');
      return { status: 'failed', error: message };
    }

    runContext.saveMeta(task, 'dag', skillNames);

    if (files && files.length > 0) {
      const copied = runContext.copyFiles(files);
      runContext.updateMeta({ files: copied });
    }

    let plans: Record<string, unknown>[] = [];
    try {
      const skills = loadSkillInfo(skillNames, resolvedSkillDir);
      const contextText = serializeContext(context);
      const llm = createPlannerAdapter(this.agentClient);
      const generated = await generatePlans({ task, skills, llm, context: contextText });
      if (generated.error) {
        throw new Error(generated.error);
      }
      plans = generated.plans as Record<string, unknown>[];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Plan generation failed';
      await visualizer.addLog(message, 'error');
      runContext.saveResult({ status: 'failed', error: message });
      return { status: 'failed', error: message };
    }

    if (planOnly) {
      return { status: 'plan_only', plans };
    }

    const selection = await this.selectPlan(plans, visualizer);
    if (!selection) {
      const message = 'No execution plan available';
      await visualizer.addLog(message, 'error');
      runContext.saveResult({ status: 'failed', error: message });
      return { status: 'failed', error: message };
    }

    runContext.savePlan(selection.raw);

    const graph = buildGraphFromNodes(selection.nodes);
    const phases = graph.getExecutionPhases();
    await visualizer.setNodes(selection.nodes, phases);

    const throttler = new ExecutionThrottler(this.maxConcurrent);

    for (const phase of phases) {
      await visualizer.setPhase(phase.phaseNumber);
      if (phase.mode === 'parallel') {
        await throttler.executeBatch(
          phase.nodes.map(
            (nodeId) => () =>
              this.executeNode({
                graph,
                nodeId,
                task,
                visualizer,
              })
          )
        );
      } else {
        for (const nodeId of phase.nodes) {
          await this.executeNode({
            graph,
            nodeId,
            task,
            visualizer,
          });
        }
      }
    }

    const stats = graph.getStats() as ExecutionStats;
    const status = resolveExecutionStatus(stats);
    const result: ExecutionResult = { status, stats };
    runContext.saveResult({ status, stats });
    await this.agentClient.close();
    return result;
  }

  private async executeNode(options: {
    graph: DependencyGraph;
    nodeId: string;
    task: string;
    visualizer: RunOptions['visualizer'];
  }): Promise<void> {
    const { graph, nodeId, task, visualizer } = options;
    const node = graph.getNode(nodeId);
    if (!node || node.status !== NodeStatus.PENDING) {
      return;
    }

    graph.updateStatus(nodeId, NodeStatus.RUNNING, node.outputPath ?? undefined);
    await visualizer.updateStatus(nodeId, NodeStatus.RUNNING);

    const outputDir = node.outputPath ?? join(this.workspaceDir, nodeId);
    mkdirSync(outputDir, { recursive: true });

    const artifactsContext = buildArtifactsContext({ nodes: graph.nodes, nodeId });
    const prompt = buildIsolatedExecutorPrompt({
      overallTask: task,
      workingDir: this.workspaceDir,
      skillName: node.name,
      nodePurpose: node.purpose,
      outputDir,
      outputsSummary: node.outputsSummary,
      downstreamHint: node.downstreamHint,
      artifactsContext,
    });

    const startedAt = Date.now();
    let summary = '';
    let failureReason = NodeFailureReason.SUCCESS;
    let errorMessage: string | null = null;

    try {
      const response = await withTimeout(this.agentClient.execute(prompt), this.nodeTimeout * 1000);
      const extracted = extractExecutionSummary(response);
      summary = extracted.summary;
      if (!extracted.isSuccess) {
        failureReason = NodeFailureReason.SKILL_ERROR;
        errorMessage = 'Execution reported failure.';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Execution error';
      errorMessage = message;
      failureReason = message.toLowerCase().includes('timeout')
        ? NodeFailureReason.TIMEOUT
        : NodeFailureReason.EXECUTION_ERROR;
    }

    if (failureReason !== NodeFailureReason.SUCCESS) {
      graph.failNode(nodeId);
      await visualizer.updateStatus(nodeId, NodeStatus.FAILED);
      await visualizer.addLog(errorMessage ?? 'Execution failed', 'error', nodeId);
      for (const dependent of graph.getDependents(nodeId)) {
        const dependentNode = graph.getNode(dependent);
        if (dependentNode?.status === NodeStatus.SKIPPED) {
          await visualizer.updateStatus(dependent, NodeStatus.SKIPPED);
        }
      }
      return;
    }

    graph.updateStatus(nodeId, NodeStatus.COMPLETED, outputDir);
    await visualizer.updateStatus(nodeId, NodeStatus.COMPLETED);
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
    const message = summary || `Completed in ${durationSeconds}s`;
    await visualizer.addLog(message, 'info', nodeId);
  }

  private async selectPlan(
    plans: Record<string, unknown>[],
    visualizer: RunOptions['visualizer']
  ): Promise<PlanSelection | null> {
    if (!plans || plans.length === 0) {
      return null;
    }

    const selectedIndex = plans.length > 1 ? await visualizer.selectPlan(plans) : 0;
    const normalizedIndex =
      typeof selectedIndex === 'number' && selectedIndex >= 0 && selectedIndex < plans.length
        ? selectedIndex
        : 0;
    const selectedPlan = plans[normalizedIndex] ?? plans[0];
    if (!selectedPlan) {
      return null;
    }

    const maybeNodes = (selectedPlan as { nodes?: unknown }).nodes;
    const nodes = Array.isArray(maybeNodes) ? maybeNodes.filter(isRecord) : [];
    if (nodes.length === 0) {
      return null;
    }
    return { nodes, raw: selectedPlan };
  }
}

const loadSkillInfo = (
  skillNames: string[],
  skillsDir: string
): Array<{ name: string; description: string; content: string }> => {
  return skillNames.map((skillName) => {
    const skillRoot = join(skillsDir, skillName);
    const candidates = ['SKILL.md', 'skill.md', 'README.md'];
    let content = '';
    for (const candidate of candidates) {
      const candidatePath = join(skillRoot, candidate);
      if (!existsSync(candidatePath)) {
        continue;
      }
      if (statSync(candidatePath).isFile()) {
        content = readFileSync(candidatePath, 'utf8');
        break;
      }
    }

    return {
      name: skillName,
      description: '',
      content,
    };
  });
};

const serializeContext = (context?: Record<string, unknown>): string | undefined => {
  if (!context) {
    return undefined;
  }
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return String(context);
  }
};

const createPlannerAdapter = (client: AgentClient): LLMAdapter => ({
  complete: async (messages: LLMMessage[]): Promise<string> => {
    const prompt = messages.map((message) => message.content).join('\n\n');
    return client.execute(prompt);
  },
  completeJSON: async <T>(messages: LLMMessage[]): Promise<T> => {
    const prompt = messages.map((message) => message.content).join('\n\n');
    const response = await client.execute(prompt);
    return JSON.parse(response) as T;
  },
});

const resolveExecutionStatus = (stats: ExecutionStats): ExecutionResult['status'] => {
  if (stats.failed > 0) {
    return stats.completed > 0 ? 'partial' : 'failed';
  }
  if (stats.completed === stats.total) {
    return 'completed';
  }
  return 'unknown';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Execution timed out')), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

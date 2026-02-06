import type { ExecutionPhase } from '@skillbolt/compose';
import type { RunContext } from './context/run-context.js';

export type { NodeFailureReason, NodeExecutionResult, NodeStatus } from '@skillbolt/compose';

export type ExecutionMode = 'dag' | 'freestyle' | 'direct' | 'baseline';

export interface ExecutionStats {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  pending: number;
  running: number;
  primary: number;
  helper: number;
}

export interface ExecutionResult {
  status: 'completed' | 'partial' | 'failed' | 'plan_only' | 'unknown';
  stats?: ExecutionStats;
  error?: string;
  plans?: Array<Record<string, unknown>>;
}

export interface OrchestratorOptions {
  skillDir?: string;
  workspaceDir?: string;
  maxConcurrent?: number;
  nodeTimeout?: number;
  runContext?: RunContext;
}

export type { RunContext } from './context/run-context.js';

export interface RunOptions {
  task: string;
  skillNames: string[];
  visualizer: VisualizerProtocol;
  context?: Record<string, unknown>;
  planOnly?: boolean;
  files?: string[];
}

export interface VisualizerProtocol {
  setTask(task: string): Promise<void>;
  setNodes(nodes: Record<string, unknown>[], phases: ExecutionPhase[]): Promise<void>;
  updateStatus(nodeId: string, status: string): Promise<void>;
  setPhase(phaseNum: number): Promise<void>;
  addLog(message: string, level?: string, nodeId?: string): Promise<void>;
  selectPlan(plans: Record<string, unknown>[]): Promise<number>;
}

export interface RunMeta {
  runId: string;
  task: string;
  mode: string;
  skills: string[];
  startedAt: string;
  completedAt?: string;
  files?: string[];
  runDir?: string;
  result?: Record<string, unknown>;
}

export interface AgentClient {
  execute(prompt: string): Promise<string>;
  close(): Promise<void>;
}

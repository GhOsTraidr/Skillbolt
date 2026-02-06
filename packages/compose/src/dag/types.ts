export enum SkillType {
  PRIMARY = 'primary',
  HELPER = 'helper',
}

export enum NodeStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum NodeFailureReason {
  SUCCESS = 'success',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  SKILL_ERROR = 'skill_error',
  DEPENDENCY_FAILED = 'dependency_failed',
  UNKNOWN = 'unknown',
  EXECUTION_ERROR = 'execution_error',
}

export interface SkillNode {
  id: string;
  name: string;
  skillType: SkillType;
  dependsOn: string[];
  purpose: string;
  status: NodeStatus;
  outputPath: string | null;
  outputsSummary: string;
  downstreamHint: string;
  usageHints: Record<string, string>;
}

export interface ExecutionPhase {
  phaseNumber: number;
  nodes: string[];
  mode: 'parallel' | 'sequential';
}

export interface NodeExecutionResult {
  nodeId: string;
  status: NodeStatus;
  outputPath: string | null;
  summary: string;
  error: string | null;
  failureReason: NodeFailureReason;
  executionTimeSeconds: number;
  costUsd: number;
}

export function isTerminal(node: SkillNode): boolean {
  return (
    node.status === NodeStatus.COMPLETED ||
    node.status === NodeStatus.FAILED ||
    node.status === NodeStatus.SKIPPED
  );
}

export function createSkillNode(
  data: Partial<SkillNode> & { id: string; name: string }
): SkillNode {
  return {
    skillType: SkillType.HELPER,
    dependsOn: [],
    purpose: '',
    status: NodeStatus.PENDING,
    outputPath: null,
    outputsSummary: '',
    downstreamHint: '',
    usageHints: {},
    ...data,
  };
}

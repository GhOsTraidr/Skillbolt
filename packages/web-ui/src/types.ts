export enum UnifiedPhase {
  IDLE = 'idle',
  SEARCHING = 'searching',
  REVIEWING = 'reviewing',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface LogEntry {
  message: string;
  level: 'info' | 'ok' | 'warn' | 'error';
  timestamp: string;
  elapsed: string;
}

export interface OrchestratorNode {
  id: string;
  name: string;
  type: 'primary' | 'helper';
  dependsOn: string[];
  purpose: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

export interface OrchestratorState {
  nodes: OrchestratorNode[];
  phases: Array<{ phaseNumber: number; nodes: string[]; mode: string }>;
  currentPhase: number;
  plans: Record<string, unknown>[];
  selectedPlanIndex: number;
}

export interface UnifiedState {
  phase: UnifiedPhase;
  task: string;
  taskName: string;
  files: string[];
  startTime: string | null;
  mode: 'full' | 'execute';
  runMode: 'baseline' | 'freestyle' | 'dag' | null;
  presetSkills: string[];
  executionMode: 'dag' | 'freestyle';
  searchResult: { skills: unknown[]; llmCalls: number } | null;
  selectedSkillIds: string[];
  treeData: unknown | null;
  searchEvents: unknown[];
  searchComplete: boolean;
  orchestrator: OrchestratorState | null;
  workDir: string;
  elapsed: string;
  logs: LogEntry[];
}

export interface ServerOptions {
  port?: number;
  openBrowser?: boolean;
  task?: string;
  presetSkills?: string[];
  mode?: 'full' | 'execute';
  runMode?: 'dag' | 'freestyle' | 'baseline';
  files?: string[];
  taskName?: string;
}

export interface WSMessage {
  type: string;
  data?: Record<string, unknown>;
}

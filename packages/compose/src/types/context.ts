/**
 * Execution context types
 */

import type { StepStatus, WorkflowStep } from './step.js';
import type { Workflow } from './workflow.js';

/**
 * Variable scope type
 */
export type ScopeType = 'global' | 'workflow' | 'step' | 'loop';

/**
 * Variable scope
 */
export interface VariableScope {
  /** Scope type */
  type: ScopeType;
  /** Scope identifier */
  id: string;
  /** Parent scope (for nesting) */
  parent?: VariableScope;
  /** Variables in this scope */
  variables: Map<string, unknown>;
}

/**
 * Step execution result
 */
export interface StepResult {
  /** Step ID */
  stepId: string;
  /** Execution status */
  status: StepStatus;
  /** Output values */
  outputs: Record<string, unknown>;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Error if failed */
  error?: Error;
  /** Retry count */
  retryCount?: number;
  /** Child results (for parallel/foreach) */
  children?: StepResult[];
}

/**
 * Workflow execution result
 */
export interface ExecutionResult {
  /** Overall execution status */
  status: 'completed' | 'failed' | 'cancelled';
  /** Final outputs */
  outputs: Record<string, unknown>;
  /** All step results */
  steps: StepResult[];
  /** Total duration in milliseconds */
  duration: number;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
  /** Error if failed */
  error?: Error;
}

/**
 * Execution context state
 */
export interface ExecutionState {
  /** Current workflow */
  workflow: Workflow;
  /** Initial inputs */
  inputs: Record<string, unknown>;
  /** Current scope stack */
  scopeStack: VariableScope[];
  /** Step results by ID */
  stepResults: Map<string, StepResult>;
  /** Whether execution is cancelled */
  cancelled: boolean;
  /** Execution start time */
  startTime: number;
}

/**
 * Skill executor function type
 */
export type SkillExecutor = (
  skillName: string,
  inputs: Record<string, unknown>,
  context: ExecutionContext
) => Promise<Record<string, unknown>>;

/**
 * Workflow loader function type
 */
export type WorkflowLoader = (path: string) => Promise<Workflow>;

/**
 * Execution options
 */
export interface ExecutionOptions {
  /** Initial input values */
  inputs?: Record<string, unknown>;
  /** Environment variables */
  env?: Record<string, string>;
  /** Skill executor implementation */
  skillExecutor?: SkillExecutor;
  /** Workflow loader for sub-workflows */
  workflowLoader?: WorkflowLoader;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Maximum parallel executions */
  maxConcurrency?: number;
  /** Whether to run in dry-run mode */
  dryRun?: boolean;
  /** Event handlers */
  onStepStart?: (step: WorkflowStep, context: ExecutionContext) => void;
  /** Event handlers */
  onStepComplete?: (step: WorkflowStep, result: StepResult, context: ExecutionContext) => void;
  /** Event handlers */
  onStepError?: (step: WorkflowStep, error: Error, context: ExecutionContext) => void;
}

/**
 * Execution context interface
 */
export interface ExecutionContext {
  /** Get a variable value */
  getVariable(name: string): unknown;
  /** Set a variable value */
  setVariable(name: string, value: unknown): void;
  /** Check if a variable exists */
  hasVariable(name: string): boolean;
  /** Get all variables in current scope */
  getAllVariables(): Record<string, unknown>;
  /** Push a new scope */
  pushScope(type: ScopeType, id: string): void;
  /** Pop the current scope */
  popScope(): void;
  /** Get current scope */
  getCurrentScope(): VariableScope;
  /** Get step result by ID */
  getStepResult(stepId: string): StepResult | undefined;
  /** Set step result */
  setStepResult(stepId: string, result: StepResult): void;
  /** Check if execution is cancelled */
  isCancelled(): boolean;
  /** Cancel execution */
  cancel(): void;
  /** Get execution options */
  getOptions(): ExecutionOptions;
  /** Get workflow */
  getWorkflow(): Workflow;
  /** Get execution state */
  getState(): ExecutionState;
}

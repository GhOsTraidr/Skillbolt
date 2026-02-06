/**
 * Workflow step types
 */

import type { ErrorStrategy } from './error.js';

/**
 * Step execution status
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';

/**
 * Base step definition
 */
export interface BaseStep {
  /** Unique step identifier */
  id: string;
  /** Human-readable name */
  name?: string;
  /** Step description */
  description?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Error handling for this step */
  onError?: ErrorStrategy;
  /** Condition to determine if step should run */
  when?: string;
}

/**
 * Simple skill execution step
 */
export interface SkillStep extends BaseStep {
  /** Skill to execute */
  skill: string;
  /** Input parameters for the skill */
  inputs?: Record<string, unknown>;
  /** Output mappings */
  outputs?: Record<string, string>;
}

/**
 * Parallel execution block
 */
export interface ParallelStep extends BaseStep {
  /** Steps to execute in parallel */
  parallel: WorkflowStep[];
  /** Maximum concurrent executions */
  maxConcurrency?: number;
  /** Failure strategy: fail-fast or wait-all */
  failureStrategy?: 'fail-fast' | 'wait-all';
}

/**
 * Conditional execution
 */
export interface ConditionStep extends BaseStep {
  /** Condition configuration */
  condition: {
    /** Condition expression */
    if: string;
    /** Steps to execute if condition is true */
    then: WorkflowStep | WorkflowStep[];
    /** Steps to execute if condition is false */
    else?: WorkflowStep | WorkflowStep[];
  };
}

/**
 * Loop execution
 */
export interface ForeachStep extends BaseStep {
  /** Foreach configuration */
  foreach: {
    /** Expression that evaluates to an array */
    items: string;
    /** Variable name for current item */
    as: string;
    /** Optional variable name for index */
    index?: string;
    /** Step(s) to execute for each item */
    step: WorkflowStep | WorkflowStep[];
    /** Maximum concurrent iterations */
    maxConcurrency?: number;
  };
}

/**
 * While loop execution
 */
export interface WhileStep extends BaseStep {
  /** While configuration */
  while: {
    /** Condition expression */
    condition: string;
    /** Maximum iterations (safety limit) */
    maxIterations?: number;
    /** Step(s) to execute */
    step: WorkflowStep | WorkflowStep[];
  };
}

/**
 * Sub-workflow execution
 */
export interface SubWorkflowStep extends BaseStep {
  /** Reference to external workflow */
  workflow: string;
  /** Input parameters to pass */
  inputs?: Record<string, unknown>;
  /** Output mappings */
  outputs?: Record<string, string>;
}

/**
 * Union type for all step types
 */
export type WorkflowStep =
  | SkillStep
  | ParallelStep
  | ConditionStep
  | ForeachStep
  | WhileStep
  | SubWorkflowStep;

/**
 * Type guards for step types
 */
export function isSkillStep(step: WorkflowStep): step is SkillStep {
  return 'skill' in step;
}

export function isParallelStep(step: WorkflowStep): step is ParallelStep {
  return 'parallel' in step;
}

export function isConditionStep(step: WorkflowStep): step is ConditionStep {
  return 'condition' in step;
}

export function isForeachStep(step: WorkflowStep): step is ForeachStep {
  return 'foreach' in step;
}

export function isWhileStep(step: WorkflowStep): step is WhileStep {
  return 'while' in step;
}

export function isSubWorkflowStep(step: WorkflowStep): step is SubWorkflowStep {
  return 'workflow' in step && !('skill' in step);
}

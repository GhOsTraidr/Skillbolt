/**
 * Workflow definition types
 */

import type { ErrorStrategy } from './error.js';
import type { WorkflowStep } from './step.js';

/**
 * Input type definition for workflow inputs
 */
export type InputType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * Input definition for workflow
 */
export interface InputDefinition {
  /** Type of the input */
  type: InputType;
  /** Description of the input */
  description?: string;
  /** Default value */
  default?: unknown;
  /** Whether the input is required */
  required?: boolean;
}

/**
 * Output definition for workflow
 */
export interface OutputDefinition {
  /** Type of the output */
  type: InputType;
  /** Description of the output */
  description?: string;
  /** Reference to the value (e.g., ${step.output}) */
  value: string;
}

/**
 * Main workflow definition
 */
export interface Workflow {
  /** Unique name of the workflow */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Semantic version */
  version?: string;
  /** Author information */
  author?: string;
  /** Workflow input definitions */
  inputs?: Record<string, InputDefinition | InputType>;
  /** Workflow output definitions */
  outputs?: Record<string, OutputDefinition | string>;
  /** Workflow steps */
  steps: WorkflowStep[];
  /** Global error handling strategy */
  onError?: ErrorStrategy;
  /** Workflow metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow file with source information
 */
export interface WorkflowFile {
  /** File path */
  path: string;
  /** Parsed workflow */
  workflow: Workflow;
  /** Raw YAML content */
  raw: string;
}

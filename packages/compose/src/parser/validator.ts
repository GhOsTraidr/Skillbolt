import Ajv, { type ErrorObject } from 'ajv';
import type { Workflow } from '../types/workflow.js';
import type { WorkflowStep } from '../types/step.js';

const ajv = new Ajv({ allErrors: true });

const stepSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string' },
    description: { type: 'string' },
    timeout: { type: 'number', minimum: 0 },
    when: { type: 'string' },
    skill: { type: 'string' },
    inputs: { type: 'object' },
    outputs: { type: 'object' },
    parallel: { type: 'array' },
    maxConcurrency: { type: 'number', minimum: 1 },
    failureStrategy: { type: 'string', enum: ['fail-fast', 'wait-all'] },
    condition: {
      type: 'object',
      required: ['if', 'then'],
      properties: {
        if: { type: 'string' },
        then: {},
        else: {},
      },
    },
    foreach: {
      type: 'object',
      required: ['items', 'as', 'step'],
      properties: {
        items: { type: 'string' },
        as: { type: 'string' },
        index: { type: 'string' },
        step: {},
        maxConcurrency: { type: 'number', minimum: 1 },
      },
    },
    while: {
      type: 'object',
      required: ['condition', 'step'],
      properties: {
        condition: { type: 'string' },
        maxIterations: { type: 'number', minimum: 1 },
        step: {},
      },
    },
    workflow: { type: 'string' },
    onError: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['fail', 'continue', 'retry'] },
        retry: {
          type: 'object',
          properties: {
            maxRetries: { type: 'number', minimum: 1 },
            initialDelay: { type: 'number', minimum: 0 },
            maxDelay: { type: 'number', minimum: 0 },
            multiplier: { type: 'number', minimum: 1 },
            exponential: { type: 'boolean' },
          },
        },
        fallback: {},
        onErrorSteps: { type: 'array', items: { type: 'string' } },
        finally: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

const workflowSchema = {
  type: 'object',
  required: ['name', 'steps'],
  properties: {
    name: { type: 'string', minLength: 1, pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$' },
    description: { type: 'string' },
    version: { type: 'string' },
    author: { type: 'string' },
    inputs: { type: 'object' },
    outputs: { type: 'object' },
    steps: {
      type: 'array',
      minItems: 1,
      items: stepSchema,
    },
    onError: stepSchema.properties.onError,
    metadata: { type: 'object' },
  },
};

const validateWorkflowSchema = ajv.compile(workflowSchema);

export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function collectStepIds(steps: WorkflowStep[]): Set<string> {
  const ids = new Set<string>();

  function traverse(step: WorkflowStep): void {
    ids.add(step.id);

    if ('parallel' in step) {
      step.parallel.forEach(traverse);
    } else if ('condition' in step) {
      const thenSteps = Array.isArray(step.condition.then)
        ? step.condition.then
        : [step.condition.then];
      thenSteps.forEach(traverse);

      if (step.condition.else) {
        const elseSteps = Array.isArray(step.condition.else)
          ? step.condition.else
          : [step.condition.else];
        elseSteps.forEach(traverse);
      }
    } else if ('foreach' in step) {
      const foreachSteps = Array.isArray(step.foreach.step)
        ? step.foreach.step
        : [step.foreach.step];
      foreachSteps.forEach(traverse);
    } else if ('while' in step) {
      const whileSteps = Array.isArray(step.while.step) ? step.while.step : [step.while.step];
      whileSteps.forEach(traverse);
    }
  }

  steps.forEach(traverse);
  return ids;
}

function validateStepReferences(workflow: Workflow): ValidationError[] {
  const errors: ValidationError[] = [];
  const stepIds = collectStepIds(workflow.steps);

  function checkVariableReferences(value: unknown, path: string): void {
    if (typeof value === 'string') {
      const matches = value.matchAll(/\$\{([^}]+)\}/g);
      for (const match of matches) {
        const expr = match[1]!;
        const parts = expr.split('.');
        const firstPart = parts[0];

        if (firstPart && firstPart !== 'inputs' && firstPart !== 'env' && !stepIds.has(firstPart)) {
          const knownPrefixes = ['inputs', 'env', 'item', 'index'];
          if (!knownPrefixes.includes(firstPart)) {
            errors.push({
              path,
              message: `Unknown step reference: ${firstPart}`,
            });
          }
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkVariableReferences(item, `${path}[${index}]`);
      });
    } else if (value !== null && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        checkVariableReferences(val, `${path}.${key}`);
      }
    }
  }

  function traverseSteps(steps: WorkflowStep[], basePath: string): void {
    steps.forEach((step, index) => {
      const stepPath = `${basePath}[${index}]`;

      if ('inputs' in step && step.inputs) {
        checkVariableReferences(step.inputs, `${stepPath}.inputs`);
      }

      if ('parallel' in step) {
        traverseSteps(step.parallel, `${stepPath}.parallel`);
      } else if ('condition' in step) {
        checkVariableReferences(step.condition.if, `${stepPath}.condition.if`);
        const thenSteps = Array.isArray(step.condition.then)
          ? step.condition.then
          : [step.condition.then];
        traverseSteps(thenSteps, `${stepPath}.condition.then`);

        if (step.condition.else) {
          const elseSteps = Array.isArray(step.condition.else)
            ? step.condition.else
            : [step.condition.else];
          traverseSteps(elseSteps, `${stepPath}.condition.else`);
        }
      } else if ('foreach' in step) {
        checkVariableReferences(step.foreach.items, `${stepPath}.foreach.items`);
        const foreachSteps = Array.isArray(step.foreach.step)
          ? step.foreach.step
          : [step.foreach.step];
        traverseSteps(foreachSteps, `${stepPath}.foreach.step`);
      } else if ('while' in step) {
        checkVariableReferences(step.while.condition, `${stepPath}.while.condition`);
        const whileSteps = Array.isArray(step.while.step) ? step.while.step : [step.while.step];
        traverseSteps(whileSteps, `${stepPath}.while.step`);
      }
    });
  }

  traverseSteps(workflow.steps, 'steps');
  return errors;
}

function validateDuplicateIds(workflow: Workflow): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Map<string, string>();

  function traverse(step: WorkflowStep, path: string): void {
    if (seenIds.has(step.id)) {
      errors.push({
        path,
        message: `Duplicate step ID: ${step.id} (first seen at ${seenIds.get(step.id)})`,
      });
    } else {
      seenIds.set(step.id, path);
    }

    if ('parallel' in step) {
      step.parallel.forEach((s, i) => traverse(s, `${path}.parallel[${i}]`));
    } else if ('condition' in step) {
      const thenSteps = Array.isArray(step.condition.then)
        ? step.condition.then
        : [step.condition.then];
      thenSteps.forEach((s, i) => traverse(s, `${path}.condition.then[${i}]`));

      if (step.condition.else) {
        const elseSteps = Array.isArray(step.condition.else)
          ? step.condition.else
          : [step.condition.else];
        elseSteps.forEach((s, i) => traverse(s, `${path}.condition.else[${i}]`));
      }
    } else if ('foreach' in step) {
      const foreachSteps = Array.isArray(step.foreach.step)
        ? step.foreach.step
        : [step.foreach.step];
      foreachSteps.forEach((s, i) => traverse(s, `${path}.foreach.step[${i}]`));
    } else if ('while' in step) {
      const whileSteps = Array.isArray(step.while.step) ? step.while.step : [step.while.step];
      whileSteps.forEach((s, i) => traverse(s, `${path}.while.step[${i}]`));
    }
  }

  workflow.steps.forEach((step, i) => traverse(step, `steps[${i}]`));
  return errors;
}

function validateStepType(workflow: Workflow): ValidationError[] {
  const errors: ValidationError[] = [];

  function traverse(step: WorkflowStep, path: string): void {
    const hasSkill = 'skill' in step;
    const hasParallel = 'parallel' in step;
    const hasCondition = 'condition' in step;
    const hasForeach = 'foreach' in step;
    const hasWhile = 'while' in step;
    const hasWorkflow = 'workflow' in step && !hasSkill;

    const typeCount = [
      hasSkill,
      hasParallel,
      hasCondition,
      hasForeach,
      hasWhile,
      hasWorkflow,
    ].filter(Boolean).length;

    if (typeCount === 0) {
      errors.push({
        path,
        message: 'Step must have one of: skill, parallel, condition, foreach, while, or workflow',
      });
    } else if (typeCount > 1) {
      errors.push({
        path,
        message:
          'Step can only have one of: skill, parallel, condition, foreach, while, or workflow',
      });
    }

    if ('parallel' in step) {
      step.parallel.forEach((s, i) => traverse(s, `${path}.parallel[${i}]`));
    } else if ('condition' in step) {
      const thenSteps = Array.isArray(step.condition.then)
        ? step.condition.then
        : [step.condition.then];
      thenSteps.forEach((s, i) => traverse(s, `${path}.condition.then[${i}]`));

      if (step.condition.else) {
        const elseSteps = Array.isArray(step.condition.else)
          ? step.condition.else
          : [step.condition.else];
        elseSteps.forEach((s, i) => traverse(s, `${path}.condition.else[${i}]`));
      }
    } else if ('foreach' in step) {
      const foreachSteps = Array.isArray(step.foreach.step)
        ? step.foreach.step
        : [step.foreach.step];
      foreachSteps.forEach((s, i) => traverse(s, `${path}.foreach.step[${i}]`));
    } else if ('while' in step) {
      const whileSteps = Array.isArray(step.while.step) ? step.while.step : [step.while.step];
      whileSteps.forEach((s, i) => traverse(s, `${path}.while.step[${i}]`));
    }
  }

  workflow.steps.forEach((step, i) => traverse(step, `steps[${i}]`));
  return errors;
}

export function validateWorkflow(workflow: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  const valid = validateWorkflowSchema(workflow);

  if (!valid && validateWorkflowSchema.errors) {
    for (const error of validateWorkflowSchema.errors as ErrorObject[]) {
      errors.push({
        path: (error as ErrorObject & { instancePath?: string }).instancePath || '/',
        message: error.message || 'Unknown validation error',
        keyword: error.keyword,
      });
    }
    return { valid: false, errors };
  }

  const w = workflow as Workflow;
  errors.push(...validateDuplicateIds(w));
  errors.push(...validateStepType(w));
  errors.push(...validateStepReferences(w));

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getWorkflowSchema(): object {
  return workflowSchema;
}

import { describe, it, expect } from 'vitest';
import {
  parseWorkflowString,
  validateWorkflow,
  interpolateString,
  interpolateValue,
  resolveVariable,
  parseVariableExpression,
  hasVariables,
  extractVariables,
} from '../src/index.js';

describe('YAML Parser', () => {
  it('should parse a simple workflow', () => {
    const yaml = `
name: test-workflow
description: A test workflow
version: 1.0.0
steps:
  - id: step1
    skill: my-skill
    inputs:
      message: hello
`;
    const result = parseWorkflowString(yaml);
    expect(result.workflow.name).toBe('test-workflow');
    expect(result.workflow.description).toBe('A test workflow');
    expect(result.workflow.version).toBe('1.0.0');
    expect(result.workflow.steps).toHaveLength(1);
    expect(result.workflow.steps[0]?.id).toBe('step1');
  });

  it('should parse workflow with parallel steps', () => {
    const yaml = `
name: parallel-workflow
steps:
  - id: parallel-block
    parallel:
      - id: task1
        skill: skill1
      - id: task2
        skill: skill2
`;
    const result = parseWorkflowString(yaml);
    expect(result.workflow.steps).toHaveLength(1);
    const parallelStep = result.workflow.steps[0] as { parallel: unknown[] };
    expect(parallelStep.parallel).toHaveLength(2);
  });

  it('should parse workflow with condition', () => {
    const yaml = `
name: condition-workflow
steps:
  - id: check
    condition:
      if: \${inputs.enabled}
      then:
        id: run-task
        skill: task-skill
      else:
        id: skip-task
        skill: skip-skill
`;
    const result = parseWorkflowString(yaml);
    expect(result.workflow.steps).toHaveLength(1);
  });

  it('should parse workflow with foreach', () => {
    const yaml = `
name: foreach-workflow
steps:
  - id: process-items
    foreach:
      items: \${inputs.items}
      as: item
      step:
        id: process
        skill: processor
        inputs:
          data: \${item}
`;
    const result = parseWorkflowString(yaml);
    expect(result.workflow.steps).toHaveLength(1);
  });

  it('should handle invalid YAML', () => {
    const yaml = `
name: test
steps:
  - id: step1
    skill: [invalid yaml structure
`;
    expect(() => parseWorkflowString(yaml, { strict: true })).toThrow();
  });
});

describe('Workflow Validation', () => {
  it('should validate a correct workflow', () => {
    const workflow = {
      name: 'valid-workflow',
      steps: [{ id: 'step1', skill: 'my-skill' }],
    };
    const result = validateWorkflow(workflow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject workflow without name', () => {
    const workflow = {
      steps: [{ id: 'step1', skill: 'my-skill' }],
    };
    const result = validateWorkflow(workflow);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message?.includes('name'))).toBe(true);
  });

  it('should reject workflow without steps', () => {
    const workflow = {
      name: 'no-steps',
    };
    const result = validateWorkflow(workflow);
    expect(result.valid).toBe(false);
  });

  it('should detect duplicate step IDs', () => {
    const workflow = {
      name: 'duplicate-ids',
      steps: [
        { id: 'step1', skill: 'skill1' },
        { id: 'step1', skill: 'skill2' },
      ],
    };
    const result = validateWorkflow(workflow);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message?.includes('Duplicate'))).toBe(true);
  });

  it('should validate step must have a type', () => {
    const workflow = {
      name: 'no-type',
      steps: [{ id: 'step1' }],
    };
    const result = validateWorkflow(workflow);
    expect(result.valid).toBe(false);
  });
});

describe('Variable Interpolation', () => {
  it('should interpolate simple variables', () => {
    const result = interpolateString('Hello ${name}!', { name: 'World' });
    expect(result.value).toBe('Hello World!');
    expect(result.hasUnresolved).toBe(false);
  });

  it('should handle nested property access', () => {
    const result = interpolateString('${user.name}', {
      user: { name: 'Alice' },
    });
    expect(result.value).toBe('Alice');
  });

  it('should handle default values', () => {
    const result = interpolateString('${missing:-default}', {});
    expect(result.value).toBe('default');
  });

  it('should preserve unresolved variables', () => {
    const result = interpolateString('Hello ${unknown}!', {});
    expect(result.value).toBe('Hello ${unknown}!');
    expect(result.hasUnresolved).toBe(true);
    expect(result.unresolvedVars).toContain('unknown');
  });

  it('should interpolate entire object', () => {
    const obj = {
      greeting: 'Hello ${name}',
      items: ['${item1}', '${item2}'],
    };
    const result = interpolateValue(obj, {
      name: 'World',
      item1: 'first',
      item2: 'second',
    });
    expect(result.value).toEqual({
      greeting: 'Hello World',
      items: ['first', 'second'],
    });
  });

  it('should return non-string value for single variable', () => {
    const result = interpolateString('${count}', { count: 42 });
    expect(result.value).toBe(42);
  });
});

describe('parseVariableExpression', () => {
  it('should parse simple path', () => {
    const result = parseVariableExpression('inputs.name');
    expect(result.path).toBe('inputs.name');
    expect(result.defaultValue).toBeUndefined();
  });

  it('should parse path with default', () => {
    const result = parseVariableExpression('missing:-fallback');
    expect(result.path).toBe('missing');
    expect(result.defaultValue).toBe('fallback');
  });
});

describe('resolveVariable', () => {
  it('should resolve from variables', () => {
    const value = resolveVariable('user.name', { user: { name: 'Test' } });
    expect(value).toBe('Test');
  });

  it('should resolve with default', () => {
    const value = resolveVariable('missing:-default', {});
    expect(value).toBe('default');
  });
});

describe('hasVariables', () => {
  it('should detect variables in string', () => {
    expect(hasVariables('Hello ${name}')).toBe(true);
    expect(hasVariables('No variables')).toBe(false);
  });

  it('should detect variables in nested objects', () => {
    expect(hasVariables({ nested: { value: '${var}' } })).toBe(true);
    expect(hasVariables({ nested: { value: 'static' } })).toBe(false);
  });
});

describe('extractVariables', () => {
  it('should extract variable names', () => {
    const vars = extractVariables('${a} and ${b.c} and ${d:-default}');
    expect(vars).toEqual(['a', 'b.c', 'd']);
  });
});

import { describe, it, expect, vi } from 'vitest';
import {
  createExecutor,
  executeWorkflow,
  createExecutionContext,
  evaluateCondition,
} from '../src/index.js';
import type { Workflow, SkillExecutor, ExecutionContext } from '../src/index.js';

describe('ExecutionContext', () => {
  const mockWorkflow: Workflow = {
    name: 'test',
    steps: [],
  };

  it('should initialize with inputs', () => {
    const context = createExecutionContext(mockWorkflow, {
      inputs: { foo: 'bar' },
    });
    expect(context.getVariable('inputs.foo')).toBe('bar');
  });

  it('should manage variable scopes', () => {
    const context = createExecutionContext(mockWorkflow);

    context.setVariable('outer', 'value1');
    expect(context.getVariable('outer')).toBe('value1');

    context.pushScope('step', 'step1');
    context.setVariable('inner', 'value2');
    expect(context.getVariable('inner')).toBe('value2');
    expect(context.getVariable('outer')).toBe('value1');

    context.popScope();
    expect(context.getVariable('inner')).toBeUndefined();
    expect(context.getVariable('outer')).toBe('value1');
  });

  it('should track step results', () => {
    const context = createExecutionContext(mockWorkflow);

    context.setStepResult('step1', {
      stepId: 'step1',
      status: 'completed',
      outputs: { result: 'success' },
      startTime: 0,
      endTime: 100,
      duration: 100,
    });

    const result = context.getStepResult('step1');
    expect(result?.outputs).toEqual({ result: 'success' });
    expect(context.getVariable('step1.result')).toBe('success');
  });

  it('should support cancellation', () => {
    const context = createExecutionContext(mockWorkflow);
    expect(context.isCancelled()).toBe(false);

    context.cancel();
    expect(context.isCancelled()).toBe(true);
  });
});

describe('evaluateCondition', () => {
  const mockWorkflow: Workflow = { name: 'test', steps: [] };

  it('should evaluate boolean values', async () => {
    const context = createExecutionContext(mockWorkflow, {
      inputs: { enabled: true },
    });

    expect(await evaluateCondition('${inputs.enabled}', context)).toBe(true);
  });

  it('should evaluate comparison operators', async () => {
    const context = createExecutionContext(mockWorkflow, {
      inputs: { count: 5 },
    });

    expect(await evaluateCondition('${inputs.count} > 3', context)).toBe(true);
    expect(await evaluateCondition('${inputs.count} < 3', context)).toBe(false);
    expect(await evaluateCondition('${inputs.count} == 5', context)).toBe(true);
    expect(await evaluateCondition('${inputs.count} != 5', context)).toBe(false);
  });

  it('should evaluate logical operators', async () => {
    const context = createExecutionContext(mockWorkflow, {
      inputs: { a: true, b: false },
    });

    expect(await evaluateCondition('${inputs.a} and ${inputs.b}', context)).toBe(false);
    expect(await evaluateCondition('${inputs.a} or ${inputs.b}', context)).toBe(true);
    expect(await evaluateCondition('not ${inputs.b}', context)).toBe(true);
  });

  it('should evaluate string literals', async () => {
    const context = createExecutionContext(mockWorkflow);
    expect(await evaluateCondition('true', context)).toBe(true);
    expect(await evaluateCondition('false', context)).toBe(false);
  });
});

describe('WorkflowExecutor', () => {
  it('should execute a simple workflow', async () => {
    const workflow: Workflow = {
      name: 'simple',
      steps: [{ id: 'step1', skill: 'echo', inputs: { message: 'hello' } }],
    };

    const skillExecutor: SkillExecutor = vi.fn().mockResolvedValue({ output: 'world' });

    const result = await executeWorkflow(workflow, { skillExecutor });

    expect(result.status).toBe('completed');
    expect(skillExecutor).toHaveBeenCalledWith('echo', { message: 'hello' }, expect.anything());
  });

  it('should pass outputs between steps', async () => {
    const workflow: Workflow = {
      name: 'chain',
      steps: [
        { id: 'step1', skill: 'first', inputs: {} },
        { id: 'step2', skill: 'second', inputs: { value: '${step1.result}' } },
      ],
    };

    const skillExecutor: SkillExecutor = vi
      .fn()
      .mockResolvedValueOnce({ result: 'from-step1' })
      .mockResolvedValueOnce({ result: 'from-step2' });

    const result = await executeWorkflow(workflow, { skillExecutor });

    expect(result.status).toBe('completed');
    expect(skillExecutor).toHaveBeenNthCalledWith(
      2,
      'second',
      { value: 'from-step1' },
      expect.anything()
    );
  });

  it('should execute parallel steps', async () => {
    const workflow: Workflow = {
      name: 'parallel',
      steps: [
        {
          id: 'parallel-block',
          parallel: [
            { id: 'p1', skill: 'task1' },
            { id: 'p2', skill: 'task2' },
          ],
        },
      ],
    };

    const executionOrder: string[] = [];
    const skillExecutor: SkillExecutor = vi.fn().mockImplementation(async (name: string) => {
      executionOrder.push(name);
      await new Promise((r) => setTimeout(r, 10));
      return { done: true };
    });

    const result = await executeWorkflow(workflow, { skillExecutor });

    expect(result.status).toBe('completed');
    expect(skillExecutor).toHaveBeenCalledTimes(2);
  });

  it('should execute conditional steps', async () => {
    const workflow: Workflow = {
      name: 'conditional',
      steps: [
        {
          id: 'check',
          condition: {
            if: '${inputs.flag}',
            then: { id: 'yes', skill: 'yes-skill' },
            else: { id: 'no', skill: 'no-skill' },
          },
        },
      ],
    };

    const skillExecutor: SkillExecutor = vi.fn().mockResolvedValue({});

    const resultTrue = await executeWorkflow(workflow, {
      skillExecutor,
      inputs: { flag: true },
    });
    expect(resultTrue.status).toBe('completed');
    expect(skillExecutor).toHaveBeenCalledWith('yes-skill', {}, expect.anything());

    vi.mocked(skillExecutor).mockClear();

    const resultFalse = await executeWorkflow(workflow, {
      skillExecutor,
      inputs: { flag: false },
    });
    expect(resultFalse.status).toBe('completed');
    expect(skillExecutor).toHaveBeenCalledWith('no-skill', {}, expect.anything());
  });

  it('should execute foreach loops', async () => {
    const workflow: Workflow = {
      name: 'foreach',
      steps: [
        {
          id: 'loop',
          foreach: {
            items: '${inputs.items}',
            as: 'item',
            step: { id: 'process', skill: 'processor', inputs: { data: '${item}' } },
          },
        },
      ],
    };

    const skillExecutor: SkillExecutor = vi.fn().mockResolvedValue({ processed: true });

    const result = await executeWorkflow(workflow, {
      skillExecutor,
      inputs: { items: ['a', 'b', 'c'] },
    });

    expect(result.status).toBe('completed');
    expect(skillExecutor).toHaveBeenCalledTimes(3);
    expect(skillExecutor).toHaveBeenCalledWith('processor', { data: 'a' }, expect.anything());
    expect(skillExecutor).toHaveBeenCalledWith('processor', { data: 'b' }, expect.anything());
    expect(skillExecutor).toHaveBeenCalledWith('processor', { data: 'c' }, expect.anything());
  });

  it('should skip steps with when condition', async () => {
    const workflow: Workflow = {
      name: 'conditional-when',
      steps: [
        { id: 'step1', skill: 'skill1', when: '${inputs.run}' },
        { id: 'step2', skill: 'skill2' },
      ],
    };

    const skillExecutor: SkillExecutor = vi.fn().mockResolvedValue({});

    const result = await executeWorkflow(workflow, {
      skillExecutor,
      inputs: { run: false },
    });

    expect(result.status).toBe('completed');
    expect(skillExecutor).toHaveBeenCalledTimes(1);
    expect(skillExecutor).toHaveBeenCalledWith('skill2', {}, expect.anything());
  });

  it('should handle step failure', async () => {
    const workflow: Workflow = {
      name: 'failure',
      steps: [{ id: 'fail', skill: 'failing-skill' }],
    };

    const skillExecutor: SkillExecutor = vi.fn().mockRejectedValue(new Error('Skill failed'));

    const result = await executeWorkflow(workflow, { skillExecutor });

    expect(result.status).toBe('failed');
    expect(result.error?.message).toBe('Skill failed');
  });

  it('should retry on failure', async () => {
    const workflow: Workflow = {
      name: 'retry',
      steps: [
        {
          id: 'flaky',
          skill: 'flaky-skill',
          onError: {
            action: 'retry',
            retry: { maxRetries: 2, initialDelay: 10 },
          },
        },
      ],
    };

    let attempts = 0;
    const skillExecutor: SkillExecutor = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Temporary failure');
      }
      return { success: true };
    });

    const result = await executeWorkflow(workflow, { skillExecutor });

    expect(result.status).toBe('completed');
    expect(attempts).toBe(2);
  });

  it('should continue on error when configured', async () => {
    const workflow: Workflow = {
      name: 'continue-on-error',
      steps: [
        {
          id: 'fail',
          skill: 'failing-skill',
          onError: { action: 'continue', fallback: 'default-value' },
        },
        { id: 'next', skill: 'next-skill' },
      ],
    };

    const skillExecutor: SkillExecutor = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({ done: true });

    const result = await executeWorkflow(workflow, { skillExecutor });

    expect(result.status).toBe('completed');
    expect(skillExecutor).toHaveBeenCalledTimes(2);
  });

  it('should support cancellation', async () => {
    const workflow: Workflow = {
      name: 'cancelable',
      steps: [
        { id: 'slow', skill: 'slow-skill' },
        { id: 'never', skill: 'never-skill' },
      ],
    };

    const skillExecutor: SkillExecutor = vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 100));
      return {};
    });

    const executor = createExecutor(workflow, { skillExecutor });

    setTimeout(() => executor.cancel(), 50);

    const result = await executor.execute();
    expect(result.steps.length).toBeLessThanOrEqual(2);
  });

  it('should call event handlers', async () => {
    const workflow: Workflow = {
      name: 'events',
      steps: [{ id: 'step1', skill: 'skill1' }],
    };

    const onStepStart = vi.fn();
    const onStepComplete = vi.fn();
    const skillExecutor: SkillExecutor = vi.fn().mockResolvedValue({});

    await executeWorkflow(workflow, {
      skillExecutor,
      onStepStart,
      onStepComplete,
    });

    expect(onStepStart).toHaveBeenCalled();
    expect(onStepComplete).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { generatePlans, ExecutionThrottler } from '../../src/dag/index.js';
import type { LLMAdapter } from '@skillbolt/core';

describe('generatePlans', () => {
  it('returns ClaudeDirect node for 0 skills without LLM call', async () => {
    const mockLLM = { complete: vi.fn() } as unknown as LLMAdapter;

    const result = await generatePlans({
      task: 'Do something',
      skills: [],
      llm: mockLLM,
    });

    expect(result.plans).toHaveLength(1);
    expect(result.plans[0].nodes[0].name).toBe('ClaudeDirect');
    expect(mockLLM.complete).not.toHaveBeenCalled();
  });

  it('returns single node plan for 1 skill without LLM call', async () => {
    const mockLLM = { complete: vi.fn() } as unknown as LLMAdapter;

    const result = await generatePlans({
      task: 'Do something',
      skills: [{ name: 'my-skill', description: 'A skill', content: '' }],
      llm: mockLLM,
    });

    expect(result.plans).toHaveLength(1);
    expect(result.plans[0].nodes[0].name).toBe('my-skill');
    expect(mockLLM.complete).not.toHaveBeenCalled();
  });

  it('calls LLM for 2+ skills', async () => {
    const mockLLM = { complete: vi.fn() } as unknown as LLMAdapter;
    vi.mocked(mockLLM.complete).mockResolvedValue(
      JSON.stringify({
        plans: [
          {
            name: 'Test Plan',
            description: 'desc',
            nodes: [{ id: 'n1', name: 'skill-a', depends_on: [], purpose: 'do stuff' }],
          },
        ],
      })
    );

    const result = await generatePlans({
      task: 'Do something',
      skills: [
        { name: 'skill-a', description: 'Skill A', content: '' },
        { name: 'skill-b', description: 'Skill B', content: '' },
      ],
      llm: mockLLM,
    });

    expect(mockLLM.complete).toHaveBeenCalled();
    expect(result.plans).toHaveLength(1);
  });

  it('parses valid LLM response with plans array', async () => {
    const mockLLM = { complete: vi.fn() } as unknown as LLMAdapter;
    vi.mocked(mockLLM.complete).mockResolvedValue(
      JSON.stringify({
        plans: [
          {
            name: 'Plan 1',
            description: 'First plan',
            nodes: [
              { id: 'n1', name: 'skill-a', depends_on: [], purpose: 'step 1' },
              { id: 'n2', name: 'skill-b', depends_on: ['n1'], purpose: 'step 2' },
            ],
          },
          {
            name: 'Plan 2',
            description: 'Second plan',
            nodes: [{ id: 'n3', name: 'skill-c', depends_on: [], purpose: 'alternative' }],
          },
        ],
      })
    );

    const result = await generatePlans({
      task: 'Do something',
      skills: [
        { name: 'skill-a', description: 'Skill A', content: '' },
        { name: 'skill-b', description: 'Skill B', content: '' },
        { name: 'skill-c', description: 'Skill C', content: '' },
      ],
      llm: mockLLM,
    });

    expect(result.plans).toHaveLength(2);
    expect(result.plans[0].name).toBe('Plan 1');
    expect(result.plans[0].nodes).toHaveLength(2);
    expect(result.plans[1].name).toBe('Plan 2');
    expect(result.plans[1].nodes).toHaveLength(1);
  });

  it('handles invalid JSON response', async () => {
    const mockLLM = { complete: vi.fn() } as unknown as LLMAdapter;
    vi.mocked(mockLLM.complete).mockResolvedValue('not valid json {]');

    const result = await generatePlans({
      task: 'Do something',
      skills: [
        { name: 'skill-a', description: 'Skill A', content: '' },
        { name: 'skill-b', description: 'Skill B', content: '' },
      ],
      llm: mockLLM,
    });

    expect(result.error).toBeDefined();
    expect(result.plans).toHaveLength(0);
  });

  it('handles missing plans field in response', async () => {
    const mockLLM = { complete: vi.fn() } as unknown as LLMAdapter;
    vi.mocked(mockLLM.complete).mockResolvedValue(JSON.stringify({ data: [] }));

    const result = await generatePlans({
      task: 'Do something',
      skills: [
        { name: 'skill-a', description: 'Skill A', content: '' },
        { name: 'skill-b', description: 'Skill B', content: '' },
      ],
      llm: mockLLM,
    });

    expect(result.error).toBeDefined();
    expect(result.error).toContain('plans');
    expect(result.plans).toHaveLength(0);
  });

  it('handles LLM error', async () => {
    const mockLLM = { complete: vi.fn() } as unknown as LLMAdapter;
    vi.mocked(mockLLM.complete).mockRejectedValue(new Error('LLM service unavailable'));

    const result = await generatePlans({
      task: 'Do something',
      skills: [
        { name: 'skill-a', description: 'Skill A', content: '' },
        { name: 'skill-b', description: 'Skill B', content: '' },
      ],
      llm: mockLLM,
    });

    expect(result.error).toBeDefined();
    expect(result.error).toContain('Planner request failed');
    expect(result.plans).toHaveLength(0);
  });
});

describe('ExecutionThrottler', () => {
  it('executes all tasks and returns results', async () => {
    const throttler = new ExecutionThrottler(2);

    const task1 = vi.fn(async () => 'result1');
    const task2 = vi.fn(async () => 'result2');
    const task3 = vi.fn(async () => 'result3');

    const results = await throttler.executeBatch([task1, task2, task3]);

    expect(results).toEqual(['result1', 'result2', 'result3']);
    expect(task1).toHaveBeenCalled();
    expect(task2).toHaveBeenCalled();
    expect(task3).toHaveBeenCalled();
  });

  it('respects concurrency limit', async () => {
    const throttler = new ExecutionThrottler(2);
    const executionTimes: number[] = [];
    let concurrentCount = 0;
    let maxConcurrent = 0;

    const createTask = (id: number) => async () => {
      concurrentCount += 1;
      maxConcurrent = Math.max(maxConcurrent, concurrentCount);
      executionTimes.push(Date.now());

      await new Promise((resolve) => setTimeout(resolve, 50));

      concurrentCount -= 1;
    };

    const tasks = [createTask(1), createTask(2), createTask(3), createTask(4)];

    await throttler.executeBatch(tasks);

    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('handles task errors gracefully', async () => {
    const throttler = new ExecutionThrottler(2);

    const task1 = vi.fn(async () => 'result1');
    const task2 = vi.fn(async () => {
      throw new Error('Task failed');
    });
    const task3 = vi.fn(async () => 'result3');

    await expect(throttler.executeBatch([task1, task2, task3])).rejects.toThrow('Task failed');
  });

  it('executes tasks with different concurrency limits', async () => {
    const throttler1 = new ExecutionThrottler(1);
    const throttler3 = new ExecutionThrottler(3);

    const tasks = [vi.fn(async () => 'a'), vi.fn(async () => 'b'), vi.fn(async () => 'c')];

    const results1 = await throttler1.executeBatch(tasks);
    expect(results1).toEqual(['a', 'b', 'c']);

    const results3 = await throttler3.executeBatch(tasks);
    expect(results3).toEqual(['a', 'b', 'c']);
  });
});

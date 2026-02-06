import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ExecutionMetricsStore } from '../src/execution/index.js';
import type { ExecutionMetrics } from '../src/execution/index.js';

const TEST_FILE = join(process.cwd(), '.test-metrics-' + Date.now() + '.jsonl');

afterEach(() => {
  if (existsSync(TEST_FILE)) rmSync(TEST_FILE, { force: true });
});

function createMetrics(overrides?: Partial<ExecutionMetrics>): ExecutionMetrics {
  return {
    runId: 'test-run-' + Date.now(),
    task: 'test task',
    mode: 'dag',
    skills: ['skill-a'],
    totalDurationMs: 5000,
    nodeDurations: { 'node-1': 3000 },
    llmCalls: 2,
    totalTokens: { prompt: 1000, completion: 500 },
    estimatedCostUsd: 0.01,
    timestamp: new Date().toISOString(),
    status: 'completed',
    ...overrides,
  };
}

describe('ExecutionMetricsStore', () => {
  it('append writes to file', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);
    const metrics = createMetrics();

    store.append(metrics);

    expect(existsSync(TEST_FILE)).toBe(true);
  });

  it('list returns empty array when file does not exist', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);
    const entries = store.list();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries).toHaveLength(0);
  });

  it('list returns appended entries in reverse order (newest first)', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);
    const metrics1 = createMetrics({ runId: 'run-1' });
    const metrics2 = createMetrics({ runId: 'run-2' });
    const metrics3 = createMetrics({ runId: 'run-3' });

    store.append(metrics1);
    store.append(metrics2);
    store.append(metrics3);

    const entries = store.list();

    expect(entries).toHaveLength(3);
    expect(entries[0].runId).toBe('run-3');
    expect(entries[1].runId).toBe('run-2');
    expect(entries[2].runId).toBe('run-1');
  });

  it('list with last=2 returns only 2 entries', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);
    const metrics1 = createMetrics({ runId: 'run-1' });
    const metrics2 = createMetrics({ runId: 'run-2' });
    const metrics3 = createMetrics({ runId: 'run-3' });

    store.append(metrics1);
    store.append(metrics2);
    store.append(metrics3);

    const entries = store.list({ last: 2 });

    expect(entries).toHaveLength(2);
    expect(entries[0].runId).toBe('run-3');
    expect(entries[1].runId).toBe('run-2');
  });

  it('getByRunId finds specific entry', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);
    const metrics1 = createMetrics({ runId: 'run-1' });
    const metrics2 = createMetrics({ runId: 'run-2' });

    store.append(metrics1);
    store.append(metrics2);

    const found = store.getByRunId('run-1');

    expect(found).not.toBeNull();
    expect(found?.runId).toBe('run-1');
  });

  it('getByRunId returns null for missing entry', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);
    const metrics = createMetrics({ runId: 'run-1' });

    store.append(metrics);

    const found = store.getByRunId('nonexistent');

    expect(found).toBeNull();
  });

  it('multiple appends accumulate', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);

    store.append(createMetrics({ runId: 'run-1' }));
    store.append(createMetrics({ runId: 'run-2' }));
    store.append(createMetrics({ runId: 'run-3' }));

    const entries = store.list();

    expect(entries).toHaveLength(3);
  });

  it('entries have correct shape with all fields present', () => {
    const store = new ExecutionMetricsStore(TEST_FILE);
    const metrics = createMetrics();

    store.append(metrics);

    const entries = store.list();
    const entry = entries[0];

    expect(entry).toHaveProperty('runId');
    expect(entry).toHaveProperty('task');
    expect(entry).toHaveProperty('mode');
    expect(entry).toHaveProperty('skills');
    expect(entry).toHaveProperty('totalDurationMs');
    expect(entry).toHaveProperty('nodeDurations');
    expect(entry).toHaveProperty('llmCalls');
    expect(entry).toHaveProperty('totalTokens');
    expect(entry).toHaveProperty('estimatedCostUsd');
    expect(entry).toHaveProperty('timestamp');
    expect(entry).toHaveProperty('status');
  });
});

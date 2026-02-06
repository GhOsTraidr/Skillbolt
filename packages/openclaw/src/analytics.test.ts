import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toExecutionMetrics } from './analytics.js';
import type { OpenClawExecutionEvent } from './analytics.js';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-15T10:00:00.000Z'));
});

describe('toExecutionMetrics', () => {
  const baseEvent: OpenClawExecutionEvent = {
    skillName: 'test-skill',
    agentId: 'agent-1',
    duration: 1000,
    success: true,
    tokenUsage: { input: 100, output: 50 },
    estimatedCost: 0.01,
  };

  it('produces correct metrics for a single event', () => {
    const metrics = toExecutionMetrics('run-1', 'test task', [baseEvent]);
    expect(metrics.runId).toBe('run-1');
    expect(metrics.task).toBe('test task');
    expect(metrics.mode).toBe('dag');
    expect(metrics.skills).toEqual(['test-skill']);
    expect(metrics.totalDurationMs).toBe(1000);
    expect(metrics.llmCalls).toBe(1);
    expect(metrics.totalTokens).toEqual({ prompt: 100, completion: 50 });
    expect(metrics.estimatedCostUsd).toBe(0.01);
    expect(metrics.status).toBe('completed');
  });

  it('aggregates multiple events', () => {
    const events: OpenClawExecutionEvent[] = [
      { ...baseEvent, skillName: 'a', duration: 500, tokenUsage: { input: 10, output: 20 }, estimatedCost: 0.005 },
      { ...baseEvent, skillName: 'b', duration: 300, tokenUsage: { input: 30, output: 40 }, estimatedCost: 0.01 },
    ];
    const metrics = toExecutionMetrics('run-2', 'multi', events);
    expect(metrics.totalDurationMs).toBe(800);
    expect(metrics.totalTokens).toEqual({ prompt: 40, completion: 60 });
    expect(metrics.estimatedCostUsd).toBeCloseTo(0.015);
    expect(metrics.llmCalls).toBe(2);
    expect(metrics.skills).toEqual(['a', 'b']);
  });

  it('handles events with no token usage', () => {
    const events: OpenClawExecutionEvent[] = [
      { skillName: 'x', agentId: 'a', duration: 100, success: true },
    ];
    const metrics = toExecutionMetrics('run-3', 't', events);
    expect(metrics.totalTokens).toEqual({ prompt: 0, completion: 0 });
    expect(metrics.estimatedCostUsd).toBe(0);
  });

  it('status is failed when all events fail', () => {
    const events: OpenClawExecutionEvent[] = [
      { ...baseEvent, success: false, errorMessage: 'err1' },
      { ...baseEvent, skillName: 'b', success: false, errorMessage: 'err2' },
    ];
    const metrics = toExecutionMetrics('run-4', 't', events);
    expect(metrics.status).toBe('failed');
  });

  it('status is partial when some events fail', () => {
    const events: OpenClawExecutionEvent[] = [
      { ...baseEvent, success: true },
      { ...baseEvent, skillName: 'b', success: false },
    ];
    const metrics = toExecutionMetrics('run-5', 't', events);
    expect(metrics.status).toBe('partial');
  });

  it('status is completed when all events succeed', () => {
    const metrics = toExecutionMetrics('run-6', 't', [baseEvent]);
    expect(metrics.status).toBe('completed');
  });

  it('builds nodeDurations map', () => {
    const events: OpenClawExecutionEvent[] = [
      { ...baseEvent, skillName: 'a', duration: 100 },
      { ...baseEvent, skillName: 'b', duration: 200 },
    ];
    const metrics = toExecutionMetrics('run-7', 't', events);
    expect(metrics.nodeDurations).toEqual({ a: 100, b: 200 });
  });

  it('includes timestamp', () => {
    const metrics = toExecutionMetrics('run-8', 't', [baseEvent]);
    expect(metrics.timestamp).toBe('2026-01-15T10:00:00.000Z');
  });

  it('handles empty events array', () => {
    const metrics = toExecutionMetrics('run-9', 't', []);
    expect(metrics.totalDurationMs).toBe(0);
    expect(metrics.llmCalls).toBe(0);
    expect(metrics.skills).toEqual([]);
    expect(metrics.status).toBe('completed');
  });
});

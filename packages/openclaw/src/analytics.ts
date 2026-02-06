import type { ExecutionMetrics } from '@skillbolt/analytics';

export interface OpenClawExecutionEvent {
  skillName: string;
  agentId: string;
  channel?: string;
  duration: number;
  success: boolean;
  tokenUsage?: { input: number; output: number };
  estimatedCost?: number;
  errorMessage?: string;
}

export function toExecutionMetrics(
  runId: string,
  task: string,
  events: OpenClawExecutionEvent[]
): ExecutionMetrics {
  const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);
  const totalTokens = events.reduce(
    (acc, e) => ({
      prompt: acc.prompt + (e.tokenUsage?.input ?? 0),
      completion: acc.completion + (e.tokenUsage?.output ?? 0),
    }),
    { prompt: 0, completion: 0 }
  );
  const totalCost = events.reduce((sum, e) => sum + (e.estimatedCost ?? 0), 0);
  const allSuccess = events.every((e) => e.success);
  const anySuccess = events.some((e) => e.success);

  const nodeDurations: Record<string, number> = {};
  for (const event of events) {
    nodeDurations[event.skillName] = event.duration;
  }

  return {
    runId,
    task,
    mode: 'dag',
    skills: events.map((e) => e.skillName),
    totalDurationMs: totalDuration,
    nodeDurations,
    llmCalls: events.length,
    totalTokens,
    estimatedCostUsd: totalCost,
    timestamp: new Date().toISOString(),
    status: allSuccess ? 'completed' : anySuccess ? 'partial' : 'failed',
  };
}

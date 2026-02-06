export interface ExecutionMetrics {
  runId: string;
  task: string;
  mode: 'dag' | 'freestyle' | 'direct' | 'baseline';
  skills: string[];
  totalDurationMs: number;
  nodeDurations: Record<string, number>;
  llmCalls: number;
  totalTokens: { prompt: number; completion: number };
  estimatedCostUsd: number;
  timestamp: string;
  status: 'completed' | 'partial' | 'failed';
}

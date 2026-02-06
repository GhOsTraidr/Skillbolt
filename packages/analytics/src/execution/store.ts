import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import type { ExecutionMetrics } from './types.js';

const DEFAULT_METRICS_PATH = join(homedir(), '.skill-kit', 'analytics', 'executions.jsonl');

export class ExecutionMetricsStore {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || DEFAULT_METRICS_PATH;
  }

  append(metrics: ExecutionMetrics): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(this.filePath, JSON.stringify(metrics) + '\n', 'utf8');
  }

  list(options?: { last?: number }): ExecutionMetrics[] {
    if (!existsSync(this.filePath)) return [];
    const lines = readFileSync(this.filePath, 'utf8').trim().split('\n').filter(Boolean);
    const entries = lines
      .map((line) => {
        try {
          return JSON.parse(line) as ExecutionMetrics;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is ExecutionMetrics => entry !== null);
    entries.reverse();
    if (options?.last) return entries.slice(0, options.last);
    return entries;
  }

  getByRunId(runId: string): ExecutionMetrics | null {
    const all = this.list();
    return all.find((entry) => entry.runId === runId) ?? null;
  }
}

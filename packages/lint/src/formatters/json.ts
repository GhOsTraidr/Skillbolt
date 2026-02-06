import type { LintResult } from '../types/index.js';

export function jsonFormatter(results: LintResult[]): string {
  return JSON.stringify(results, null, 2);
}

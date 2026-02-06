import type { LintResult } from '../types/index.js';

export function githubFormatter(results: LintResult[]): string {
  const lines: string[] = [];

  for (const result of results) {
    for (const message of result.messages) {
      const level = message.severity === 2 ? 'error' : 'warning';
      const endLine = message.endLine ?? message.line;
      const endColumn = message.endColumn ?? message.column;

      lines.push(
        `::${level} file=${result.filePath},line=${message.line},col=${message.column},endLine=${endLine},endColumn=${endColumn}::${message.ruleId}: ${message.message}`
      );
    }
  }

  return lines.join('\n');
}

import type { LintResult } from '../types/index.js';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

export function stylishFormatter(results: LintResult[]): string {
  const lines: string[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    if (result.messages.length === 0) continue;

    lines.push('');
    lines.push(`${COLORS.cyan}${COLORS.bold}${result.filePath}${COLORS.reset}`);

    for (const message of result.messages) {
      const severity =
        message.severity === 2
          ? `${COLORS.red}error${COLORS.reset}`
          : `${COLORS.yellow}warning${COLORS.reset}`;

      const position = `${COLORS.dim}${message.line}:${message.column}${COLORS.reset}`;
      const ruleId = `${COLORS.dim}${message.ruleId}${COLORS.reset}`;

      lines.push(`  ${position}  ${severity}  ${message.message}  ${ruleId}`);

      if (message.severity === 2) {
        totalErrors++;
      } else {
        totalWarnings++;
      }
    }

    totalErrors += result.errorCount;
    totalWarnings += result.warningCount;
  }

  if (totalErrors > 0 || totalWarnings > 0) {
    lines.push('');
    const summary: string[] = [];

    if (totalErrors > 0) {
      summary.push(
        `${COLORS.red}${totalErrors} error${totalErrors === 1 ? '' : 's'}${COLORS.reset}`
      );
    }

    if (totalWarnings > 0) {
      summary.push(
        `${COLORS.yellow}${totalWarnings} warning${totalWarnings === 1 ? '' : 's'}${COLORS.reset}`
      );
    }

    lines.push(`${COLORS.bold}${summary.join(' and ')}${COLORS.reset}`);
  }

  return lines.join('\n');
}

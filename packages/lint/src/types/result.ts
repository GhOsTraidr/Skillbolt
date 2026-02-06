import type { FixInfo } from './rule.js';

export interface LintMessage {
  ruleId: string;
  severity: 1 | 2; // 1 = warn, 2 = error
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  fix?: FixInfo;
}

export interface LintResult {
  filePath: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
}

export interface FixResult {
  fixed: boolean;
  output: string;
  messages: LintMessage[];
}

export interface LintSummary {
  totalFiles: number;
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

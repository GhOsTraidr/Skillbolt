import type { Command } from 'commander';
import { existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface LintModule {
  Linter: new (options: { config: unknown; cwd: string }) => {
    lintFiles: (patterns: string[]) => Promise<LintResult[]>;
    fixFile: (path: string) => Promise<{ messages: LintMessage[]; output: string }>;
    fixContent: (content: string, path: string) => Promise<{ output: string }>;
  };
  loadLintConfig: (
    configPath: string | undefined,
    cwd: string
  ) => Promise<{ config: unknown } | null>;
  getResolvedConfig: (config: unknown) => unknown;
  getFormatter: (name: string) => (results: LintResult[]) => string;
}

interface LintMessage {
  severity: number;
}

interface LintResult {
  filePath: string;
  source?: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

interface LintOptions {
  config?: string;
  format: string;
  fix?: boolean;
  dryRun?: boolean;
  color?: boolean;
  maxWarnings: string;
}

export function registerLintCommand(program: Command): void {
  program
    .command('lint [patterns...]')
    .description('Lint SKILL.md files for format, style, and best practices')
    .option('-c, --config <path>', 'Path to config file')
    .option('-f, --format <format>', 'Output format: stylish, json, github', 'stylish')
    .option('--fix', 'Automatically fix problems')
    .option('--dry-run', 'Show what would be fixed without making changes')
    .option('--no-color', 'Disable colored output')
    .option('--max-warnings <number>', 'Number of warnings to trigger nonzero exit code', '-1')
    .action(async (patterns: string[], options: LintOptions) => {
      const result = await loadCommandPackage<LintModule>('lint');

      if (!result.success || !result.module) {
        handleMissingPackage('lint');
      }

      const { Linter, loadLintConfig, getResolvedConfig, getFormatter } = result.module;
      const cwd = process.cwd();
      const filePatterns =
        patterns.length > 0
          ? patterns.map((p) => {
              const resolved = resolve(cwd, p);
              if (existsSync(resolved) && statSync(resolved).isDirectory()) {
                return join(p, '**/*.md');
              }
              return p;
            })
          : ['**/SKILL.md'];

      try {
        const loaded = await loadLintConfig(options.config, cwd);
        const config = getResolvedConfig(loaded?.config);
        const linter = new Linter({ config, cwd });
        const formatter = getFormatter(options.format);

        if (options.fix) {
          const files = await linter.lintFiles(filePatterns);
          const results: LintResult[] = [];

          for (const file of files) {
            if (file.fixableErrorCount > 0 || file.fixableWarningCount > 0) {
              if (options.dryRun) {
                const fixResult = await linter.fixContent(file.source ?? '', file.filePath);
                console.log(`Would fix ${file.filePath}:`);
                console.log(fixResult.output);
                results.push(file);
              } else {
                const fixResult = await linter.fixFile(file.filePath);
                results.push({
                  ...file,
                  messages: fixResult.messages,
                  errorCount: fixResult.messages.filter((m) => m.severity === 2).length,
                  warningCount: fixResult.messages.filter((m) => m.severity === 1).length,
                  fixableErrorCount: 0,
                  fixableWarningCount: 0,
                });
              }
            } else {
              results.push(file);
            }
          }

          const output = formatter(results);
          if (output) console.log(output);
          exitWithLintResults(results, options.maxWarnings);
        } else {
          const results = await linter.lintFiles(filePatterns);
          const output = formatter(results);
          if (output) console.log(output);
          exitWithLintResults(results, options.maxWarnings);
        }
      } catch (error) {
        handleError(error);
      }
    });
}

function exitWithLintResults(results: LintResult[], maxWarningsStr: string): void {
  const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
  const maxWarnings = parseInt(maxWarningsStr, 10);

  if (totalErrors > 0) {
    process.exit(1);
  }

  if (maxWarnings >= 0 && totalWarnings > maxWarnings) {
    process.exit(1);
  }
}

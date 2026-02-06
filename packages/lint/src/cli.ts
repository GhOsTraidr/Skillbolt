#!/usr/bin/env node

import { existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Command } from 'commander';
import { Linter } from './engine/linter.js';
import { loadLintConfig, getResolvedConfig } from './config/index.js';
import { getFormatter, type FormatterName } from './formatters/index.js';

interface CLIOptions {
  config?: string;
  format: string;
  fix?: boolean;
  dryRun?: boolean;
  color?: boolean;
  maxWarnings: string;
}

const program = new Command();

program
  .name('skill-lint')
  .description('Lint SKILL.md files for format, style, and best practices')
  .version('1.0.0')
  .argument('[patterns...]', 'File patterns to lint (default: **/SKILL.md)')
  .option('-c, --config <path>', 'Path to config file')
  .option('-f, --format <format>', 'Output format: stylish, json, github', 'stylish')
  .option('--fix', 'Automatically fix problems')
  .option('--dry-run', 'Show what would be fixed without making changes')
  .option('--no-color', 'Disable colored output')
  .option('--max-warnings <number>', 'Number of warnings to trigger nonzero exit code', '-1')
  .action(async (patterns: string[], options: CLIOptions) => {
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

    const loaded = await loadLintConfig(options.config, cwd);
    const config = getResolvedConfig(loaded?.config);

    const linter = new Linter({ config, cwd });

    const formatter = getFormatter(options.format as FormatterName);

    if (options.fix) {
      const results = [];
      const files = await linter.lintFiles(filePatterns);

      for (const result of files) {
        if (result.fixableErrorCount > 0 || result.fixableWarningCount > 0) {
          if (options.dryRun) {
            const fixResult = await linter.fixContent(result.source ?? '', result.filePath);
            console.log(`Would fix ${result.filePath}:`);
            console.log(fixResult.output);
            results.push(result);
          } else {
            const fixResult = await linter.fixFile(result.filePath);
            results.push({
              ...result,
              messages: fixResult.messages,
              errorCount: fixResult.messages.filter((m) => m.severity === 2).length,
              warningCount: fixResult.messages.filter((m) => m.severity === 1).length,
              fixableErrorCount: 0,
              fixableWarningCount: 0,
            });
          }
        } else {
          results.push(result);
        }
      }

      const output = formatter(results);
      if (output) {
        console.log(output);
      }

      const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
      const maxWarnings = parseInt(options.maxWarnings, 10);
      const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

      if (totalErrors > 0) {
        process.exit(1);
      }

      if (maxWarnings >= 0 && totalWarnings > maxWarnings) {
        process.exit(1);
      }
    } else {
      const results = await linter.lintFiles(filePatterns);

      const output = formatter(results);
      if (output) {
        console.log(output);
      }

      const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
      const maxWarnings = parseInt(options.maxWarnings, 10);
      const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);

      if (totalErrors > 0) {
        process.exit(1);
      }

      if (maxWarnings >= 0 && totalWarnings > maxWarnings) {
        process.exit(1);
      }
    }
  });

program.parse();

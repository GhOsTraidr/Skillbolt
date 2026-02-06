#!/usr/bin/env node

import { Command } from 'commander';
import { logger } from '@skillbolt/core';

import { runCommand } from './cli/run.js';
import { validateCommand } from './cli/validate.js';
import { visualizeCommand, type OutputFormat } from './cli/visualize.js';

const program = new Command();

program
  .name('skill-compose')
  .description('Skill Kit Compose - Workflow orchestration for Skills')
  .version('1.0.0');

program
  .command('run <file>')
  .description('Execute a workflow file')
  .option('-i, --input <key=value...>', 'Input parameters (can be specified multiple times)')
  .option('-d, --dry-run', 'Run without executing skills', false)
  .option('-v, --verbose', 'Show detailed execution information', false)
  .option('-t, --timeout <ms>', 'Default step timeout in milliseconds')
  .action(
    async (
      file: string,
      options: {
        input?: string[];
        dryRun: boolean;
        verbose: boolean;
        timeout?: string;
      }
    ) => {
      try {
        const inputs: Record<string, unknown> = {};
        if (options.input) {
          for (const pair of options.input) {
            const [key, ...valueParts] = pair.split('=');
            const value = valueParts.join('=');
            if (key) {
              try {
                inputs[key] = JSON.parse(value);
              } catch {
                inputs[key] = value;
              }
            }
          }
        }

        await runCommand({
          file,
          inputs,
          dryRun: options.dryRun,
          verbose: options.verbose,
          timeout: options.timeout ? parseInt(options.timeout, 10) : undefined,
        });
      } catch (error) {
        logger.error(`Execution failed: ${(error as Error).message}`);
        process.exit(1);
      }
    }
  );

program
  .command('validate <file>')
  .description('Validate a workflow file')
  .option('-q, --quiet', 'Only output errors', false)
  .action(async (file: string, options: { quiet: boolean }) => {
    try {
      const isValid = await validateCommand({
        file,
        quiet: options.quiet,
      });
      process.exit(isValid ? 0 : 1);
    } catch (error) {
      logger.error(`Validation failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('visualize <file>')
  .alias('viz')
  .description('Visualize a workflow')
  .option(
    '-f, --format <format>',
    'Output format (ascii, simple, mermaid, mermaid-styled)',
    'simple'
  )
  .option('-o, --output <file>', 'Write output to file instead of stdout')
  .action(async (file: string, options: { format: string; output?: string }) => {
    try {
      await visualizeCommand({
        file,
        format: options.format as OutputFormat,
        output: options.output,
      });
    } catch (error) {
      logger.error(`Visualization failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();

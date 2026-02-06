import type { Command } from 'commander';
import { loadCommandPackage, handleMissingPackage } from '../utils/index.js';

interface ComposeModule {
  runCommand: (options: RunOptions) => Promise<void>;
  validateCommand: (options: ValidateOptions) => Promise<boolean>;
  visualizeCommand: (options: VisualizeOptions) => Promise<void>;
  logger: {
    error: (msg: string) => void;
  };
}

interface RunOptions {
  file: string;
  inputs: Record<string, unknown>;
  dryRun: boolean;
  verbose: boolean;
  timeout?: number;
}

interface ValidateOptions {
  file: string;
  quiet: boolean;
}

interface VisualizeOptions {
  file: string;
  format: string;
  output?: string;
}

export function registerComposeCommand(program: Command): void {
  const compose = program.command('compose').description('Workflow orchestration for Skills');

  compose
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
        const result = await loadCommandPackage<ComposeModule>('compose');
        if (!result.success || !result.module) {
          handleMissingPackage('compose');
        }

        const { runCommand, logger } = result.module;
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

        try {
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

  compose
    .command('validate <file>')
    .description('Validate a workflow file')
    .option('-q, --quiet', 'Only output errors', false)
    .action(async (file: string, options: { quiet: boolean }) => {
      const result = await loadCommandPackage<ComposeModule>('compose');
      if (!result.success || !result.module) {
        handleMissingPackage('compose');
      }

      const { validateCommand, logger } = result.module;

      try {
        const isValid = await validateCommand({ file, quiet: options.quiet });
        process.exit(isValid ? 0 : 1);
      } catch (error) {
        logger.error(`Validation failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  compose
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
      const result = await loadCommandPackage<ComposeModule>('compose');
      if (!result.success || !result.module) {
        handleMissingPackage('compose');
      }

      const { visualizeCommand, logger } = result.module;

      try {
        await visualizeCommand({
          file,
          format: options.format,
          output: options.output,
        });
      } catch (error) {
        logger.error(`Visualization failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });
}

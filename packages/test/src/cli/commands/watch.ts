import type { Command } from 'commander';
import { loadTestConfig } from '../../config/index.js';
import { startWatch } from '../watch.js';
import type { CliOptions } from '../../types/index.js';

export function registerWatchCommand(program: Command): void {
  program
    .command('watch')
    .description('Run skill tests in watch mode')
    .option('-c, --config <path>', 'Path to config file')
    .option('-d, --test-dir <dir>', 'Test directory')
    .option('-t, --timeout <ms>', 'Test timeout in milliseconds', parseInt)
    .option('-v, --verbose', 'Verbose output')
    .option('-p, --pattern <glob>', 'Test file pattern')
    .action(async (opts: CliOptions) => {
      try {
        const { config } = await loadTestConfig({
          configPath: opts.config,
          cliOptions: { ...opts, watch: true },
        });

        await startWatch({
          config,
          onError: (error) => {
            console.error('Watch error:', error.message);
          },
        });
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

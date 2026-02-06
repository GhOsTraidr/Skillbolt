import type { Command } from 'commander';
import chalk from 'chalk';
import { loadPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface WebUIModule {
  startServer: (options: Record<string, unknown>) => Promise<void>;
}

export function registerGuiCommand(program: Command): void {
  program
    .command('gui')
    .description('Launch web GUI for skill discovery and execution')
    .option('-p, --port <port>', 'Server port', '8765')
    .option('--no-browser', 'Do not auto-open browser')
    .option('--task <task>', 'Pre-set task (enters execute mode)')
    .option('--skills <skills>', 'Pre-set skills (comma-separated)')
    .option('--mode <mode>', 'Run mode: dag, freestyle, baseline')
    .option('--files <files>', 'Pre-set files (comma-separated)')
    .option('--task-name <name>', 'Name for run directory')
    .action(async (options) => {
      const result = await loadPackage<WebUIModule>('@skillbolt/web-ui');
      if (!result.success || !result.module) {
        return handleMissingPackage('gui');
      }

      try {
        const { startServer } = result.module;

        console.log(chalk.cyan('\n  Starting Skill Kit GUI...'));
        console.log(chalk.gray(`  Port: ${options.port}`));
        if (options.task) console.log(chalk.gray(`  Task: ${options.task}`));
        console.log('');

        await startServer({
          port: parseInt(options.port, 10),
          openBrowser: options.browser !== false,
          task: options.task,
          presetSkills: options.skills
            ? options.skills.split(',').map((s: string) => s.trim())
            : undefined,
          runMode: options.mode,
          files: options.files ? options.files.split(',').map((f: string) => f.trim()) : undefined,
          taskName: options.taskName,
        });
      } catch (error) {
        handleError(error);
      }
    });
}

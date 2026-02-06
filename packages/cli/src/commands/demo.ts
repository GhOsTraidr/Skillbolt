import type { Command } from 'commander';
import chalk from 'chalk';
import { loadPackage, handleError, printMissingPackageError } from '../utils/index.js';
import { ExitCode } from '../types.js';

interface CoreModule {
  DEFAULT_DEMO_TASKS: Array<{
    id: string;
    title: string;
    description: string;
    prompt: string;
    files?: string[];
    icon?: string;
  }>;
}

export function registerDemoCommand(program: Command): void {
  const demo = program.command('demo').description('Demo tasks for skill orchestration');

  demo
    .command('list')
    .description('List available demo tasks')
    .action(async () => {
      const result = await loadPackage<CoreModule>('@skillbolt/core');
      if (!result.module) {
        printMissingPackageError('demo', '@skillbolt/core');
        process.exitCode = ExitCode.ERROR;
        return;
      }

      try {
        const { DEFAULT_DEMO_TASKS } = result.module;
        console.log(chalk.cyan('\n  Demo Tasks\n'));

        for (const task of DEFAULT_DEMO_TASKS) {
          const fileCount = task.files?.length ?? 0;
          console.log(`  ${chalk.bold(task.id)} — ${task.title}`);
          console.log(`    ${chalk.gray(task.description)}`);
          if (fileCount > 0) console.log(`    ${chalk.gray(`Files: ${fileCount}`)}`);
          console.log('');
        }
      } catch (error) {
        handleError(error);
      }
    });

  demo
    .command('run <id>')
    .description('Load and run a demo task')
    .option('-p, --port <port>', 'GUI port', '8765')
    .action(async (id: string, options) => {
      const coreResult = await loadPackage<CoreModule>('@skillbolt/core');
      if (!coreResult.module) {
        printMissingPackageError('demo', '@skillbolt/core');
        process.exitCode = ExitCode.ERROR;
        return;
      }

      try {
        const { DEFAULT_DEMO_TASKS } = coreResult.module;
        const task = DEFAULT_DEMO_TASKS.find((t) => t.id === id);
        if (!task) {
          console.error(chalk.red(`\n  Demo task "${id}" not found.\n`));
          console.log(chalk.gray('  Available demos:'));
          for (const t of DEFAULT_DEMO_TASKS) {
            console.log(chalk.gray(`    - ${t.id}: ${t.title}`));
          }
          console.log('');
          process.exit(1);
        }

        console.log(chalk.cyan(`\n  Loading demo: ${task.title}`));
        console.log(chalk.gray(`  ${task.description}\n`));

        const guiResult = await loadPackage<{
          startServer: (opts: Record<string, unknown>) => Promise<void>;
        }>('@skillbolt/web-ui');
        if (guiResult.success && guiResult.module) {
          await guiResult.module.startServer({
            port: parseInt(options.port, 10),
            openBrowser: true,
            task: task.prompt,
            taskName: task.id,
            files: task.files,
          });
        } else {
          console.log(chalk.white('  Task Prompt:'));
          console.log(chalk.gray(`  ${task.prompt}\n`));
          console.log(chalk.yellow('  Install @skillbolt/web-ui to launch the GUI.\n'));
        }
      } catch (error) {
        handleError(error);
      }
    });
}

import type { Command } from 'commander';
import chalk from 'chalk';
import { loadPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface ExecuteModule {
  SkillOrchestrator: new (options: Record<string, unknown>) => {
    runWithVisualizer(options: Record<string, unknown>): Promise<ExecutionResultLike>;
  };
  RunContext: { create(task: string, options?: Record<string, unknown>): unknown };
}

interface ExecutionResultLike {
  status: string;
  stats?: { total: number; completed: number; failed: number; skipped: number };
  error?: string;
}

export function registerRunCommand(program: Command): void {
  program
    .command('run <task>')
    .description('Execute a task using skill orchestration')
    .option('-s, --skills <skills>', 'Comma-separated skill names')
    .option('-m, --mode <mode>', 'Execution mode (dag, freestyle, direct, baseline)', 'dag')
    .option('-f, --files <files>', 'Comma-separated file paths')
    .option('--plan-only', 'Generate plan without executing', false)
    .option('--task-name <name>', 'Name for run directory')
    .option('--max-concurrent <n>', 'Max concurrent nodes', '6')
    .option('--timeout <seconds>', 'Node execution timeout in seconds', '600')
    .action(async (task: string, options) => {
      const executeResult = await loadPackage<ExecuteModule>('@skillbolt/execute');
      const executeModule = executeResult.module;
      if (!executeResult.success || !executeModule) {
        return handleMissingPackage('run');
      }

      try {
        const { SkillOrchestrator, RunContext } = executeModule;
        const skillNames = options.skills
          ? options.skills.split(',').map((s: string) => s.trim())
          : [];
        const files = options.files ? options.files.split(',').map((f: string) => f.trim()) : [];

        console.log(chalk.cyan('\n  Skill Orchestrator'));
        console.log(chalk.gray(`  Task: ${task}`));
        console.log(chalk.gray(`  Mode: ${options.mode}`));
        if (skillNames.length > 0) console.log(chalk.gray(`  Skills: ${skillNames.join(', ')}`));
        console.log('');

        const runContext = RunContext.create(task, {
          mode: options.mode,
          taskName: options.taskName,
        });

        const orchestrator = new SkillOrchestrator({
          maxConcurrent: parseInt(options.maxConcurrent, 10),
          nodeTimeout: parseInt(options.timeout, 10),
          runContext,
        });

        const visualizer = {
          async setTask(t: string) {
            console.log(chalk.cyan(`  Task: ${t}`));
          },
          async setNodes(nodes: unknown[]) {
            console.log(chalk.gray(`  Nodes: ${(nodes as unknown[]).length}`));
          },
          async updateStatus(nodeId: string, status: string) {
            const color =
              status === 'completed'
                ? chalk.green
                : status === 'failed'
                  ? chalk.red
                  : status === 'running'
                    ? chalk.blue
                    : chalk.gray;
            console.log(`  ${color('*')} ${nodeId}: ${status}`);
          },
          async setPhase(num: number) {
            console.log(chalk.cyan(`\n  Phase ${num}`));
          },
          async addLog(msg: string, level?: string) {
            const color =
              level === 'error'
                ? chalk.red
                : level === 'ok'
                  ? chalk.green
                  : level === 'warn'
                    ? chalk.yellow
                    : chalk.gray;
            console.log(`  ${color(msg)}`);
          },
          async selectPlan() {
            return 0;
          },
        };

        const result = await orchestrator.runWithVisualizer({
          task,
          skillNames,
          visualizer,
          planOnly: options.planOnly,
          files,
        });

        console.log('');
        if (result.status === 'completed') {
          console.log(chalk.green('  Execution completed'));
        } else if (result.status === 'partial') {
          console.log(chalk.yellow('  Execution partially completed'));
        } else if (result.status === 'failed') {
          console.log(chalk.red(`  Execution failed: ${result.error || 'unknown'}`));
        } else if (result.status === 'plan_only') {
          console.log(chalk.cyan('  Plan generated (--plan-only mode)'));
        }

        if (result.stats) {
          const s = result.stats;
          console.log(
            chalk.gray(
              `  Completed: ${s.completed}/${s.total}, Failed: ${s.failed}, Skipped: ${s.skipped}`
            )
          );
        }
        console.log('');
      } catch (error) {
        handleError(error);
      }
    });
}

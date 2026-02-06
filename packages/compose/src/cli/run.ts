import { logger } from '@skillbolt/core';
import { parseWorkflowFile } from '../parser/yaml.js';
import { createExecutor } from '../engine/executor.js';
import type { ExecutionOptions, StepResult } from '../types/context.js';
import type { WorkflowStep } from '../types/step.js';

export interface RunOptions {
  file: string;
  inputs?: Record<string, unknown>;
  dryRun?: boolean;
  verbose?: boolean;
  timeout?: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

function formatStepResult(result: StepResult, indent: number = 0): void {
  const prefix = '  '.repeat(indent);
  const statusIcon = result.status === 'completed' ? '✓' : result.status === 'failed' ? '✗' : '○';

  logger.log(`${prefix}${statusIcon} ${result.stepId} (${formatDuration(result.duration ?? 0)})`);

  if (result.error) {
    logger.error(`${prefix}  Error: ${result.error.message}`);
  }

  if (result.children) {
    for (const child of result.children) {
      formatStepResult(child, indent + 1);
    }
  }
}

export async function runCommand(options: RunOptions): Promise<void> {
  const { file, inputs = {}, dryRun = false, verbose = false, timeout } = options;

  logger.info(`Loading workflow from: ${file}`);

  const workflowFile = await parseWorkflowFile(file, { validate: true, strict: true });
  const { workflow } = workflowFile;

  logger.info(`Workflow: ${workflow.name}`);
  if (workflow.description) {
    logger.info(`Description: ${workflow.description}`);
  }
  logger.info(`Steps: ${workflow.steps.length}`);
  logger.newline();

  const executionOptions: ExecutionOptions = {
    inputs,
    timeout,
    dryRun,
    onStepStart: verbose
      ? (step: WorkflowStep) => {
          logger.step(`Starting: ${step.id}`);
        }
      : undefined,
    onStepComplete: verbose
      ? (step: WorkflowStep, result: StepResult) => {
          const icon = result.status === 'completed' ? '✓' : '✗';
          logger.log(`  ${icon} Completed: ${step.id} (${formatDuration(result.duration ?? 0)})`);
        }
      : undefined,
    onStepError: verbose
      ? (step: WorkflowStep, error: Error) => {
          logger.error(`  Error in ${step.id}: ${error.message}`);
        }
      : undefined,
  };

  if (dryRun) {
    logger.warn('Running in dry-run mode - no skills will be executed');
  }

  logger.info('Executing workflow...');
  logger.newline();

  const executor = createExecutor(workflow, executionOptions);
  const result = await executor.execute();

  logger.newline();
  logger.title('Execution Results');

  for (const stepResult of result.steps) {
    formatStepResult(stepResult);
  }

  logger.newline();

  if (result.status === 'completed') {
    logger.success(`Workflow completed successfully in ${formatDuration(result.duration)}`);
  } else if (result.status === 'failed') {
    logger.error(`Workflow failed after ${formatDuration(result.duration)}`);
    if (result.error) {
      logger.error(`Error: ${result.error.message}`);
    }
    process.exit(1);
  } else {
    logger.warn(`Workflow cancelled after ${formatDuration(result.duration)}`);
    process.exit(1);
  }

  if (Object.keys(result.outputs).length > 0) {
    logger.newline();
    logger.info('Outputs:');
    logger.log(JSON.stringify(result.outputs, null, 2));
  }
}

import type {
  ExecutionContext,
  ExecutionOptions,
  ExecutionResult,
  StepResult,
  SkillExecutor,
} from '../types/context.js';
import type { Workflow } from '../types/workflow.js';
import type {
  WorkflowStep,
  SkillStep,
  ParallelStep,
  ConditionStep,
  ForeachStep,
  WhileStep,
  SubWorkflowStep,
} from '../types/step.js';
import {
  isSkillStep,
  isParallelStep,
  isConditionStep,
  isForeachStep,
  isWhileStep,
  isSubWorkflowStep,
} from '../types/step.js';
import type { ErrorStrategy } from '../types/error.js';
import { DEFAULT_ERROR_STRATEGY, DEFAULT_RETRY_CONFIG } from '../types/error.js';
import { createExecutionContext } from './context.js';
import { evaluateCondition } from './scheduler.js';
import { interpolateValue } from '../parser/interpolation.js';

const defaultSkillExecutor: SkillExecutor = async (skillName, inputs) => {
  console.log(`[DryRun] Executing skill: ${skillName}`, inputs);
  return { result: `Executed ${skillName}` };
};

export class WorkflowExecutor {
  private workflow: Workflow;
  private options: ExecutionOptions;
  private context: ExecutionContext;

  constructor(workflow: Workflow, options: ExecutionOptions = {}) {
    this.workflow = workflow;
    this.options = options;
    this.context = createExecutionContext(workflow, options);
  }

  async execute(): Promise<ExecutionResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];

    try {
      for (const step of this.workflow.steps) {
        if (this.context.isCancelled()) {
          break;
        }

        const result = await this.executeStep(step);
        stepResults.push(result);

        if (result.status === 'failed') {
          const errorStrategy = step.onError ?? this.workflow.onError ?? DEFAULT_ERROR_STRATEGY;
          if (errorStrategy.action === 'fail') {
            return this.createResult('failed', stepResults, startTime, result.error);
          }
        }
      }

      const outputs = this.collectOutputs();
      return this.createResult('completed', stepResults, startTime, undefined, outputs);
    } catch (error) {
      return this.createResult('failed', stepResults, startTime, error as Error);
    }
  }

  async executeStep(step: WorkflowStep): Promise<StepResult> {
    const startTime = Date.now();

    this.options.onStepStart?.(step, this.context);

    if (step.when) {
      const shouldRun = await evaluateCondition(step.when, this.context);
      if (!shouldRun) {
        const result: StepResult = {
          stepId: step.id,
          status: 'skipped',
          outputs: {},
          startTime,
          endTime: Date.now(),
          duration: Date.now() - startTime,
        };
        this.context.setStepResult(step.id, result);
        return result;
      }
    }

    try {
      let result: StepResult;

      if (isSkillStep(step)) {
        result = await this.executeSkillStep(step);
      } else if (isParallelStep(step)) {
        result = await this.executeParallelStep(step);
      } else if (isConditionStep(step)) {
        result = await this.executeConditionStep(step);
      } else if (isForeachStep(step)) {
        result = await this.executeForeachStep(step);
      } else if (isWhileStep(step)) {
        result = await this.executeWhileStep(step);
      } else if (isSubWorkflowStep(step)) {
        result = await this.executeSubWorkflowStep(step);
      } else {
        throw new Error(`Unknown step type for step: ${(step as WorkflowStep).id}`);
      }

      this.context.setStepResult(step.id, result);
      this.options.onStepComplete?.(step, result, this.context);
      return result;
    } catch (error) {
      const errorStrategy = step.onError ?? this.workflow.onError ?? DEFAULT_ERROR_STRATEGY;
      return this.handleStepError(step, error as Error, errorStrategy, startTime);
    }
  }

  private async executeSkillStep(step: SkillStep): Promise<StepResult> {
    const startTime = Date.now();

    const variables = this.context.getAllVariables();
    const interpolatedInputs = step.inputs
      ? (interpolateValue(step.inputs, variables).value as Record<string, unknown>)
      : {};

    const executor = this.options.skillExecutor ?? defaultSkillExecutor;
    const outputs = await this.executeWithTimeout(
      () => executor(step.skill, interpolatedInputs, this.context),
      step.timeout ?? this.options.timeout
    );

    return {
      stepId: step.id,
      status: 'completed',
      outputs,
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
    };
  }

  private async executeParallelStep(step: ParallelStep): Promise<StepResult> {
    const startTime = Date.now();
    const maxConcurrency = step.maxConcurrency ?? this.options.maxConcurrency ?? Infinity;
    const failureStrategy = step.failureStrategy ?? 'fail-fast';

    const results: StepResult[] = [];
    const pending = [...step.parallel];
    const running: Promise<StepResult>[] = [];

    while (pending.length > 0 || running.length > 0) {
      while (pending.length > 0 && running.length < maxConcurrency) {
        const childStep = pending.shift()!;
        const promise = this.executeStep(childStep).then((result) => {
          results.push(result);
          return result;
        });
        running.push(promise);
      }

      if (running.length > 0) {
        if (failureStrategy === 'fail-fast') {
          const completed = await Promise.race(running);
          running.splice(running.indexOf(Promise.resolve(completed)), 1);

          if (completed.status === 'failed') {
            return {
              stepId: step.id,
              status: 'failed',
              outputs: {},
              startTime,
              endTime: Date.now(),
              duration: Date.now() - startTime,
              error: completed.error,
              children: results,
            };
          }
        } else {
          await Promise.race(running);
          const completedPromises = running.filter(() => results.length > 0);
          for (const p of completedPromises) {
            running.splice(running.indexOf(p), 1);
          }
        }
      }
    }

    if (failureStrategy === 'wait-all') {
      await Promise.all(running);
    }

    const hasFailed = results.some((r) => r.status === 'failed');
    const outputs: Record<string, unknown> = {};
    for (const result of results) {
      outputs[result.stepId] = result.outputs;
    }

    return {
      stepId: step.id,
      status: hasFailed ? 'failed' : 'completed',
      outputs,
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      children: results,
    };
  }

  private async executeConditionStep(step: ConditionStep): Promise<StepResult> {
    const startTime = Date.now();

    const conditionResult = await evaluateCondition(step.condition.if, this.context);
    const stepsToExecute = conditionResult ? step.condition.then : step.condition.else;

    if (!stepsToExecute) {
      return {
        stepId: step.id,
        status: 'completed',
        outputs: { conditionResult },
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
      };
    }

    const steps = Array.isArray(stepsToExecute) ? stepsToExecute : [stepsToExecute];
    const children: StepResult[] = [];

    for (const childStep of steps) {
      const result = await this.executeStep(childStep);
      children.push(result);

      if (result.status === 'failed') {
        return {
          stepId: step.id,
          status: 'failed',
          outputs: { conditionResult },
          startTime,
          endTime: Date.now(),
          duration: Date.now() - startTime,
          error: result.error,
          children,
        };
      }
    }

    const lastResult = children[children.length - 1];
    return {
      stepId: step.id,
      status: 'completed',
      outputs: {
        conditionResult,
        ...lastResult?.outputs,
      },
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      children,
    };
  }

  private async executeForeachStep(step: ForeachStep): Promise<StepResult> {
    const startTime = Date.now();

    const variables = this.context.getAllVariables();
    const itemsResult = interpolateValue(step.foreach.items, variables);
    const items = itemsResult.value;

    if (!Array.isArray(items)) {
      throw new Error(`foreach items must be an array, got: ${typeof items}`);
    }

    const maxConcurrency = step.foreach.maxConcurrency ?? 1;
    const children: StepResult[] = [];
    const outputs: unknown[] = [];

    const executeIteration = async (item: unknown, index: number): Promise<StepResult> => {
      this.context.pushScope('loop', `${step.id}[${index}]`);
      this.context.setVariable(step.foreach.as, item);
      if (step.foreach.index) {
        this.context.setVariable(step.foreach.index, index);
      }
      this.context.setVariable('item', item);
      this.context.setVariable('index', index);

      try {
        const steps = Array.isArray(step.foreach.step) ? step.foreach.step : [step.foreach.step];

        let lastResult: StepResult | undefined;
        for (const childStep of steps) {
          lastResult = await this.executeStep(childStep);
          if (lastResult.status === 'failed') {
            return lastResult;
          }
        }

        return (
          lastResult ?? {
            stepId: `${step.id}[${index}]`,
            status: 'completed',
            outputs: {},
            startTime: Date.now(),
            endTime: Date.now(),
            duration: 0,
          }
        );
      } finally {
        this.context.popScope();
      }
    };

    if (maxConcurrency === 1) {
      for (let i = 0; i < items.length; i++) {
        const result = await executeIteration(items[i], i);
        children.push(result);
        outputs.push(result.outputs);

        if (result.status === 'failed') {
          return {
            stepId: step.id,
            status: 'failed',
            outputs: { results: outputs },
            startTime,
            endTime: Date.now(),
            duration: Date.now() - startTime,
            error: result.error,
            children,
          };
        }
      }
    } else {
      const pending = items.map((item, index) => ({ item, index }));
      const running: Promise<StepResult>[] = [];

      while (pending.length > 0 || running.length > 0) {
        while (pending.length > 0 && running.length < maxConcurrency) {
          const { item, index } = pending.shift()!;
          running.push(executeIteration(item, index));
        }

        if (running.length > 0) {
          const completed = await Promise.race(running);
          const completedIndex = running.findIndex((p) => p.then((r) => r === completed));
          if (completedIndex !== -1) {
            running.splice(completedIndex, 1);
          }
          children.push(completed);
          outputs.push(completed.outputs);
        }
      }
    }

    return {
      stepId: step.id,
      status: 'completed',
      outputs: { results: outputs },
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      children,
    };
  }

  private async executeWhileStep(step: WhileStep): Promise<StepResult> {
    const startTime = Date.now();
    const maxIterations = step.while.maxIterations ?? 1000;
    const children: StepResult[] = [];
    const outputs: unknown[] = [];
    let iteration = 0;

    while (iteration < maxIterations) {
      const shouldContinue = await evaluateCondition(step.while.condition, this.context);
      if (!shouldContinue) {
        break;
      }

      this.context.pushScope('loop', `${step.id}[${iteration}]`);
      this.context.setVariable('iteration', iteration);

      try {
        const steps = Array.isArray(step.while.step) ? step.while.step : [step.while.step];

        for (const childStep of steps) {
          const result = await this.executeStep(childStep);
          children.push(result);
          outputs.push(result.outputs);

          if (result.status === 'failed') {
            return {
              stepId: step.id,
              status: 'failed',
              outputs: { results: outputs, iterations: iteration + 1 },
              startTime,
              endTime: Date.now(),
              duration: Date.now() - startTime,
              error: result.error,
              children,
            };
          }
        }
      } finally {
        this.context.popScope();
      }

      iteration++;
    }

    return {
      stepId: step.id,
      status: 'completed',
      outputs: { results: outputs, iterations: iteration },
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      children,
    };
  }

  private async executeSubWorkflowStep(step: SubWorkflowStep): Promise<StepResult> {
    const startTime = Date.now();

    if (!this.options.workflowLoader) {
      throw new Error('No workflow loader configured for sub-workflow execution');
    }

    const subWorkflow = await this.options.workflowLoader(step.workflow);

    const variables = this.context.getAllVariables();
    const interpolatedInputs = step.inputs
      ? (interpolateValue(step.inputs, variables).value as Record<string, unknown>)
      : {};

    const subExecutor = new WorkflowExecutor(subWorkflow, {
      ...this.options,
      inputs: interpolatedInputs,
    });

    const result = await subExecutor.execute();

    return {
      stepId: step.id,
      status: result.status === 'completed' ? 'completed' : 'failed',
      outputs: result.outputs,
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      error: result.error,
      children: result.steps,
    };
  }

  private async handleStepError(
    step: WorkflowStep,
    error: Error,
    strategy: ErrorStrategy,
    startTime: number
  ): Promise<StepResult> {
    this.options.onStepError?.(step, error, this.context);

    if (strategy.action === 'retry' && strategy.retry) {
      const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...strategy.retry };
      let lastError = error;
      let delay = retryConfig.initialDelay ?? 1000;

      for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
        await this.sleep(delay);

        try {
          const result = await this.executeStep(step);
          result.retryCount = attempt + 1;
          return result;
        } catch (retryError) {
          lastError = retryError as Error;
          if (retryConfig.exponential) {
            delay = Math.min(delay * (retryConfig.multiplier ?? 2), retryConfig.maxDelay ?? 30000);
          }
        }
      }

      return {
        stepId: step.id,
        status: 'failed',
        outputs: {},
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        error: lastError,
        retryCount: retryConfig.maxRetries,
      };
    }

    if (strategy.action === 'continue') {
      return {
        stepId: step.id,
        status: 'completed',
        outputs: strategy.fallback !== undefined ? { fallback: strategy.fallback } : {},
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
      };
    }

    return {
      stepId: step.id,
      status: 'failed',
      outputs: {},
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      error,
    };
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeout?: number): Promise<T> {
    if (!timeout) {
      return fn();
    }

    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Step execution timeout')), timeout)
      ),
    ]);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private collectOutputs(): Record<string, unknown> {
    const outputs: Record<string, unknown> = {};

    if (this.workflow.outputs) {
      const variables = this.context.getAllVariables();
      for (const [key, def] of Object.entries(this.workflow.outputs)) {
        const value = typeof def === 'string' ? def : def.value;
        const result = interpolateValue(value, variables);
        outputs[key] = result.value;
      }
    }

    return outputs;
  }

  private createResult(
    status: 'completed' | 'failed' | 'cancelled',
    steps: StepResult[],
    startTime: number,
    error?: Error,
    outputs: Record<string, unknown> = {}
  ): ExecutionResult {
    const endTime = Date.now();
    return {
      status,
      outputs,
      steps,
      duration: endTime - startTime,
      startTime,
      endTime,
      error,
    };
  }

  getContext(): ExecutionContext {
    return this.context;
  }

  cancel(): void {
    this.context.cancel();
  }
}

export function createExecutor(
  workflow: Workflow,
  options: ExecutionOptions = {}
): WorkflowExecutor {
  return new WorkflowExecutor(workflow, options);
}

export async function executeWorkflow(
  workflow: Workflow,
  options: ExecutionOptions = {}
): Promise<ExecutionResult> {
  const executor = createExecutor(workflow, options);
  return executor.execute();
}

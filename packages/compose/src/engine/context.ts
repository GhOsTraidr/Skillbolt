import type {
  ExecutionContext,
  ExecutionState,
  ExecutionOptions,
  VariableScope,
  ScopeType,
  StepResult,
} from '../types/context.js';
import type { Workflow } from '../types/workflow.js';

export class ExecutionContextImpl implements ExecutionContext {
  private state: ExecutionState;
  private options: ExecutionOptions;

  constructor(workflow: Workflow, options: ExecutionOptions = {}) {
    this.options = options;

    const globalScope: VariableScope = {
      type: 'global',
      id: 'global',
      variables: new Map(),
    };

    if (options.inputs) {
      globalScope.variables.set('inputs', options.inputs);
    }

    if (options.env) {
      globalScope.variables.set('env', options.env);
    } else {
      globalScope.variables.set('env', process.env);
    }

    this.state = {
      workflow,
      inputs: options.inputs ?? {},
      scopeStack: [globalScope],
      stepResults: new Map(),
      cancelled: false,
      startTime: Date.now(),
    };
  }

  getVariable(name: string): unknown {
    const parts = name.split('.');
    const rootName = parts[0]!;

    for (let i = this.state.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.state.scopeStack[i]!;

      if (scope.variables.has(rootName)) {
        let value = scope.variables.get(rootName);

        for (let j = 1; j < parts.length; j++) {
          if (value === null || value === undefined) {
            return undefined;
          }
          value = (value as Record<string, unknown>)[parts[j]!];
        }

        return value;
      }
    }

    const stepResult = this.state.stepResults.get(rootName);
    if (stepResult) {
      if (parts.length === 1) {
        return stepResult.outputs;
      }

      let value: unknown = stepResult.outputs;
      for (let j = 1; j < parts.length; j++) {
        if (value === null || value === undefined) {
          return undefined;
        }
        value = (value as Record<string, unknown>)[parts[j]!];
      }
      return value;
    }

    return undefined;
  }

  setVariable(name: string, value: unknown): void {
    const currentScope = this.getCurrentScope();
    currentScope.variables.set(name, value);
  }

  hasVariable(name: string): boolean {
    return this.getVariable(name) !== undefined;
  }

  getAllVariables(): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const scope of this.state.scopeStack) {
      for (const [key, value] of scope.variables) {
        result[key] = value;
      }
    }

    for (const [stepId, stepResult] of this.state.stepResults) {
      result[stepId] = stepResult.outputs;
    }

    return result;
  }

  pushScope(type: ScopeType, id: string): void {
    const parent = this.getCurrentScope();
    const newScope: VariableScope = {
      type,
      id,
      parent,
      variables: new Map(),
    };
    this.state.scopeStack.push(newScope);
  }

  popScope(): void {
    if (this.state.scopeStack.length > 1) {
      this.state.scopeStack.pop();
    }
  }

  getCurrentScope(): VariableScope {
    return this.state.scopeStack[this.state.scopeStack.length - 1]!;
  }

  getStepResult(stepId: string): StepResult | undefined {
    return this.state.stepResults.get(stepId);
  }

  setStepResult(stepId: string, result: StepResult): void {
    this.state.stepResults.set(stepId, result);
  }

  isCancelled(): boolean {
    return this.state.cancelled;
  }

  cancel(): void {
    this.state.cancelled = true;
  }

  getOptions(): ExecutionOptions {
    return this.options;
  }

  getWorkflow(): Workflow {
    return this.state.workflow;
  }

  getState(): ExecutionState {
    return this.state;
  }
}

export function createExecutionContext(
  workflow: Workflow,
  options: ExecutionOptions = {}
): ExecutionContext {
  return new ExecutionContextImpl(workflow, options);
}

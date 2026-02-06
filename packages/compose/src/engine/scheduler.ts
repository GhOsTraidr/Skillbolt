import type { WorkflowStep, StepStatus } from '../types/step.js';
import type { StepResult, ExecutionContext } from '../types/context.js';
import { interpolateValue } from '../parser/interpolation.js';

export interface ScheduledStep {
  step: WorkflowStep;
  status: StepStatus;
  dependencies: string[];
  result?: StepResult;
}

export class StepScheduler {
  private steps: Map<string, ScheduledStep> = new Map();
  private executionOrder: string[] = [];

  addStep(step: WorkflowStep, dependencies: string[] = []): void {
    this.steps.set(step.id, {
      step,
      status: 'pending',
      dependencies,
    });
    this.executionOrder.push(step.id);
  }

  getReadySteps(): WorkflowStep[] {
    const ready: WorkflowStep[] = [];

    for (const stepId of this.executionOrder) {
      const scheduled = this.steps.get(stepId)!;

      if (scheduled.status !== 'pending') {
        continue;
      }

      const allDepsCompleted = scheduled.dependencies.every((depId) => {
        const dep = this.steps.get(depId);
        return dep && dep.status === 'completed';
      });

      if (allDepsCompleted) {
        ready.push(scheduled.step);
      }
    }

    return ready;
  }

  markRunning(stepId: string): void {
    const scheduled = this.steps.get(stepId);
    if (scheduled) {
      scheduled.status = 'running';
    }
  }

  markCompleted(stepId: string, result: StepResult): void {
    const scheduled = this.steps.get(stepId);
    if (scheduled) {
      scheduled.status = 'completed';
      scheduled.result = result;
    }
  }

  markFailed(stepId: string, result: StepResult): void {
    const scheduled = this.steps.get(stepId);
    if (scheduled) {
      scheduled.status = 'failed';
      scheduled.result = result;
    }
  }

  markSkipped(stepId: string): void {
    const scheduled = this.steps.get(stepId);
    if (scheduled) {
      scheduled.status = 'skipped';
    }
  }

  getStatus(stepId: string): StepStatus | undefined {
    return this.steps.get(stepId)?.status;
  }

  getResult(stepId: string): StepResult | undefined {
    return this.steps.get(stepId)?.result;
  }

  getAllResults(): StepResult[] {
    return Array.from(this.steps.values())
      .map((s) => s.result)
      .filter((r): r is StepResult => r !== undefined);
  }

  isComplete(): boolean {
    return Array.from(this.steps.values()).every(
      (s) => s.status === 'completed' || s.status === 'failed' || s.status === 'skipped'
    );
  }

  hasFailed(): boolean {
    return Array.from(this.steps.values()).some((s) => s.status === 'failed');
  }
}

export async function evaluateCondition(
  condition: string,
  context: ExecutionContext
): Promise<boolean> {
  const variables = context.getAllVariables();
  const interpolated = interpolateValue(condition, variables);
  const value = interpolated.value;

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return evaluateConditionString(value, variables);
  }

  return Boolean(value);
}

function evaluateConditionString(expr: string, variables: Record<string, unknown>): boolean {
  const trimmed = expr.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  const comparisonMatch = trimmed.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (comparisonMatch) {
    const [, leftExpr, operator, rightExpr] = comparisonMatch;
    const left = resolveExpressionValue(leftExpr!.trim(), variables);
    const right = resolveExpressionValue(rightExpr!.trim(), variables);

    switch (operator) {
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '>':
        return Number(left) > Number(right);
      case '<':
        return Number(left) < Number(right);
      case '>=':
        return Number(left) >= Number(right);
      case '<=':
        return Number(left) <= Number(right);
    }
  }

  const andMatch = trimmed.match(/^(.+?)\s+and\s+(.+)$/i);
  if (andMatch) {
    const [, left, right] = andMatch;
    return (
      evaluateConditionString(left!.trim(), variables) &&
      evaluateConditionString(right!.trim(), variables)
    );
  }

  const orMatch = trimmed.match(/^(.+?)\s+or\s+(.+)$/i);
  if (orMatch) {
    const [, left, right] = orMatch;
    return (
      evaluateConditionString(left!.trim(), variables) ||
      evaluateConditionString(right!.trim(), variables)
    );
  }

  const notMatch = trimmed.match(/^not\s+(.+)$/i);
  if (notMatch) {
    return !evaluateConditionString(notMatch[1]!.trim(), variables);
  }

  const value = resolveExpressionValue(trimmed, variables);
  return Boolean(value);
}

function resolveExpressionValue(expr: string, variables: Record<string, unknown>): unknown {
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return expr.slice(1, -1);
  }
  if (expr.startsWith("'") && expr.endsWith("'")) {
    return expr.slice(1, -1);
  }

  const num = Number(expr);
  if (!isNaN(num)) {
    return num;
  }

  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;

  const result = interpolateValue(`\${${expr}}`, variables);
  return result.value;
}

export function createScheduler(): StepScheduler {
  return new StepScheduler();
}

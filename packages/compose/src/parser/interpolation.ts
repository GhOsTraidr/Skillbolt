import type { ExecutionContext } from '../types/context.js';

const VARIABLE_PATTERN = /\$\{([^}]+)\}/g;
const DEFAULT_VALUE_PATTERN = /^(.+?):-(.*)$/;

export interface InterpolationResult {
  value: unknown;
  hasUnresolved: boolean;
  unresolvedVars: string[];
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, indexStr] = arrayMatch;
      const index = parseInt(indexStr!, 10);
      current = (current as Record<string, unknown>)[key!];
      if (Array.isArray(current)) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
}

export function parseVariableExpression(expr: string): {
  path: string;
  defaultValue?: string;
} {
  const defaultMatch = expr.match(DEFAULT_VALUE_PATTERN);
  if (defaultMatch) {
    return {
      path: defaultMatch[1]!.trim(),
      defaultValue: defaultMatch[2],
    };
  }
  return { path: expr.trim() };
}

export function resolveVariable(expr: string, variables: Record<string, unknown>): unknown {
  const { path, defaultValue } = parseVariableExpression(expr);

  if (path.startsWith('env.')) {
    const envVar = path.slice(4);
    const value = process.env[envVar];
    return value !== undefined ? value : defaultValue;
  }

  const value = getNestedValue(variables, path);
  if (value !== undefined) {
    return value;
  }

  return defaultValue;
}

export function interpolateString(
  template: string,
  variables: Record<string, unknown>
): InterpolationResult {
  const unresolvedVars: string[] = [];
  let hasUnresolved = false;

  const result = template.replace(VARIABLE_PATTERN, (match, expr: string) => {
    const value = resolveVariable(expr, variables);

    if (value === undefined) {
      hasUnresolved = true;
      unresolvedVars.push(expr);
      return match;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return JSON.stringify(value);
  });

  const isSingleVariable = template.match(/^\$\{[^}]+\}$/) !== null;
  if (isSingleVariable && !hasUnresolved) {
    const expr = template.slice(2, -1);
    const value = resolveVariable(expr, variables);
    return { value, hasUnresolved: false, unresolvedVars: [] };
  }

  return { value: result, hasUnresolved, unresolvedVars };
}

export function interpolateValue(
  value: unknown,
  variables: Record<string, unknown>
): InterpolationResult {
  if (typeof value === 'string') {
    return interpolateString(value, variables);
  }

  if (Array.isArray(value)) {
    const results = value.map((item) => interpolateValue(item, variables));
    const hasUnresolved = results.some((r) => r.hasUnresolved);
    const unresolvedVars = results.flatMap((r) => r.unresolvedVars);
    return {
      value: results.map((r) => r.value),
      hasUnresolved,
      unresolvedVars,
    };
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    let hasUnresolved = false;
    const unresolvedVars: string[] = [];

    for (const [key, val] of Object.entries(value)) {
      const interpolated = interpolateValue(val, variables);
      result[key] = interpolated.value;
      if (interpolated.hasUnresolved) {
        hasUnresolved = true;
        unresolvedVars.push(...interpolated.unresolvedVars);
      }
    }

    return { value: result, hasUnresolved, unresolvedVars };
  }

  return { value, hasUnresolved: false, unresolvedVars: [] };
}

export function interpolate(value: unknown, context: ExecutionContext): unknown {
  const variables = context.getAllVariables();
  const result = interpolateValue(value, variables);
  return result.value;
}

export function hasVariables(value: unknown): boolean {
  if (typeof value === 'string') {
    return VARIABLE_PATTERN.test(value);
  }

  if (Array.isArray(value)) {
    return value.some(hasVariables);
  }

  if (value !== null && typeof value === 'object') {
    return Object.values(value).some(hasVariables);
  }

  return false;
}

export function extractVariables(template: string): string[] {
  const matches = template.matchAll(VARIABLE_PATTERN);
  const variables: string[] = [];

  for (const match of matches) {
    const { path } = parseVariableExpression(match[1]!);
    variables.push(path);
  }

  return variables;
}

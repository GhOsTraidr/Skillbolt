import type { LintResult } from '../types/index.js';
import { stylishFormatter } from './stylish.js';
import { jsonFormatter } from './json.js';
import { githubFormatter } from './github.js';

export type FormatterName = 'stylish' | 'json' | 'github';
export type FormatterFunction = (results: LintResult[]) => string;

export const formatters: Record<FormatterName, FormatterFunction> = {
  stylish: stylishFormatter,
  json: jsonFormatter,
  github: githubFormatter,
};

export function getFormatter(name: FormatterName): FormatterFunction {
  const formatter = formatters[name];
  if (!formatter) {
    throw new Error(`Unknown formatter: ${name}`);
  }
  return formatter;
}

export { stylishFormatter, jsonFormatter, githubFormatter };

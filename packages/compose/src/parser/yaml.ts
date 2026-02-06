import { parse as parseYaml, YAMLParseError } from 'yaml';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { SkillboltError } from '@skillbolt/core';
import type { Workflow, WorkflowFile } from '../types/workflow.js';
import { validateWorkflow, type ValidationResult } from './validator.js';

export interface ParseOptions {
  validate?: boolean;
  strict?: boolean;
}

export interface ParseResult {
  workflow: Workflow;
  validation?: ValidationResult;
  raw: string;
}

export function parseWorkflowString(content: string, options: ParseOptions = {}): ParseResult {
  const { validate = true, strict = false } = options;

  let parsed: unknown;
  try {
    parsed = parseYaml(content, { strict: true });
  } catch (error) {
    if (error instanceof YAMLParseError) {
      throw new SkillboltError(`YAML parse error: ${error.message}`, 'PARSE_ERROR', {
        line: error.linePos?.[0]?.line,
        column: error.linePos?.[0]?.col,
      });
    }
    throw error;
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new SkillboltError('Invalid workflow: expected an object', 'VALIDATION_ERROR');
  }

  const result: ParseResult = {
    workflow: parsed as Workflow,
    raw: content,
  };

  if (validate) {
    const validation = validateWorkflow(parsed);
    result.validation = validation;

    if (!validation.valid && strict) {
      const errorMessages = validation.errors.map((e) => `  - ${e.path}: ${e.message}`).join('\n');
      throw new SkillboltError(`Workflow validation failed:\n${errorMessages}`, 'VALIDATION_ERROR', {
        errors: validation.errors,
      });
    }
  }

  return result;
}

export async function parseWorkflowFile(
  filePath: string,
  options: ParseOptions = {}
): Promise<WorkflowFile> {
  const absolutePath = path.resolve(filePath);

  let content: string;
  try {
    content = await fs.readFile(absolutePath, 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      throw new SkillboltError(`Workflow file not found: ${absolutePath}`, 'FILE_ERROR', {
        file: absolutePath,
      });
    }
    throw new SkillboltError(`Failed to read workflow file: ${err.message}`, 'FILE_ERROR', {
      file: absolutePath,
      cause: err,
    });
  }

  const result = parseWorkflowString(content, options);

  return {
    path: absolutePath,
    workflow: result.workflow,
    raw: content,
  };
}

export function stringifyWorkflow(workflow: Workflow): string {
  const { stringify } = require('yaml') as typeof import('yaml');
  return stringify(workflow, {
    indent: 2,
    lineWidth: 120,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'QUOTE_DOUBLE',
  });
}

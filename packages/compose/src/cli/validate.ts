import { logger } from '@skillbolt/core';
import { parseWorkflowString } from '../parser/yaml.js';
import * as fs from 'node:fs/promises';

export interface ValidateOptions {
  file?: string;
  content?: string;
  quiet?: boolean;
}

export async function validateCommand(options: ValidateOptions): Promise<boolean> {
  const { file, content, quiet = false } = options;

  if (!file && !content) {
    logger.error('Either --file or content must be provided');
    return false;
  }

  try {
    let rawContent: string;
    let sourceName: string;

    if (file) {
      rawContent = await fs.readFile(file, 'utf-8');
      sourceName = file;
    } else {
      rawContent = content!;
      sourceName = '<stdin>';
    }

    const result = parseWorkflowString(rawContent, { validate: true, strict: false });
    const validation = result.validation!;

    if (!quiet) {
      logger.info(`Validating: ${sourceName}`);
      logger.newline();
    }

    if (validation.valid) {
      if (!quiet) {
        logger.success('Workflow is valid');
        logger.newline();
        logger.info(`Name: ${result.workflow.name}`);
        if (result.workflow.description) {
          logger.info(`Description: ${result.workflow.description}`);
        }
        if (result.workflow.version) {
          logger.info(`Version: ${result.workflow.version}`);
        }
        logger.info(`Steps: ${result.workflow.steps.length}`);
      }
      return true;
    }

    if (!quiet) {
      logger.error(`Validation failed with ${validation.errors.length} error(s):`);
      logger.newline();

      for (const error of validation.errors) {
        logger.error(`  ${error.path}: ${error.message}`);
      }
    }

    return false;
  } catch (error) {
    const err = error as Error;
    if (!quiet) {
      logger.error(`Validation error: ${err.message}`);
    }
    return false;
  }
}

export async function validateFile(filePath: string): Promise<boolean> {
  return validateCommand({ file: filePath });
}

import type { InitOptions, TemplateType, PlatformType } from '../types.js';
import { isValidTemplate, isValidPlatform } from '../prompts/questions.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateInitOptions(options: InitOptions): ValidationResult {
  const errors: string[] = [];

  if (!options.directory || options.directory.trim().length === 0) {
    errors.push('Directory is required');
  }

  if (options.interactive === false) {
    if (!options.name || options.name.trim().length === 0) {
      errors.push('Name is required in non-interactive mode');
    }
    if (!options.description || options.description.trim().length === 0) {
      errors.push('Description is required in non-interactive mode');
    }
  }

  if (options.name && options.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (options.description && options.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (options.template && !isValidTemplate(options.template)) {
    errors.push(
      `Invalid template: ${options.template}. Valid options: minimal, standard, complete`
    );
  }

  if (options.platform && !isValidPlatform(options.platform)) {
    errors.push(
      `Invalid platform: ${options.platform}. Valid options: claude-code, codex, cursor, all`
    );
  }

  if (options.triggers) {
    for (const trigger of options.triggers) {
      if (trigger.length > 200) {
        errors.push(`Trigger phrase too long: "${trigger.slice(0, 50)}..."`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateName(name: string): string | true {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.length > 100) {
    return 'Name must be less than 100 characters';
  }
  return true;
}

export function validateDescription(description: string): string | true {
  if (!description || description.trim().length === 0) {
    return 'Description is required';
  }
  if (description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  return true;
}

export function validateTemplate(template: string): template is TemplateType {
  return isValidTemplate(template);
}

export function validatePlatform(platform: string): platform is PlatformType {
  return isValidPlatform(platform);
}

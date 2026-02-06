import type { SkillMetadata, TemplateType, PlatformType } from '../types.js';
import { TEMPLATE_CHOICES, PLATFORM_CHOICES, DEFAULTS } from '../types.js';

export interface QuestionConfig {
  name: keyof SkillMetadata;
  message: string;
  type: 'input' | 'select';
  validate?: (input: string) => string | true;
  filter?: (input: string) => string | string[];
  choices?: readonly { name: string; value: string }[];
  default?: string;
}

export const validateName = (input: string): string | true => {
  if (!input || input.trim().length === 0) {
    return 'Name is required';
  }
  if (input.length > 100) {
    return 'Name must be less than 100 characters';
  }
  return true;
};

export const validateDescription = (input: string): string | true => {
  if (!input || input.trim().length === 0) {
    return 'Description is required';
  }
  if (input.length > 500) {
    return 'Description must be less than 500 characters';
  }
  return true;
};

export const filterTriggers = (input: string): string[] => {
  if (!input || input.trim().length === 0) {
    return [];
  }
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export const questions: QuestionConfig[] = [
  {
    name: 'name',
    message: 'Skill name:',
    type: 'input',
    validate: validateName,
  },
  {
    name: 'description',
    message: 'Short description:',
    type: 'input',
    validate: validateDescription,
  },
  {
    name: 'triggers',
    message: 'Trigger phrases (comma separated):',
    type: 'input',
    filter: filterTriggers,
  },
  {
    name: 'template',
    message: 'Choose a template:',
    type: 'select',
    choices: TEMPLATE_CHOICES,
    default: DEFAULTS.template,
  },
  {
    name: 'platform',
    message: 'Target platform:',
    type: 'select',
    choices: PLATFORM_CHOICES,
    default: DEFAULTS.platform,
  },
];

export function createQuestions(defaults?: Partial<SkillMetadata>): QuestionConfig[] {
  if (!defaults) {
    return questions;
  }

  return questions.filter((q) => {
    const defaultValue = defaults[q.name];
    return defaultValue === undefined || defaultValue === '';
  });
}

export function isValidTemplate(value: string): value is TemplateType {
  return ['minimal', 'standard', 'complete'].includes(value);
}

export function isValidPlatform(value: string): value is PlatformType {
  return ['claude-code', 'codex', 'cursor', 'all'].includes(value);
}

export type {
  TemplateType,
  PlatformType,
  InitOptions,
  SkillMetadata,
  GeneratedResult,
  TemplateContext,
  TemplateFile,
  TemplateDefinition,
} from './types.js';

export { TEMPLATE_CHOICES, PLATFORM_CHOICES, DEFAULTS } from './types.js';

export { initSkill, getTreeDisplay } from './init.js';
export type { InitSkillCallbacks } from './init.js';

export {
  runInteractivePrompts,
  questions,
  createQuestions,
  validateName,
  validateDescription,
  filterTriggers,
  isValidTemplate,
  isValidPlatform,
} from './prompts/index.js';
export type { QuestionConfig } from './prompts/index.js';

export {
  loadTemplate,
  getTemplateDefinition,
  getTemplateFiles,
  renderTemplate,
  renderTemplateFile,
  createTemplateContext,
} from './templates/index.js';

export {
  generateDirectory,
  generateFiles,
  directoryExists,
  isDirectoryEmpty,
  displayTree,
} from './generators/index.js';
export type { DirectoryOptions } from './generators/index.js';

export {
  validateInitOptions,
  validateTemplate,
  validatePlatform,
  validateOutput,
} from './validators/index.js';
export type { ValidationResult, OutputValidationResult } from './validators/index.js';

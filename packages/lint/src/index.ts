export type {
  RuleSeverity,
  RuleCategory,
  RuleMeta,
  FixInfo,
  Fixer,
  ReportDescriptor,
  RuleContext,
  RuleVisitor,
  Rule,
  RuleModule,
  RuleConfigValue,
  RulesConfig,
  LintConfigInput,
  ResolvedLintConfig,
  LoadedConfig,
  LintMessage,
  LintResult,
  FixResult,
  LintSummary,
} from './types/index.js';

export { Linter } from './engine/linter.js';
export type { LinterOptions } from './engine/linter.js';
export { createRule, runRule } from './engine/rule-runner.js';
export { createFixer, applyFixes } from './engine/fixer.js';

export {
  rules,
  allRules,
  formatRules,
  styleRules,
  bestPracticesRules,
  referencesRules,
  frontmatterRequired,
  frontmatterFields,
  sectionsRequired,
  sectionNotEmpty,
  descriptionFormat,
  maxLength,
  examplesExist,
  triggersCount,
  stepsCount,
  noBrokenLinks,
} from './rules/index.js';

export {
  loadLintConfig,
  getResolvedConfig,
  defineConfig,
  defaultConfig,
  presets,
  recommendedRules,
  strictRules,
} from './config/index.js';

export {
  formatters,
  getFormatter,
  stylishFormatter,
  jsonFormatter,
  githubFormatter,
} from './formatters/index.js';
export type { FormatterName, FormatterFunction } from './formatters/index.js';

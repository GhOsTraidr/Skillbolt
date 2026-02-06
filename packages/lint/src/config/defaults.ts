import type { RulesConfig, ResolvedLintConfig } from '../types/index.js';

export const recommendedRules: RulesConfig = {
  'frontmatter-required': 'error',
  'frontmatter-fields': 'error',
  'sections-required': 'error',
  'section-not-empty': 'warn',
  'description-format': 'warn',
  'max-length': ['warn', { max: 10000 }],
  'examples-exist': 'warn',
  'no-broken-links': 'error',
};

export const strictRules: RulesConfig = {
  ...recommendedRules,
  'description-format': 'error',
  'examples-exist': 'error',
  'triggers-count': ['error', { min: 1, max: 10 }],
  'steps-count': ['warn', { max: 20 }],
};

export const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

export const defaultConfig: ResolvedLintConfig = {
  rules: recommendedRules,
  ignore: defaultIgnore,
};

export const presets: Record<string, ResolvedLintConfig> = {
  recommended: {
    rules: recommendedRules,
    ignore: defaultIgnore,
  },
  strict: {
    rules: strictRules,
    ignore: defaultIgnore,
  },
  off: {
    rules: {},
    ignore: defaultIgnore,
  },
};

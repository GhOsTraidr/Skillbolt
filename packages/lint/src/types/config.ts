import type { RuleSeverity } from './rule.js';

export type RuleConfigValue = RuleSeverity | [RuleSeverity, Record<string, unknown>];

export interface RulesConfig {
  [ruleId: string]: RuleConfigValue;
}

export interface LintConfigInput {
  extends?: string | string[];
  rules?: RulesConfig;
  ignore?: string[];
}

export interface ResolvedLintConfig {
  rules: RulesConfig;
  ignore: string[];
}

export interface LoadedConfig {
  config: LintConfigInput;
  filepath: string;
}

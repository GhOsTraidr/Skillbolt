import type { SkillPlatform } from './skill.js';

export type RuleSeverity = 'off' | 'warn' | 'error';

export interface LintRuleConfig {
  [ruleId: string]: RuleSeverity | [RuleSeverity, Record<string, unknown>];
}

export interface LintConfig {
  extends?: string;
  rules?: LintRuleConfig;
  ignore?: string[];
}

export interface RegistryConfig {
  remote?: string;
  cache?: string;
}

export interface SyncConfig {
  provider?: 'supabase' | 'custom';
  autoSync?: boolean;
}

export interface AnalyticsConfig {
  enabled?: boolean;
  anonymous?: boolean;
}

export interface DefaultsConfig {
  platform?: SkillPlatform;
  template?: string;
}

export interface TestConfig {
  timeout?: number;
}

export interface LLMConfig {
  provider?: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  timeout?: number;
  retries?: number;
}

export interface EmbeddingConfig {
  model?: string;
  batchSize?: number;
}

export interface TreeBuildConfig {
  branchingFactor?: number;
  maxDepth?: number;
  maxWorkers?: number;
}

export interface SearchConfig {
  maxParallel?: number;
  pruneEnabled?: boolean;
  temperature?: number;
  timeout?: number;
}

export interface ExecuteConfig {
  maxConcurrent?: number;
  nodeTimeout?: number;
  runsDir?: string;
}

export interface GuiConfig {
  port?: number;
  openBrowser?: boolean;
}

export interface GroupsConfig {
  default?: string;
}

export interface OpenClawConfig {
  /** Whether OpenClaw integration is enabled */
  enabled?: boolean;
  /** Gateway WebSocket URL */
  gatewayUrl?: string;
  /** Auto-sync skills */
  autoSync?: boolean;
  /** OpenClaw skills directory */
  skillsDir?: string;
  /** Default agent ID */
  defaultAgent?: string;
  /** Track execution costs */
  costTracking?: boolean;
}

export interface SkillboltConfig {
  extends?: string;
  lint?: LintConfig;
  registry?: RegistryConfig;
  sync?: SyncConfig;
  analytics?: AnalyticsConfig;
  defaults?: DefaultsConfig;
  test?: TestConfig;
  llm?: LLMConfig;
  embedding?: EmbeddingConfig;
  tree?: TreeBuildConfig;
  search?: SearchConfig;
  execute?: ExecuteConfig;
  gui?: GuiConfig;
  groups?: GroupsConfig;
  openclaw?: OpenClawConfig;
}

export interface GlobalConfig extends SkillboltConfig {
  configPath?: string;
}

export interface ProjectConfig extends SkillboltConfig {
  configPath?: string;
}

export interface ResolvedConfig {
  extends?: string;
  lint: Required<LintConfig>;
  registry: Required<RegistryConfig>;
  sync: Required<SyncConfig>;
  analytics: Required<AnalyticsConfig>;
  defaults: Required<DefaultsConfig>;
  test: Required<TestConfig>;
  isGlobal: boolean;
  isProject: boolean;
}

export const DEFAULT_CONFIG: SkillboltConfig = {
  lint: {
    extends: 'recommended',
    rules: {},
    ignore: ['**/node_modules/**'],
  },
  registry: {
    remote: 'https://skillbolt.com/api',
    cache: '~/.skill-kit/cache',
  },
  sync: {
    provider: 'supabase',
    autoSync: false,
  },
  analytics: {
    enabled: true,
    anonymous: true,
  },
  defaults: {
    platform: 'claude-code',
    template: 'standard',
  },
  test: {
    timeout: 5000,
  },
};

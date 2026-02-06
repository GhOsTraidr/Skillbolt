export interface SkillTestConfig {
  testDir: string;
  include: string[];
  exclude: string[];
  timeout: number;
  coverage: CoverageConfig;
  reporters: ReporterType[];
  mockDir?: string;
  watch: WatchConfig;
  parallel: boolean;
  maxWorkers: number;
  failFast: boolean;
  verbose: boolean;
  updateSnapshots: boolean;
  matchTypes: MatchTypeConfig;
}

export interface CoverageConfig {
  enabled: boolean;
  threshold: number;
  include: string[];
  exclude: string[];
  reporters: CoverageReporterType[];
  outputDir: string;
}

export interface WatchConfig {
  debounce: number;
  clearScreen: boolean;
  additionalPatterns: string[];
}

export interface MatchTypeConfig {
  exact: boolean;
  contains: boolean;
  fuzzy: boolean;
  regex: boolean;
  semantic: boolean;
  fuzzyThreshold: number;
}

export type ReporterType = 'console' | 'json' | 'html' | 'junit' | 'tap';

export type CoverageReporterType = 'text' | 'json' | 'html' | 'lcov' | 'cobertura';

export type PartialSkillTestConfig = Partial<{
  [K in keyof SkillTestConfig]: K extends 'coverage'
    ? Partial<CoverageConfig>
    : K extends 'watch'
      ? Partial<WatchConfig>
      : K extends 'matchTypes'
        ? Partial<MatchTypeConfig>
        : SkillTestConfig[K];
}>;

export const DEFAULT_TEST_CONFIG: SkillTestConfig = {
  testDir: 'tests',
  include: ['**/*.skilltest.ts', '**/*.skilltest.js'],
  exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  timeout: 10000,
  coverage: {
    enabled: false,
    threshold: 80,
    include: ['**/*.md'],
    exclude: [],
    reporters: ['text', 'json'],
    outputDir: 'coverage',
  },
  reporters: ['console'],
  watch: {
    debounce: 300,
    clearScreen: true,
    additionalPatterns: ['**/*.md'],
  },
  parallel: false,
  maxWorkers: 4,
  failFast: false,
  verbose: false,
  updateSnapshots: false,
  matchTypes: {
    exact: true,
    contains: true,
    fuzzy: true,
    regex: true,
    semantic: false,
    fuzzyThreshold: 0.7,
  },
};

export interface CliOptions {
  config?: string;
  testDir?: string;
  timeout?: number;
  coverage?: boolean;
  reporter?: ReporterType;
  watch?: boolean;
  verbose?: boolean;
  failFast?: boolean;
  pattern?: string;
  updateSnapshots?: boolean;
}

export interface LoadedConfig {
  config: SkillTestConfig;
  filepath?: string;
  fromFile: boolean;
}

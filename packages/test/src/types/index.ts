// Test types
export type {
  MatchType,
  MatchResult,
  TestCase,
  TestSuite,
  TestCaseResult,
  TestSuiteResult,
  TestRunResult,
  TestError,
  MockConfig,
  DefineTestsOptions,
} from './test.js';

// Config types
export type {
  SkillTestConfig,
  CoverageConfig,
  WatchConfig,
  MatchTypeConfig,
  ReporterType,
  CoverageReporterType,
  PartialSkillTestConfig,
  CliOptions,
  LoadedConfig,
} from './config.js';

export { DEFAULT_TEST_CONFIG } from './config.js';

// Coverage types
export type {
  TriggerCoverage,
  SectionCoverage,
  SkillCoverage,
  CoverageReport,
  CoverageSummary,
  CoverageCollectorState,
  SkillCoverageData,
} from './coverage.js';

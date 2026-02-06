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
  SkillTestConfig,
  CoverageConfig,
  WatchConfig,
  MatchTypeConfig,
  ReporterType,
  CoverageReporterType,
  PartialSkillTestConfig,
  CliOptions,
  LoadedConfig,
  TriggerCoverage,
  SectionCoverage,
  SkillCoverage,
  CoverageReport,
  CoverageSummary,
} from './types/index.js';

export { DEFAULT_TEST_CONFIG } from './types/index.js';

export {
  createTestRunner,
  runTests,
  type TestRunner,
  type TestRunnerOptions,
} from './runner/index.js';

export { executeTestCase, executeTestSuite, type ExecutorOptions } from './runner/index.js';

export {
  createMatcher,
  matchTrigger,
  matchExact,
  matchContains,
  matchFuzzy,
  matchRegex,
  type MatcherOptions,
} from './runner/index.js';

export {
  createMockProvider,
  createRecorder,
  loadRecording,
  recordResponses,
  replayResponses,
  type MockLLMProvider,
  type MockProviderOptions,
  type RecordedResponse,
  type RecordingSession,
  type ResponseRecorder,
} from './mock/index.js';

export {
  createCoverageCollector,
  collectCoverage,
  calculateTriggerCoverage,
  type CoverageCollector,
} from './coverage/index.js';

export {
  createTextReporter,
  createJsonReporter,
  createHtmlReporter,
  createCoverageReporter,
  generateCoverageReport,
  type CoverageReporter,
  type CoverageReporterOptions,
} from './coverage/index.js';

export { loadTestConfig, defineConfig, type LoadConfigOptions } from './config/index.js';

export { ConsoleReporter, JsonReporter, HtmlReporter } from './reporters/index.js';

export { defineTests } from './utils/index.js';

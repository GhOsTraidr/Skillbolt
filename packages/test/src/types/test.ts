import type { SkillFile } from '@skillbolt/core';

/**
 * Match type for trigger matching
 */
export type MatchType = 'exact' | 'contains' | 'fuzzy' | 'regex' | 'semantic';

/**
 * Result of a trigger match operation
 */
export interface MatchResult {
  /** Whether the input matched any trigger */
  matched: boolean;
  /** The trigger that was matched (if any) */
  trigger?: string;
  /** Confidence score from 0 to 1 */
  confidence: number;
  /** Type of match that succeeded */
  matchType: MatchType;
  /** Additional match details */
  details?: Record<string, unknown>;
}

/**
 * A single test case
 */
export interface TestCase {
  /** Unique name for this test case */
  name: string;
  /** The user input to test */
  input: string;
  /** Whether the skill should trigger */
  shouldTrigger: boolean;
  /** Expected skill name (for multi-skill testing) */
  expectedSkill?: string;
  /** Expected match type */
  matchType?: MatchType;
  /** Minimum expected confidence (0-1) */
  minConfidence?: number;
  /** Tags for filtering tests */
  tags?: string[];
  /** Setup function to run before this test */
  setup?: () => void | Promise<void>;
  /** Teardown function to run after this test */
  teardown?: () => void | Promise<void>;
  /** Skip this test */
  skip?: boolean;
  /** Only run this test */
  only?: boolean;
  /** Test timeout in milliseconds */
  timeout?: number;
}

/**
 * A collection of test cases
 */
export interface TestSuite {
  /** Name of the test suite */
  name: string;
  /** Description of what this suite tests */
  description?: string;
  /** Path to the SKILL.md file being tested */
  skill?: string;
  /** Parsed skill file (resolved at runtime) */
  skillFile?: SkillFile;
  /** Test cases in this suite */
  cases: TestCase[];
  /** Tags for filtering suites */
  tags?: string[];
  /** Default timeout for all tests in ms */
  timeout?: number;
  /** Setup function to run before all tests */
  beforeAll?: () => void | Promise<void>;
  /** Teardown function to run after all tests */
  afterAll?: () => void | Promise<void>;
  /** Setup function to run before each test */
  beforeEach?: () => void | Promise<void>;
  /** Teardown function to run after each test */
  afterEach?: () => void | Promise<void>;
  /** Mock configuration for this suite */
  mock?: MockConfig;
}

/**
 * Result of a single test case execution
 */
export interface TestCaseResult {
  /** Name of the test */
  name: string;
  /** Whether the test passed */
  passed: boolean;
  /** Expected value */
  expected: boolean;
  /** Actual value */
  actual: boolean;
  /** Match result details */
  matchResult?: MatchResult;
  /** Time taken in milliseconds */
  duration: number;
  /** Error message if failed */
  error?: string;
  /** Error stack trace */
  stack?: string;
  /** Whether the test was skipped */
  skipped?: boolean;
  /** Skip reason */
  skipReason?: string;
}

/**
 * Result of running a test suite
 */
export interface TestSuiteResult {
  /** Suite name */
  name: string;
  /** Skill file path */
  skillPath?: string;
  /** Total number of tests */
  total: number;
  /** Number of passed tests */
  passed: number;
  /** Number of failed tests */
  failed: number;
  /** Number of skipped tests */
  skipped: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Individual test results */
  results: TestCaseResult[];
  /** Errors that occurred during suite execution */
  errors: TestError[];
}

/**
 * Result of running multiple test suites
 */
export interface TestRunResult {
  /** Total number of suites run */
  totalSuites: number;
  /** Total number of tests */
  totalTests: number;
  /** Total passed */
  passed: number;
  /** Total failed */
  failed: number;
  /** Total skipped */
  skipped: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Results per suite */
  suites: TestSuiteResult[];
  /** Whether all tests passed */
  success: boolean;
}

/**
 * Test error information
 */
export interface TestError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Stack trace */
  stack?: string;
  /** File where error occurred */
  file?: string;
  /** Line number */
  line?: number;
}

/**
 * Mock configuration for LLM responses
 */
export interface MockConfig {
  /** Static responses keyed by skill name */
  responses?: Record<string, string>;
  /** Dynamic response templates */
  templates?: Record<string, (input: string) => string | Promise<string>>;
  /** Errors to simulate */
  errors?: Record<string, Error>;
  /** Response delay in milliseconds */
  delay?: number;
}

/**
 * Options for defining tests
 */
export interface DefineTestsOptions {
  /** Path to the SKILL.md file */
  skill: string;
  /** Test cases */
  cases: TestCase[];
  /** Suite-level mock configuration */
  mock?: MockConfig;
  /** Suite description */
  description?: string;
  /** Suite tags */
  tags?: string[];
  /** Default timeout */
  timeout?: number;
  /** Setup before all tests */
  beforeAll?: () => void | Promise<void>;
  /** Teardown after all tests */
  afterAll?: () => void | Promise<void>;
  /** Setup before each test */
  beforeEach?: () => void | Promise<void>;
  /** Teardown after each test */
  afterEach?: () => void | Promise<void>;
}

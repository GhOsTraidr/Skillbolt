import type {
  TestCase,
  TestCaseResult,
  TestSuite,
  TestSuiteResult,
  MatchResult,
} from '../types/index.js';
import { createMatcher } from './matcher.js';

export interface ExecutorOptions {
  timeout?: number;
  onTestStart?: (testCase: TestCase) => void;
  onTestEnd?: (result: TestCaseResult) => void;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function executeTestCase(
  testCase: TestCase,
  triggers: string[],
  options: ExecutorOptions = {}
): Promise<TestCaseResult> {
  const startTime = Date.now();
  const timeout = testCase.timeout ?? options.timeout ?? 10000;

  if (testCase.skip) {
    return {
      name: testCase.name,
      passed: true,
      expected: testCase.shouldTrigger,
      actual: testCase.shouldTrigger,
      duration: 0,
      skipped: true,
      skipReason: 'Test marked as skip',
    };
  }

  try {
    if (testCase.setup) {
      await withTimeout(
        Promise.resolve(testCase.setup()),
        timeout,
        `Setup timeout after ${timeout}ms`
      );
    }

    const matcher = createMatcher();
    const matchResult = matcher.match(testCase.input, triggers);

    let passed: boolean;
    if (testCase.shouldTrigger) {
      passed = matchResult.matched;
      if (passed && testCase.minConfidence !== undefined) {
        passed = matchResult.confidence >= testCase.minConfidence;
      }
      if (passed && testCase.matchType !== undefined) {
        passed = matchResult.matchType === testCase.matchType;
      }
    } else {
      passed = !matchResult.matched;
    }

    if (testCase.teardown) {
      await withTimeout(
        Promise.resolve(testCase.teardown()),
        timeout,
        `Teardown timeout after ${timeout}ms`
      );
    }

    const duration = Date.now() - startTime;

    const result: TestCaseResult = {
      name: testCase.name,
      passed,
      expected: testCase.shouldTrigger,
      actual: matchResult.matched,
      matchResult,
      duration,
    };

    if (!passed) {
      result.error = buildErrorMessage(testCase, matchResult);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return {
      name: testCase.name,
      passed: false,
      expected: testCase.shouldTrigger,
      actual: false,
      duration,
      error: errorMessage,
      stack: errorStack,
    };
  }
}

function buildErrorMessage(testCase: TestCase, matchResult: MatchResult): string {
  const lines: string[] = [];

  if (testCase.shouldTrigger && !matchResult.matched) {
    lines.push(`Expected skill to trigger, but it did not.`);
    lines.push(`Input: "${testCase.input}"`);
  } else if (!testCase.shouldTrigger && matchResult.matched) {
    lines.push(`Expected skill NOT to trigger, but it did.`);
    lines.push(`Input: "${testCase.input}"`);
    lines.push(`Matched trigger: "${matchResult.trigger}"`);
    lines.push(`Match type: ${matchResult.matchType}`);
    lines.push(`Confidence: ${(matchResult.confidence * 100).toFixed(1)}%`);
  } else if (
    testCase.minConfidence !== undefined &&
    matchResult.confidence < testCase.minConfidence
  ) {
    lines.push(`Confidence below threshold.`);
    lines.push(`Expected: >= ${(testCase.minConfidence * 100).toFixed(1)}%`);
    lines.push(`Actual: ${(matchResult.confidence * 100).toFixed(1)}%`);
  } else if (testCase.matchType !== undefined && matchResult.matchType !== testCase.matchType) {
    lines.push(`Match type mismatch.`);
    lines.push(`Expected: ${testCase.matchType}`);
    lines.push(`Actual: ${matchResult.matchType}`);
  }

  return lines.join('\n');
}

export async function executeTestSuite(
  suite: TestSuite,
  triggers: string[],
  options: ExecutorOptions = {}
): Promise<TestSuiteResult> {
  const startTime = Date.now();
  const results: TestCaseResult[] = [];
  const errors: Array<{ message: string; code?: string; stack?: string }> = [];

  const hasOnly = suite.cases.some((c) => c.only);
  const casesToRun = hasOnly ? suite.cases.filter((c) => c.only) : suite.cases;

  try {
    if (suite.beforeAll) {
      await Promise.resolve(suite.beforeAll());
    }

    for (const testCase of casesToRun) {
      options.onTestStart?.(testCase);

      if (suite.beforeEach) {
        await Promise.resolve(suite.beforeEach());
      }

      const result = await executeTestCase(testCase, triggers, {
        ...options,
        timeout: testCase.timeout ?? suite.timeout ?? options.timeout,
      });

      results.push(result);
      options.onTestEnd?.(result);

      if (suite.afterEach) {
        await Promise.resolve(suite.afterEach());
      }
    }

    if (suite.afterAll) {
      await Promise.resolve(suite.afterAll());
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push({
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  const duration = Date.now() - startTime;

  return {
    name: suite.name,
    skillPath: suite.skill,
    total: results.length,
    passed: results.filter((r) => r.passed && !r.skipped).length,
    failed: results.filter((r) => !r.passed && !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    duration,
    results,
    errors,
  };
}

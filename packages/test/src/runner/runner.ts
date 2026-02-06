import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { glob } from 'glob';
import { parseSkillString } from '@skillbolt/core';
import { parse as parseYaml } from 'yaml';
import type {
  TestSuite,
  TestRunResult,
  TestSuiteResult,
  SkillTestConfig,
  DefineTestsOptions,
  TestCase,
} from '../types/index.js';
import { executeTestSuite, type ExecutorOptions } from './executor.js';
import { DEFAULT_TEST_CONFIG } from '../types/config.js';

export interface TestRunnerOptions {
  config?: Partial<SkillTestConfig>;
  cwd?: string;
  watch?: boolean;
  coverage?: boolean;
  verbose?: boolean;
  onSuiteStart?: (suite: TestSuite) => void;
  onSuiteEnd?: (result: TestSuiteResult) => void;
  onTestStart?: ExecutorOptions['onTestStart'];
  onTestEnd?: ExecutorOptions['onTestEnd'];
}

export interface TestRunner {
  run(patterns: string[]): Promise<TestRunResult>;
  runFile(filePath: string): Promise<TestSuiteResult>;
  runAll(pattern?: string): Promise<TestRunResult>;
}

async function loadSkillFile(skillPath: string, basePath: string): Promise<string[]> {
  const fullPath = resolve(basePath, skillPath);
  const content = await readFile(fullPath, 'utf-8');
  const parsed = parseSkillString(content);
  return parsed.manifest.triggers ?? [];
}

async function loadTestFile(filePath: string): Promise<TestSuite> {
  const fullPath = resolve(filePath);
  const ext = extname(fullPath).toLowerCase();

  let config: DefineTestsOptions;

  if (ext === '.yaml' || ext === '.yml') {
    // Load YAML file
    const content = await readFile(fullPath, 'utf-8');
    const yamlConfig = parseYaml(content) as unknown;
    config = yamlConfig as DefineTestsOptions;
  } else {
    // Load JavaScript/TypeScript module
    const module = await import(fullPath);
    config = module.default;
  }

  if (!config || !Array.isArray(config.cases)) {
    throw new Error(`Invalid test file: ${filePath}. Expected 'cases' array.`);
  }

  return {
    name: config.description ?? filePath,
    description: config.description,
    skill: config.skill,
    cases: config.cases as TestCase[],
    tags: config.tags,
    timeout: config.timeout,
    beforeAll: config.beforeAll,
    afterAll: config.afterAll,
    beforeEach: config.beforeEach,
    afterEach: config.afterEach,
    mock: config.mock,
  };
}

export function createTestRunner(options: TestRunnerOptions = {}): TestRunner {
  const config = { ...DEFAULT_TEST_CONFIG, ...options.config };
  const cwd = options.cwd ?? process.cwd();

  async function runSuite(suite: TestSuite): Promise<TestSuiteResult> {
    options.onSuiteStart?.(suite);

    let triggers: string[] = [];

    if (suite.skill) {
      try {
        triggers = await loadSkillFile(suite.skill, cwd);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          name: suite.name,
          skillPath: suite.skill,
          total: suite.cases.length,
          passed: 0,
          failed: suite.cases.length,
          skipped: 0,
          duration: 0,
          results: [],
          errors: [{ message: `Failed to load skill file: ${errorMessage}` }],
        };
      }
    }

    if (suite.skillFile) {
      triggers = suite.skillFile.manifest.triggers ?? [];
    }

    const result = await executeTestSuite(suite, triggers, {
      timeout: config.timeout,
      onTestStart: options.onTestStart,
      onTestEnd: options.onTestEnd,
    });

    options.onSuiteEnd?.(result);

    return result;
  }

  async function runFile(filePath: string): Promise<TestSuiteResult> {
    const suite = await loadTestFile(filePath);
    return runSuite(suite);
  }

  async function run(patterns: string[]): Promise<TestRunResult> {
    const startTime = Date.now();
    const suites: TestSuiteResult[] = [];

    for (const pattern of patterns) {
      const testFiles = await glob(pattern, {
        cwd,
        ignore: config.exclude,
        absolute: true,
      });

      for (const file of testFiles) {
        try {
          const result = await runFile(file);
          suites.push(result);

          if (config.failFast && result.failed > 0) {
            break;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          suites.push({
            name: file,
            total: 0,
            passed: 0,
            failed: 1,
            skipped: 0,
            duration: 0,
            results: [],
            errors: [{ message: `Failed to run test file: ${errorMessage}` }],
          });
        }
      }

      if (config.failFast && suites.some((s) => s.failed > 0)) {
        break;
      }
    }

    const duration = Date.now() - startTime;
    const totalTests = suites.reduce((sum, s) => sum + s.total, 0);
    const passed = suites.reduce((sum, s) => sum + s.passed, 0);
    const failed = suites.reduce((sum, s) => sum + s.failed, 0);
    const skipped = suites.reduce((sum, s) => sum + s.skipped, 0);

    return {
      totalSuites: suites.length,
      totalTests,
      passed,
      failed,
      skipped,
      duration,
      suites,
      success: failed === 0,
    };
  }

  async function runAll(pattern?: string): Promise<TestRunResult> {
    if (pattern) {
      return run([pattern]);
    }
    return run(config.include);
  }

  return { run, runFile, runAll };
}

export async function runTests(
  suiteOrPath: TestSuite | string,
  options?: TestRunnerOptions
): Promise<TestSuiteResult> {
  const runner = createTestRunner(options);

  if (typeof suiteOrPath === 'string') {
    return runner.runFile(suiteOrPath);
  }

  // For TestSuite, we need to create a temporary runner and call runSuite
  const cwd = options?.cwd ?? process.cwd();
  const config = { ...DEFAULT_TEST_CONFIG, ...options?.config };

  // Recreate the runSuite logic here for TestSuite
  let triggers: string[] = [];

  if (suiteOrPath.skill) {
    try {
      triggers = await loadSkillFile(suiteOrPath.skill, cwd);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        name: suiteOrPath.name,
        skillPath: suiteOrPath.skill,
        total: suiteOrPath.cases.length,
        passed: 0,
        failed: suiteOrPath.cases.length,
        skipped: 0,
        duration: 0,
        results: [],
        errors: [{ message: `Failed to load skill file: ${errorMessage}` }],
      };
    }
  }

  if (suiteOrPath.skillFile) {
    triggers = suiteOrPath.skillFile.manifest.triggers ?? [];
  }

  return executeTestSuite(suiteOrPath, triggers, {
    timeout: config.timeout,
    onTestStart: options?.onTestStart,
    onTestEnd: options?.onTestEnd,
  });
}

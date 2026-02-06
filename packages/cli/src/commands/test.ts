import type { Command } from 'commander';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface TestModule {
  createTestRunner: (options: TestRunnerOptions) => TestRunner;
  loadTestConfig: (options: {
    configPath?: string;
    cwd?: string;
  }) => Promise<{ config: unknown } | null>;
}

interface TestRunnerOptions {
  config?: unknown;
  cwd?: string;
  watch?: boolean;
  coverage?: boolean;
  verbose?: boolean;
}

interface TestRunner {
  run: (patterns: string[]) => Promise<TestRunResult>;
}

interface TestCaseResult {
  name: string;
  passed: boolean;
  expected: boolean;
  actual: boolean;
  error?: string;
}

interface TestSuiteResult {
  name: string;
  results: TestCaseResult[];
}

interface TestRunResult {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: TestSuiteResult[];
}

export function registerTestCommand(program: Command): void {
  program
    .command('test [patterns...]')
    .description('Test Skill triggers and behavior')
    .option('-c, --config <path>', 'Path to test config file')
    .option('-w, --watch', 'Watch mode - rerun tests on file changes', false)
    .option('--coverage', 'Collect coverage information', false)
    .option('-v, --verbose', 'Verbose output', false)
    .action(
      async (
        patterns: string[],
        options: {
          config?: string;
          watch?: boolean;
          coverage?: boolean;
          verbose?: boolean;
        }
      ) => {
        const result = await loadCommandPackage<TestModule>('test');
        if (!result.success || !result.module) {
          handleMissingPackage('test');
        }

        const { createTestRunner, loadTestConfig } = result.module;
        const cwd = process.cwd();

        try {
          const loaded = await loadTestConfig({ configPath: options.config, cwd });
          const runner = createTestRunner({
            config: loaded?.config,
            cwd,
            watch: options.watch,
            coverage: options.coverage,
            verbose: options.verbose,
          });

          const testPatterns = patterns.length > 0 ? patterns : ['**/*.skill-test.{yaml,yml,json}'];
          const runResult = await runner.run(testPatterns);

          for (const suite of runResult.suites) {
            console.log(`\n${suite.name}`);
            for (const test of suite.results) {
              if (test.passed) {
                console.log(`  ✓ ${test.name}`);
              } else {
                console.log(`  ✗ ${test.name}`);
                if (test.error) {
                  console.log(`    Error: ${test.error}`);
                } else {
                  console.log(
                    `    Expected: triggered=${test.expected}, Actual: triggered=${test.actual}`
                  );
                }
              }
            }
          }

          console.log(`\nTest Results:`);
          console.log(`  Passed: ${runResult.passed}`);
          console.log(`  Failed: ${runResult.failed}`);
          console.log(`  Skipped: ${runResult.skipped}`);
          console.log(`  Duration: ${runResult.duration}ms`);

          if (runResult.failed > 0) {
            process.exit(1);
          }
        } catch (error) {
          handleError(error);
        }
      }
    );
}

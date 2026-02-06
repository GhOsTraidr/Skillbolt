import chalk from 'chalk';
import type { TestSuiteResult, TestRunResult, TestCaseResult } from '../types/index.js';

export interface ConsoleReporterOptions {
  verbose?: boolean;
}

export function createConsoleReporter(options: ConsoleReporterOptions = {}) {
  const { verbose = false } = options;

  function formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function reportTestResult(result: TestCaseResult): void {
    const icon = result.skipped
      ? chalk.yellow('○')
      : result.passed
        ? chalk.green('✓')
        : chalk.red('✗');
    const name = result.skipped
      ? chalk.yellow(result.name)
      : result.passed
        ? chalk.green(result.name)
        : chalk.red(result.name);
    const duration = chalk.gray(`(${formatDuration(result.duration)})`);

    console.log(`  ${icon} ${name} ${duration}`);

    if (!result.passed && !result.skipped && result.error) {
      const errorLines = result.error.split('\n');
      for (const line of errorLines) {
        console.log(chalk.red(`    ${line}`));
      }
      if (verbose && result.stack) {
        console.log(chalk.gray(`    ${result.stack}`));
      }
    }
  }

  function reportSuiteResult(result: TestSuiteResult): void {
    const statusIcon =
      result.failed > 0
        ? chalk.red('✗')
        : result.skipped === result.total
          ? chalk.yellow('○')
          : chalk.green('✓');

    console.log('');
    console.log(`${statusIcon} ${chalk.bold(result.name)}`);

    if (result.skillPath) {
      console.log(chalk.gray(`  Skill: ${result.skillPath}`));
    }

    for (const testResult of result.results) {
      reportTestResult(testResult);
    }

    for (const error of result.errors) {
      console.log(chalk.red(`  Error: ${error.message}`));
    }
  }

  function reportRunResult(result: TestRunResult): void {
    console.log('');
    console.log('='.repeat(60));
    console.log(chalk.bold('TEST RESULTS'));
    console.log('='.repeat(60));
    console.log('');

    for (const suite of result.suites) {
      reportSuiteResult(suite);
    }

    console.log('');
    console.log('-'.repeat(60));
    console.log(chalk.bold('SUMMARY'));
    console.log('-'.repeat(60));
    console.log(`Suites:  ${result.totalSuites}`);
    console.log(`Tests:   ${result.totalTests}`);
    console.log(`Passed:  ${chalk.green(result.passed.toString())}`);
    console.log(`Failed:  ${result.failed > 0 ? chalk.red(result.failed.toString()) : '0'}`);
    console.log(`Skipped: ${result.skipped > 0 ? chalk.yellow(result.skipped.toString()) : '0'}`);
    console.log(`Time:    ${formatDuration(result.duration)}`);
    console.log('');

    if (result.success) {
      console.log(chalk.green.bold('All tests passed!'));
    } else {
      console.log(chalk.red.bold('Some tests failed.'));
    }

    console.log('');
  }

  return {
    reportTestResult,
    reportSuiteResult,
    reportRunResult,
  };
}

export const ConsoleReporter = createConsoleReporter;

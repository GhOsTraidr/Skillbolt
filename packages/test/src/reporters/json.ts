import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { TestRunResult } from '../types/index.js';

export interface JsonReporterOptions {
  outputPath?: string;
  pretty?: boolean;
}

export function createJsonReporter(options: JsonReporterOptions = {}) {
  const { outputPath = 'test-results.json', pretty = true } = options;

  function generate(result: TestRunResult): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSuites: result.totalSuites,
        totalTests: result.totalTests,
        passed: result.passed,
        failed: result.failed,
        skipped: result.skipped,
        duration: result.duration,
        success: result.success,
      },
      suites: result.suites.map((suite) => ({
        name: suite.name,
        skillPath: suite.skillPath,
        total: suite.total,
        passed: suite.passed,
        failed: suite.failed,
        skipped: suite.skipped,
        duration: suite.duration,
        tests: suite.results.map((test) => ({
          name: test.name,
          passed: test.passed,
          skipped: test.skipped,
          duration: test.duration,
          expected: test.expected,
          actual: test.actual,
          error: test.error,
          matchResult: test.matchResult,
        })),
        errors: suite.errors,
      })),
    };

    return pretty ? JSON.stringify(report, null, 2) : JSON.stringify(report);
  }

  async function write(result: TestRunResult, filePath?: string): Promise<void> {
    const content = generate(result);
    const fullPath = resolve(filePath ?? outputPath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  return {
    generate,
    write,
  };
}

export const JsonReporter = createJsonReporter;

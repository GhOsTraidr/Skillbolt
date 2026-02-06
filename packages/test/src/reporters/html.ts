import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { TestRunResult } from '../types/index.js';

export interface HtmlReporterOptions {
  outputPath?: string;
  title?: string;
}

export function createHtmlReporter(options: HtmlReporterOptions = {}) {
  const { outputPath = 'test-report.html', title = 'Skill Test Report' } = options;

  function generate(result: TestRunResult): string {
    const statusColor = result.success ? '#28a745' : '#dc3545';
    const statusText = result.success ? 'PASSED' : 'FAILED';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { margin-bottom: 15px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
    .stat { background: white; padding: 15px; border-radius: 4px; text-align: center; }
    .stat-value { font-size: 2em; font-weight: bold; }
    .stat-value.passed { color: #28a745; }
    .stat-value.failed { color: #dc3545; }
    .stat-value.skipped { color: #ffc107; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; background: ${statusColor}; }
    .suite { background: white; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; overflow: hidden; }
    .suite-header { background: #f5f5f5; padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
    .suite-body { padding: 15px; }
    .test { padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; }
    .test:last-child { border-bottom: none; }
    .test-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
    .test-icon.passed { background: #28a745; }
    .test-icon.failed { background: #dc3545; }
    .test-icon.skipped { background: #ffc107; color: #333; }
    .test-name { flex: 1; }
    .test-duration { color: #666; font-size: 0.9em; }
    .test-error { background: #fff5f5; border-left: 3px solid #dc3545; padding: 10px; margin-top: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap; }
    .progress { height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
    .progress-bar { height: 100%; transition: width 0.3s; }
    .progress-bar.passed { background: #28a745; }
    .progress-bar.failed { background: #dc3545; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  
  <div class="summary">
    <div class="summary-grid">
      <div class="stat">
        <div class="stat-value">${result.totalSuites}</div>
        <div>Suites</div>
      </div>
      <div class="stat">
        <div class="stat-value">${result.totalTests}</div>
        <div>Tests</div>
      </div>
      <div class="stat">
        <div class="stat-value passed">${result.passed}</div>
        <div>Passed</div>
      </div>
      <div class="stat">
        <div class="stat-value failed">${result.failed}</div>
        <div>Failed</div>
      </div>
      <div class="stat">
        <div class="stat-value skipped">${result.skipped}</div>
        <div>Skipped</div>
      </div>
      <div class="stat">
        <span class="status">${statusText}</span>
        <div style="margin-top: 5px;">${(result.duration / 1000).toFixed(2)}s</div>
      </div>
    </div>
  </div>

  <h2>Test Suites</h2>
  ${result.suites
    .map(
      (suite) => `
    <div class="suite">
      <div class="suite-header">
        <div>
          <strong>${suite.name}</strong>
          ${suite.skillPath ? `<div style="font-size: 0.9em; color: #666;">${suite.skillPath}</div>` : ''}
        </div>
        <div>
          <span style="color: #28a745;">${suite.passed}</span> /
          <span style="color: #dc3545;">${suite.failed}</span> /
          <span style="color: #ffc107;">${suite.skipped}</span>
        </div>
      </div>
      <div class="suite-body">
        <div class="progress" style="margin-bottom: 15px;">
          <div class="progress-bar passed" style="width: ${suite.total > 0 ? (suite.passed / suite.total) * 100 : 0}%"></div>
        </div>
        ${suite.results
          .map(
            (test) => `
          <div class="test">
            <div class="test-icon ${test.skipped ? 'skipped' : test.passed ? 'passed' : 'failed'}">
              ${test.skipped ? '○' : test.passed ? '✓' : '✗'}
            </div>
            <div class="test-name">${test.name}</div>
            <div class="test-duration">${test.duration}ms</div>
          </div>
          ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('')}

  <footer style="margin-top: 30px; text-align: center; color: #666; font-size: 0.9em;">
    Generated: ${new Date().toISOString()} | @skillbolt/test
  </footer>
</body>
</html>`;
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

export const HtmlReporter = createHtmlReporter;

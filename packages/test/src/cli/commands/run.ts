import type { Command } from 'commander';
import { loadTestConfig } from '../../config/index.js';
import { createTestRunner } from '../../runner/index.js';
import {
  createConsoleReporter,
  createJsonReporter,
  createHtmlReporter,
} from '../../reporters/index.js';
import { generateCoverageReport, createCoverageCollector } from '../../coverage/index.js';
import type { CliOptions } from '../../types/index.js';

export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description('Run skill tests')
    .option('-c, --config <path>', 'Path to config file')
    .option('-d, --test-dir <dir>', 'Test directory')
    .option('-t, --timeout <ms>', 'Test timeout in milliseconds', parseInt)
    .option('--coverage', 'Enable coverage collection')
    .option('-r, --reporter <type>', 'Reporter type (console, json, html)')
    .option('-v, --verbose', 'Verbose output')
    .option('--fail-fast', 'Stop on first failure')
    .option('-p, --pattern <glob>', 'Test file pattern')
    .option('-u, --update-snapshots', 'Update snapshots')
    .action(async (opts: CliOptions) => {
      try {
        const { config } = await loadTestConfig({
          configPath: opts.config,
          cliOptions: opts,
        });

        const runner = createTestRunner({ config });
        const consoleReporter = createConsoleReporter({ verbose: config.verbose });
        const coverageCollector = config.coverage.enabled ? createCoverageCollector() : null;

        console.log('Running skill tests...\n');

        const result = await runner.runAll();

        consoleReporter.reportRunResult(result);

        if (config.reporters.includes('json')) {
          const jsonReporter = createJsonReporter();
          await jsonReporter.write(result, 'test-results.json');
          console.log('JSON report written to test-results.json');
        }

        if (config.reporters.includes('html')) {
          const htmlReporter = createHtmlReporter();
          await htmlReporter.write(result, 'test-report.html');
          console.log('HTML report written to test-report.html');
        }

        if (coverageCollector && config.coverage.enabled) {
          const coverageReport = coverageCollector.getReport(config.coverage.threshold);
          await generateCoverageReport(
            coverageReport,
            config.coverage.reporters,
            config.coverage.outputDir
          );
          console.log(`Coverage report written to ${config.coverage.outputDir}/`);

          if (!coverageReport.thresholdMet) {
            console.error(
              `Coverage ${coverageReport.summary.triggerCoverage.toFixed(1)}% below threshold ${config.coverage.threshold}%`
            );
            process.exit(1);
          }
        }

        process.exit(result.success ? 0 : 1);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

import { Command } from 'commander';
import { writeFileSync } from 'node:fs';
import { createCollector } from '../../collector/index.js';
import { generateReport, exportReport } from '../../reporter/index.js';
import type { ExportFormat } from '../../types/index.js';

export const exportCommand = new Command('export')
  .description('Export analytics report to file')
  .requiredOption('-f, --format <format>', 'Export format (json, csv, html)')
  .option('-o, --output <path>', 'Output file path')
  .option('-d, --days <number>', 'Number of days to include', '30')
  .option('-s, --skill <name>', 'Filter by skill name')
  .option('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--db <path>', 'Path to analytics database')
  .option('--include-events', 'Include raw event data')
  .action(
    (options: {
      format: string;
      output?: string;
      days: string;
      skill?: string;
      start?: string;
      end?: string;
      db?: string;
      includeEvents?: boolean;
    }) => {
      const format = options.format.toLowerCase() as ExportFormat;
      if (!['json', 'csv', 'html'].includes(format)) {
        console.error(`Invalid format: ${options.format}. Use json, csv, or html.`);
        process.exit(1);
      }

      const collector = createCollector({
        dbPath: options.db,
      });

      try {
        const endDate = options.end ? new Date(options.end) : new Date();
        const startDate = options.start
          ? new Date(options.start)
          : new Date(endDate.getTime() - parseInt(options.days, 10) * 24 * 60 * 60 * 1000);

        const events = collector.query({
          startDate,
          endDate,
          skillName: options.skill,
        });

        if (events.length === 0) {
          console.log('\nNo analytics data found for the specified period.\n');
          return;
        }

        const report = generateReport(events, {
          startDate,
          endDate,
          skills: options.skill ? [options.skill] : undefined,
        });

        const content = exportReport(report, events, {
          format,
          includeRawEvents: options.includeEvents,
        });

        const outputPath = options.output ?? `analytics-report.${format}`;
        writeFileSync(outputPath, content, 'utf-8');

        console.log(`\nReport exported to: ${outputPath}\n`);
      } finally {
        collector.close();
      }
    }
  );

import { Command } from 'commander';
import { createCollector } from '../../collector/index.js';
import { generateReport } from '../../reporter/index.js';
import { renderTerminalReport } from '../../reporter/terminal.js';

export const reportCommand = new Command('report')
  .description('Display usage analytics report')
  .option('-d, --days <number>', 'Number of days to include', '30')
  .option('-s, --skill <name>', 'Filter by skill name')
  .option('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--db <path>', 'Path to analytics database')
  .option('--no-suggestions', 'Exclude optimization suggestions')
  .action(
    (options: {
      days: string;
      skill?: string;
      start?: string;
      end?: string;
      db?: string;
      suggestions: boolean;
    }) => {
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
          console.log('Start tracking skill usage by calling trackEvent() in your code.\n');
          return;
        }

        const report = generateReport(events, {
          startDate,
          endDate,
          skills: options.skill ? [options.skill] : undefined,
          suggestions: options.suggestions,
        });

        console.log(renderTerminalReport(report));
      } finally {
        collector.close();
      }
    }
  );

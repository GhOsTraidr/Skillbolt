import { Command } from 'commander';
import chalk from 'chalk';
import { DEFAULT_ANALYTICS_CONFIG } from '../../types/index.js';
import { createCollector } from '../../collector/index.js';

export const configCommand = new Command('config')
  .description('View or update analytics configuration')
  .option('--db <path>', 'Path to analytics database')
  .option('--show', 'Show current configuration')
  .option('--status', 'Show database status')
  .action((options: { db?: string; show?: boolean; status?: boolean }) => {
    const showAll = !options.show && !options.status;

    if (showAll || options.show) {
      console.log('');
      console.log(chalk.bold('  Analytics Configuration'));
      console.log('');
      console.log(`  ${chalk.gray('Enabled:')}          ${DEFAULT_ANALYTICS_CONFIG.enabled}`);
      console.log(`  ${chalk.gray('Privacy Level:')}    ${DEFAULT_ANALYTICS_CONFIG.privacyLevel}`);
      console.log(
        `  ${chalk.gray('Database Path:')}    ${options.db ?? DEFAULT_ANALYTICS_CONFIG.dbPath}`
      );
      console.log(`  ${chalk.gray('Retention Days:')}   ${DEFAULT_ANALYTICS_CONFIG.retentionDays}`);
      console.log(`  ${chalk.gray('Auto Cleanup:')}     ${DEFAULT_ANALYTICS_CONFIG.autoCleanup}`);
      console.log('');
    }

    if (showAll || options.status) {
      const collector = createCollector({
        dbPath: options.db,
      });

      try {
        const stats = collector.getStorageStats();

        console.log(chalk.bold('  Database Status'));
        console.log('');

        if (stats) {
          const sizeKB = (stats.dbSizeBytes / 1024).toFixed(2);
          console.log(`  ${chalk.gray('Total Events:')}     ${stats.totalEvents}`);
          console.log(`  ${chalk.gray('Database Size:')}    ${sizeKB} KB`);
          console.log(
            `  ${chalk.gray('Oldest Event:')}     ${stats.oldestEvent?.split('T')[0] ?? 'N/A'}`
          );
          console.log(
            `  ${chalk.gray('Newest Event:')}     ${stats.newestEvent?.split('T')[0] ?? 'N/A'}`
          );
        } else {
          console.log('  No database initialized yet.');
        }

        console.log('');

        const dateRange = collector.getDateRange();
        const uniqueSkills = collector.getUniqueSkills();

        if (dateRange) {
          console.log(
            `  ${chalk.gray('Date Range:')}       ${dateRange.startDate.split('T')[0]} to ${dateRange.endDate.split('T')[0]}`
          );
        }
        console.log(`  ${chalk.gray('Unique Skills:')}    ${uniqueSkills.length}`);
        console.log('');
      } finally {
        collector.close();
      }
    }
  });

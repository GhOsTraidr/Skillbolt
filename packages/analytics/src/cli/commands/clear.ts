import { Command } from 'commander';
import chalk from 'chalk';
import { createCollector } from '../../collector/index.js';

export const clearCommand = new Command('clear')
  .description('Clear analytics data')
  .option('--db <path>', 'Path to analytics database')
  .option('--older-than <days>', 'Clear events older than N days')
  .option('-s, --skill <name>', 'Clear events for specific skill')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action((options: { db?: string; olderThan?: string; skill?: string; yes?: boolean }) => {
    const collector = createCollector({
      dbPath: options.db,
    });

    try {
      const stats = collector.getStorageStats();

      if (!stats || stats.totalEvents === 0) {
        console.log('\nNo analytics data to clear.\n');
        return;
      }

      const clearOptions: { olderThan?: Date; skillName?: string } = {};

      if (options.olderThan) {
        const days = parseInt(options.olderThan, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        clearOptions.olderThan = cutoffDate;
      }

      if (options.skill) {
        clearOptions.skillName = options.skill;
      }

      let description = 'All analytics data';
      if (clearOptions.olderThan) {
        description = `Events older than ${options.olderThan} days`;
      }
      if (clearOptions.skillName) {
        description += ` for skill "${clearOptions.skillName}"`;
      }

      if (!options.yes) {
        console.log('');
        console.log(chalk.yellow('  Warning: This action cannot be undone.'));
        console.log('');
        console.log(`  ${description}`);
        console.log(`  Current total events: ${stats.totalEvents}`);
        console.log('');
        console.log('  Use --yes to confirm deletion.');
        console.log('');
        return;
      }

      const deleted = collector.clear(clearOptions);

      console.log('');
      console.log(chalk.green(`  Successfully deleted ${deleted} event(s).`));
      console.log('');
    } finally {
      collector.close();
    }
  });

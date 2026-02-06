import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { createCollector } from '../../collector/index.js';
import { PatternAnalyzer } from '../../analyzer/patterns.js';
import { SuggestionGenerator } from '../../analyzer/suggestions.js';

export const analyzeCommand = new Command('analyze')
  .description('Analyze skill usage patterns')
  .option('-d, --days <number>', 'Number of days to analyze', '30')
  .option('--db <path>', 'Path to analytics database')
  .option('--triggers', 'Show trigger pattern analysis')
  .option('--unused', 'Show unused skills')
  .option('--suggestions', 'Show optimization suggestions')
  .action(
    (options: {
      days: string;
      db?: string;
      triggers?: boolean;
      unused?: boolean;
      suggestions?: boolean;
    }) => {
      const showAll = !options.triggers && !options.unused && !options.suggestions;

      const collector = createCollector({
        dbPath: options.db,
      });

      try {
        const endDate = new Date();
        const startDate = new Date(
          endDate.getTime() - parseInt(options.days, 10) * 24 * 60 * 60 * 1000
        );

        const events = collector.query({ startDate, endDate });

        if (events.length === 0) {
          console.log('\nNo analytics data found for the specified period.\n');
          return;
        }

        const analyzer = new PatternAnalyzer(events);
        const allSkills = collector.getUniqueSkills();

        console.log('');

        if (showAll || options.triggers) {
          const patterns = analyzer.getTriggerPatterns().slice(0, 15);

          if (patterns.length > 0) {
            console.log(chalk.bold('  Trigger Patterns'));
            console.log('');

            const table = new Table({
              head: ['Phrase', 'Skill', 'Count', 'Success'].map((h) => chalk.gray(h)),
              style: { head: [], 'padding-left': 2, 'padding-right': 2 },
            });

            for (const pattern of patterns) {
              const phrase =
                pattern.phrase.length > 30 ? pattern.phrase.slice(0, 27) + '...' : pattern.phrase;
              const successColor =
                pattern.successRate >= 0.8
                  ? chalk.green
                  : pattern.successRate >= 0.5
                    ? chalk.yellow
                    : chalk.red;

              table.push([
                phrase,
                pattern.skillName,
                String(pattern.count),
                successColor(`${(pattern.successRate * 100).toFixed(0)}%`),
              ]);
            }

            console.log(table.toString());
            console.log('');
          }
        }

        if (showAll || options.unused) {
          const unused = analyzer.getUnusedSkills(allSkills, 30);

          if (unused.length > 0) {
            console.log(chalk.bold.yellow('  Unused Skills (30+ days)'));
            console.log('');

            const table = new Table({
              head: ['Skill', 'Days Unused', 'Lifetime'].map((h) => chalk.gray(h)),
              style: { head: [], 'padding-left': 2, 'padding-right': 2 },
            });

            for (const skill of unused.slice(0, 10)) {
              table.push([
                skill.skillName,
                skill.daysSinceLastUse === Infinity ? 'Never' : String(skill.daysSinceLastUse),
                String(skill.lifetimeTriggers),
              ]);
            }

            console.log(table.toString());
            console.log('');
          }
        }

        if (showAll || options.suggestions) {
          const suggestionGen = new SuggestionGenerator(events, allSkills, []);
          const suggestions = suggestionGen.generate({ maxSuggestions: 10 });

          if (suggestions.length > 0) {
            console.log(chalk.bold('  Optimization Suggestions'));
            console.log('');

            for (const suggestion of suggestions) {
              const priorityColor =
                suggestion.priority === 'high'
                  ? chalk.red
                  : suggestion.priority === 'medium'
                    ? chalk.yellow
                    : chalk.gray;

              console.log(
                `  ${priorityColor(`[${suggestion.priority.toUpperCase()}]`)} ${chalk.cyan(suggestion.skillName)}`
              );
              console.log(`    ${suggestion.reason}`);
              console.log(`    ${chalk.italic(suggestion.suggestion)}`);
              console.log('');
            }
          }
        }
      } finally {
        collector.close();
      }
    }
  );

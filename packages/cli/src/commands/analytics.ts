import type { Command } from 'commander';
import {
  loadCommandPackage,
  handleMissingPackage as handleMissingPackageUnsafe,
  handleError,
} from '../utils/index.js';

const handleMissingPackage = (command: string): void => {
  handleMissingPackageUnsafe(command);
};

interface AnalyticsModule {
  generateReport: (events: unknown[], options: ReportOptions) => UsageReport;
  exportReport: (report: UsageReport, events: unknown[], options: ExportOptions) => string;
  renderTerminalReport: (report: UsageReport) => string;
  generateSuggestions: (
    events: unknown[],
    allSkillNames: string[],
    registeredTriggers: string[],
    options: SuggestionOptions
  ) => Suggestion[];
  createCollector: (options?: CollectorOptions) => AnalyticsCollector;
  trackEvent: (event: EventInput) => Promise<void>;
}

interface ExecutionModule {
  ExecutionMetricsStore: new (filePath?: string) => {
    list(options?: { last?: number }): Array<{
      runId: string;
      task: string;
      mode: string;
      skills: string[];
      totalDurationMs: number;
      totalTokens: { prompt: number; completion: number };
      estimatedCostUsd: number;
      status: string;
    }>;
  };
}

interface ReportOptions {
  startDate?: string | Date;
  endDate?: string | Date;
  skills?: string[];
  suggestions?: boolean;
}

interface ExportOptions {
  format: string;
  includeRawEvents?: boolean;
}

interface SuggestionOptions {
  unusedThresholdDays?: number;
  minConfidence?: number;
  maxSuggestions?: number;
  includeLowPriority?: boolean;
}

interface UsageReport {
  meta: {
    generatedAt: string;
    startDate: string;
    endDate: string;
    periodDays: number;
    totalEvents: number;
  };
  statistics: unknown;
  topSkills: Array<{
    skillName: string;
    triggers: number;
    successRate: number;
    avgDuration: number;
  }>;
  trends?: unknown;
  unusedSkills: Array<{
    skillName: string;
    daysSinceLastUse: number;
    lifetimeTriggers: number;
  }>;
  suggestions?: Suggestion[];
}

interface Suggestion {
  type: string;
  priority: string;
  skillName?: string;
  reason: string;
  suggestion: string;
  evidence?: string[];
  confidence: number;
}

interface CollectorOptions {
  enabled?: boolean;
  privacyLevel?: string;
  dbPath?: string;
  retentionDays?: number;
  autoCleanup?: boolean;
}

interface AnalyticsCollector {
  isEnabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
  query: (options: QueryOptions) => unknown[];
  getUniqueSkills: () => string[];
  getDateRange: () => { startDate: string; endDate: string } | null;
  getStorageStats: () => StorageStats | null;
  close: () => void;
}

interface QueryOptions {
  startDate?: Date;
  endDate?: Date;
  skillName?: string;
}

interface StorageStats {
  totalEvents: number;
  dbSizeBytes: number;
  oldestEvent?: string;
  newestEvent?: string;
}

interface EventInput {
  type: string;
  skillName?: string;
  metadata?: Record<string, unknown>;
}

export function registerAnalyticsCommand(program: Command): void {
  const analytics = program
    .command('analytics')
    .description('Analyze Skill usage and get optimization suggestions');

  analytics
    .command('report')
    .description('Generate usage report')
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .option('-d, --days <number>', 'Number of days to include', '30')
    .option('-s, --skill <name>', 'Filter by skill name')
    .option('-f, --format <format>', 'Output format (terminal, json, csv, html)', 'terminal')
    .option('-o, --output <path>', 'Output file path')
    .option('--db <path>', 'Path to analytics database')
    .option('--no-suggestions', 'Exclude optimization suggestions')
    .action(
      async (options: {
        from?: string;
        to?: string;
        days: string;
        skill?: string;
        format: string;
        output?: string;
        db?: string;
        suggestions: boolean;
      }) => {
        const result = await loadCommandPackage<AnalyticsModule>('analytics');
        if (!result.success || !result.module) {
          return handleMissingPackage('analytics');
        }

        const { generateReport, exportReport, renderTerminalReport, createCollector } =
          result.module;

        try {
          const collector = createCollector({
            dbPath: options.db,
          });

          try {
            const endDate = options.to ? new Date(options.to) : new Date();
            const startDate = options.from
              ? new Date(options.from)
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

            if (options.output) {
              const content = exportReport(report, events, {
                format: options.format,
              });
              require('fs').writeFileSync(options.output, content, 'utf-8');
              console.log(`\nReport exported to: ${options.output}\n`);
            } else if (options.format === 'json') {
              console.log(JSON.stringify(report, null, 2));
            } else {
              console.log(renderTerminalReport(report));
            }
          } finally {
            collector.close();
          }
        } catch (error) {
          handleError(error);
        }
      }
    );

  analytics
    .command('analyze')
    .description('Analyze skill usage patterns')
    .option('-d, --days <number>', 'Number of days to analyze', '30')
    .option('--db <path>', 'Path to analytics database')
    .option('--triggers', 'Show trigger pattern analysis')
    .option('--unused', 'Show unused skills')
    .option('--suggestions', 'Show optimization suggestions')
    .action(
      async (options: {
        days: string;
        db?: string;
        triggers?: boolean;
        unused?: boolean;
        suggestions?: boolean;
      }) => {
        const result = await loadCommandPackage<AnalyticsModule>('analytics');
        if (!result.success || !result.module) {
          return handleMissingPackage('analytics');
        }

        const { createCollector, generateSuggestions } = result.module;

        try {
          const collector = createCollector({
            dbPath: options.db,
          });

          try {
            const showAll = !options.triggers && !options.unused && !options.suggestions;

            const endDate = new Date();
            const startDate = new Date(
              endDate.getTime() - parseInt(options.days, 10) * 24 * 60 * 60 * 1000
            );

            const events = collector.query({ startDate, endDate });

            if (events.length === 0) {
              console.log('\nNo analytics data found for the specified period.\n');
              return;
            }

            const allSkills = collector.getUniqueSkills();

            console.log('');

            if (showAll || options.triggers) {
              const triggerMap = new Map<
                string,
                { count: number; success: number; skillName: string }
              >();

              for (const event of events as Array<{
                triggerPhrase?: string;
                success?: boolean;
                skillName: string;
              }>) {
                if (event.triggerPhrase) {
                  const key = event.triggerPhrase.toLowerCase();
                  if (!triggerMap.has(key)) {
                    triggerMap.set(key, { count: 0, success: 0, skillName: event.skillName });
                  }
                  const data = triggerMap.get(key)!;
                  data.count++;
                  if (event.success) data.success++;
                }
              }

              const patterns = Array.from(triggerMap.entries())
                .map(([phrase, data]) => ({
                  phrase,
                  count: data.count,
                  successRate: data.success / data.count,
                  skillName: data.skillName,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 15);

              if (patterns.length > 0) {
                const chalk = (await import('chalk')).default;
                const Table = (await import('cli-table3')).default;

                console.log(chalk.bold('  Trigger Patterns'));
                console.log('');

                const table = new Table({
                  head: ['Phrase', 'Skill', 'Count', 'Success'].map((h) => chalk.gray(h)),
                  style: { head: [], 'padding-left': 2, 'padding-right': 2 },
                });

                for (const pattern of patterns) {
                  const phrase =
                    pattern.phrase.length > 30
                      ? pattern.phrase.slice(0, 27) + '...'
                      : pattern.phrase;
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
              const now = new Date();
              const skillLastUsed = new Map<string, { lastUsed: Date; count: number }>();

              for (const event of events as Array<{ skillName: string; timestamp: string }>) {
                const existing = skillLastUsed.get(event.skillName);
                const eventDate = new Date(event.timestamp);
                if (!existing || eventDate > existing.lastUsed) {
                  skillLastUsed.set(event.skillName, { lastUsed: eventDate, count: 1 });
                } else {
                  existing.count++;
                }
              }

              const unused = allSkills
                .map((skillName) => {
                  const usage = skillLastUsed.get(skillName);
                  if (!usage) {
                    return { skillName, daysSinceLastUse: Infinity, lifetimeTriggers: 0 };
                  }
                  const daysSince = Math.floor(
                    (now.getTime() - usage.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return { skillName, daysSinceLastUse: daysSince, lifetimeTriggers: usage.count };
                })
                .filter((skill) => skill.daysSinceLastUse >= 30)
                .sort((a, b) => b.daysSinceLastUse - a.daysSinceLastUse)
                .slice(0, 10);

              if (unused.length > 0) {
                const chalk = (await import('chalk')).default;
                const Table = (await import('cli-table3')).default;

                console.log(chalk.bold.yellow('  Unused Skills (30+ days)'));
                console.log('');

                const table = new Table({
                  head: ['Skill', 'Days Unused', 'Lifetime'].map((h) => chalk.gray(h)),
                  style: { head: [], 'padding-left': 2, 'padding-right': 2 },
                });

                for (const skill of unused) {
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
              const suggestions = generateSuggestions(events, allSkills, [], {
                maxSuggestions: 10,
              });

              if (suggestions.length > 0) {
                const chalk = (await import('chalk')).default;

                console.log(chalk.bold('  Optimization Suggestions'));
                console.log('');

                for (const suggestion of suggestions.slice(0, 10)) {
                  const priorityColor =
                    suggestion.priority === 'high'
                      ? chalk.red
                      : suggestion.priority === 'medium'
                        ? chalk.yellow
                        : chalk.gray;
                  console.log(
                    `  ${priorityColor(`[${suggestion.priority.toUpperCase()}]`)} ${chalk.cyan(suggestion.skillName || 'Unknown')}`
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
        } catch (error) {
          handleError(error);
        }
      }
    );

  analytics
    .command('suggest')
    .description('Get optimization suggestions')
    .option('-d, --days <number>', 'Number of days to analyze', '30')
    .option('--db <path>', 'Path to analytics database')
    .option('--include-unused', 'Include suggestions for unused skills', false)
    .action(async (options: { days: string; db?: string; includeUnused: boolean }) => {
      const result = await loadCommandPackage<AnalyticsModule>('analytics');
      if (!result.success || !result.module) {
        return handleMissingPackage('analytics');
      }

      const { generateSuggestions, createCollector } = result.module;

      try {
        const collector = createCollector({
          dbPath: options.db,
        });

        try {
          const endDate = new Date();
          const startDate = new Date(
            endDate.getTime() - parseInt(options.days, 10) * 24 * 60 * 60 * 1000
          );

          const events = collector.query({ startDate, endDate });
          const allSkills = collector.getUniqueSkills();

          const suggestions = generateSuggestions(events, allSkills, [], {
            includeLowPriority: options.includeUnused,
          });

          if (suggestions.length === 0) {
            console.log('\nNo suggestions at this time. Keep using your skills!\n');
            return;
          }

          const chalk = (await import('chalk')).default;

          console.log('\n  Optimization Suggestions:\n');
          for (const suggestion of suggestions) {
            const priorityColor =
              suggestion.priority === 'high'
                ? chalk.red
                : suggestion.priority === 'medium'
                  ? chalk.yellow
                  : chalk.gray;
            console.log(
              `  ${priorityColor(`[${suggestion.priority.toUpperCase()}]`)} ${suggestion.type}`
            );
            console.log(`    ${suggestion.reason}`);
            console.log(`    ${chalk.italic(suggestion.suggestion)}`);
            if (suggestion.skillName) {
              console.log(`    Skill: ${suggestion.skillName}`);
            }
            console.log('');
          }
        } finally {
          collector.close();
        }
      } catch (error) {
        handleError(error);
      }
    });

  analytics
    .command('config')
    .description('Configure analytics collection')
    .option('--db <path>', 'Path to analytics database')
    .option('--status', 'Show current status')
    .action(async (options: { db?: string; status?: boolean }) => {
      const result = await loadCommandPackage<AnalyticsModule>('analytics');
      if (!result.success || !result.module) {
        return handleMissingPackage('analytics');
      }

      const { createCollector } = result.module;
      const collector = createCollector({
        dbPath: options.db,
      });

      try {
        const stats = collector.getStorageStats();
        const dateRange = collector.getDateRange();
        const uniqueSkills = collector.getUniqueSkills();

        const chalk = (await import('chalk')).default;

        console.log('');
        console.log(chalk.bold('  Database Status'));
        console.log('');

        if (stats) {
          const sizeKB = (stats.dbSizeBytes / 1024).toFixed(2);
          console.log(`  ${chalk.gray('Total Events:')}     ${stats.totalEvents}`);
          console.log(`  ${chalk.gray('Database Size:')}    ${sizeKB} KB`);
          console.log(
            `  ${chalk.gray('Oldest Event:')}     ${stats.oldestEvent?.split('T')[0] || 'N/A'}`
          );
          console.log(
            `  ${chalk.gray('Newest Event:')}     ${stats.newestEvent?.split('T')[0] || 'N/A'}`
          );
        } else {
          console.log('  No database initialized yet.');
        }

        console.log('');
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
    });

  analytics
    .command('cost')
    .description('Show execution cost breakdown')
    .option('-n, --last <n>', 'Number of recent executions', '10')
    .option('--db <path>', 'Path to metrics file')
    .action(async (options: { last: string; db?: string }) => {
      const result = await loadCommandPackage<AnalyticsModule & ExecutionModule>('analytics');
      if (!result.success || !result.module) {
        return handleMissingPackage('analytics');
      }

      try {
        const { ExecutionMetricsStore } = result.module as unknown as ExecutionModule;
        const store = new ExecutionMetricsStore(options.db);
        const entries = store.list({ last: parseInt(options.last, 10) });

        if (entries.length === 0) {
          console.log('\nNo execution metrics found.\n');
          return;
        }

        const chalk = (await import('chalk')).default;
        const Table = (await import('cli-table3')).default;

        console.log(chalk.cyan('\n  Execution Cost Breakdown\n'));

        const table = new Table({
          head: ['Run', 'Task', 'Mode', 'Tokens', 'Cost', 'Duration'].map((h) => chalk.gray(h)),
          style: { head: [], 'padding-left': 2, 'padding-right': 2 },
        });

        let totalCost = 0;
        for (const entry of entries) {
          const taskShort = entry.task.length > 30 ? entry.task.slice(0, 27) + '...' : entry.task;
          const tokens = entry.totalTokens.prompt + entry.totalTokens.completion;
          const duration = `${(entry.totalDurationMs / 1000).toFixed(1)}s`;
          totalCost += entry.estimatedCostUsd;

          table.push([
            entry.runId.slice(0, 20),
            taskShort,
            entry.mode,
            String(tokens),
            `$${entry.estimatedCostUsd.toFixed(4)}`,
            duration,
          ]);
        }

        console.log(table.toString());
        console.log(chalk.bold(`\n  Total: $${totalCost.toFixed(4)}\n`));
      } catch (error) {
        handleError(error);
      }
    });

  analytics
    .command('runs')
    .description('Show execution history')
    .option('-n, --last <n>', 'Number of recent executions', '10')
    .option('--db <path>', 'Path to metrics file')
    .action(async (options: { last: string; db?: string }) => {
      const result = await loadCommandPackage<AnalyticsModule & ExecutionModule>('analytics');
      if (!result.success || !result.module) {
        return handleMissingPackage('analytics');
      }

      try {
        const { ExecutionMetricsStore } = result.module as unknown as ExecutionModule;
        const store = new ExecutionMetricsStore(options.db);
        const entries = store.list({ last: parseInt(options.last, 10) });

        if (entries.length === 0) {
          console.log('\nNo execution history found.\n');
          return;
        }

        const chalk = (await import('chalk')).default;
        const Table = (await import('cli-table3')).default;

        console.log(chalk.cyan('\n  Execution History\n'));

        const table = new Table({
          head: ['Run', 'Task', 'Skills', 'Status', 'Duration'].map((h) => chalk.gray(h)),
          style: { head: [], 'padding-left': 2, 'padding-right': 2 },
        });

        for (const entry of entries) {
          const taskShort = entry.task.length > 30 ? entry.task.slice(0, 27) + '...' : entry.task;
          const skills = entry.skills.join(', ');
          const skillsShort = skills.length > 25 ? skills.slice(0, 22) + '...' : skills;
          const duration = `${(entry.totalDurationMs / 1000).toFixed(1)}s`;
          const statusColor =
            entry.status === 'completed'
              ? chalk.green
              : entry.status === 'partial'
                ? chalk.yellow
                : chalk.red;

          table.push([
            entry.runId.slice(0, 20),
            taskShort,
            skillsShort || '-',
            statusColor(entry.status),
            duration,
          ]);
        }

        console.log(table.toString());
        console.log('');
      } catch (error) {
        handleError(error);
      }
    });
}

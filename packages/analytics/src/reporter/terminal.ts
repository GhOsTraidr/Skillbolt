import chalk from 'chalk';
import Table from 'cli-table3';
import type { UsageReport, ChartConfig, ReportSummary } from '../types/index.js';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function renderBarChart(config: ChartConfig): string {
  const lines: string[] = [];
  const maxValue = Math.max(...config.data.map((d) => d.value), 1);
  const barWidth = config.maxWidth ?? 30;
  const barChar = config.barChar ?? '█';

  lines.push(chalk.bold(config.title));
  lines.push('');

  for (const point of config.data) {
    const barLength = Math.round((point.value / maxValue) * barWidth);
    const bar = chalk.cyan(barChar.repeat(barLength));
    const label = point.label.padEnd(20);
    const value = String(point.value).padStart(6);
    const pct =
      config.showPercentage && point.percentage !== undefined
        ? chalk.gray(` (${(point.percentage * 100).toFixed(1)}%)`)
        : '';

    lines.push(`  ${label} ${bar} ${value}${pct}`);
  }

  return lines.join('\n');
}

function createSummary(report: UsageReport): ReportSummary {
  const stats = report.statistics;
  const topSkill = report.topSkills[0];
  const leastUsedSkill = report.topSkills[report.topSkills.length - 1];

  const durations = stats.skillStats.filter((s) => s.avgDuration > 0).map((s) => s.avgDuration);
  const avgDuration =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return {
    totalTriggers: stats.totalEvents,
    uniqueSkills: stats.uniqueSkills,
    successRate: stats.overallSuccessRate,
    avgDuration,
    mostUsedSkill: topSkill?.skillName ?? 'N/A',
    leastUsedSkill: leastUsedSkill?.skillName ?? 'N/A',
    peakHour: `${stats.peakHour}:00`,
    peakDay: WEEKDAYS[stats.peakWeekday] ?? 'N/A',
  };
}

export function renderTerminalReport(report: UsageReport): string {
  const sections: string[] = [];

  sections.push('');
  sections.push(chalk.bold.blue('  Skill Usage Report'));
  sections.push(
    chalk.gray(
      `  Period: ${report.meta.startDate.split('T')[0]} ~ ${report.meta.endDate.split('T')[0]} (${report.meta.periodDays} days)`
    )
  );
  sections.push('');
  sections.push(chalk.gray('━'.repeat(60)));
  sections.push('');

  const summary = createSummary(report);
  const summaryTable = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    style: { 'padding-left': 2, 'padding-right': 2 },
  });

  summaryTable.push(
    [chalk.gray('Total Triggers'), chalk.bold(String(summary.totalTriggers))],
    [chalk.gray('Unique Skills'), chalk.bold(String(summary.uniqueSkills))],
    [chalk.gray('Success Rate'), chalk.bold(formatPercentage(summary.successRate))],
    [chalk.gray('Avg Duration'), chalk.bold(formatDuration(summary.avgDuration))],
    [chalk.gray('Most Used'), chalk.bold(summary.mostUsedSkill)],
    [chalk.gray('Peak Hour'), chalk.bold(summary.peakHour)],
    [chalk.gray('Peak Day'), chalk.bold(summary.peakDay)]
  );

  sections.push(summaryTable.toString());
  sections.push('');

  if (report.topSkills.length > 0) {
    sections.push(chalk.bold('  Top Skills'));
    sections.push('');

    const skillsTable = new Table({
      head: ['Rank', 'Skill', 'Triggers', 'Success', 'Avg Time'].map((h) => chalk.gray(h)),
      style: { head: [], 'padding-left': 2, 'padding-right': 2 },
    });

    report.topSkills.slice(0, 10).forEach((skill, index) => {
      const successColor =
        skill.successRate >= 0.9
          ? chalk.green
          : skill.successRate >= 0.7
            ? chalk.yellow
            : chalk.red;

      skillsTable.push([
        String(index + 1),
        skill.skillName.length > 25 ? skill.skillName.slice(0, 22) + '...' : skill.skillName,
        String(skill.triggers),
        successColor(formatPercentage(skill.successRate)),
        formatDuration(skill.avgDuration),
      ]);
    });

    sections.push(skillsTable.toString());
    sections.push('');
  }

  if (report.trends) {
    sections.push(chalk.bold('  Trends (vs Previous Period)'));
    sections.push('');

    const trendsTable = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: { 'padding-left': 2, 'padding-right': 2 },
    });

    const formatChange = (value: number, inverse = false): string => {
      const isPositive = inverse ? value <= 0 : value >= 0;
      const color = isPositive ? chalk.green : chalk.red;
      const sign = value >= 0 ? '+' : '';
      return color(`${sign}${value.toFixed(1)}%`);
    };

    trendsTable.push(
      [chalk.gray('Triggers Change'), formatChange(report.trends.changes.triggersChange)],
      [chalk.gray('Success Rate Change'), formatChange(report.trends.changes.successRateChange)],
      [chalk.gray('Duration Change'), formatChange(report.trends.changes.durationChange, true)]
    );

    sections.push(trendsTable.toString());
    sections.push('');
  }

  if (report.unusedSkills.length > 0) {
    sections.push(chalk.bold.yellow('  Unused Skills'));
    sections.push('');

    const unusedTable = new Table({
      head: ['Skill', 'Days Unused', 'Lifetime'].map((h) => chalk.gray(h)),
      style: { head: [], 'padding-left': 2, 'padding-right': 2 },
    });

    for (const skill of report.unusedSkills.slice(0, 5)) {
      unusedTable.push([
        skill.skillName,
        skill.daysSinceLastUse === Infinity ? 'Never used' : `${skill.daysSinceLastUse} days`,
        String(skill.lifetimeTriggers),
      ]);
    }

    sections.push(unusedTable.toString());
    sections.push('');
  }

  if (report.suggestions && report.suggestions.length > 0) {
    sections.push(chalk.bold('  Optimization Suggestions'));
    sections.push('');

    for (const suggestion of report.suggestions.slice(0, 5)) {
      const priorityColor =
        suggestion.priority === 'high'
          ? chalk.red
          : suggestion.priority === 'medium'
            ? chalk.yellow
            : chalk.gray;

      sections.push(
        `  ${priorityColor(`[${suggestion.priority.toUpperCase()}]`)} ${chalk.cyan(suggestion.skillName)}`
      );
      sections.push(`    ${suggestion.reason}`);
      sections.push(`    ${chalk.italic(suggestion.suggestion)}`);
      sections.push('');
    }
  }

  sections.push(chalk.gray('━'.repeat(60)));
  sections.push(chalk.gray(`  Generated by @skillbolt/analytics at ${report.meta.generatedAt}`));
  sections.push('');

  return sections.join('\n');
}

export { renderBarChart };

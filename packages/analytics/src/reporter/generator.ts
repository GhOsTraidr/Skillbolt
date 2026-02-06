import type { AnalyticsEvent, ReportOptions, ExportOptions, UsageReport } from '../types/index.js';
import { calculateAggregatedStats, calculateTrends } from '../analyzer/index.js';
import { findUnusedSkills } from '../analyzer/patterns.js';
import { generateSuggestions } from '../analyzer/suggestions.js';
import { exportToJSON } from './json.js';
import { exportToCSV } from './csv.js';
import { exportToHTML } from './html.js';
import { renderTerminalReport } from './terminal.js';

export function generateReport(events: AnalyticsEvent[], options: ReportOptions = {}): UsageReport {
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 30);

  const startDate = options.startDate
    ? typeof options.startDate === 'string'
      ? options.startDate
      : options.startDate.toISOString()
    : defaultStart.toISOString();

  const endDate = options.endDate
    ? typeof options.endDate === 'string'
      ? options.endDate
      : options.endDate.toISOString()
    : now.toISOString();

  let filteredEvents = events.filter((e) => {
    const ts = e.timestamp;
    return ts >= startDate && ts <= endDate;
  });

  if (options.skills && options.skills.length > 0) {
    const skillSet = new Set(options.skills);
    filteredEvents = filteredEvents.filter((e) => skillSet.has(e.skillName));
  }

  const stats = calculateAggregatedStats(filteredEvents);

  const periodStart = new Date(startDate);
  const periodEnd = new Date(endDate);
  const periodDays = Math.max(
    1,
    Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
  );

  const previousEnd = new Date(periodStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - periodDays);

  const previousEvents = events.filter((e) => {
    const ts = e.timestamp;
    return ts >= previousStart.toISOString() && ts <= previousEnd.toISOString();
  });

  const trends =
    previousEvents.length > 0 ? calculateTrends(filteredEvents, previousEvents) : undefined;

  const allSkillNames = [...new Set(events.map((e) => e.skillName))];
  const unusedSkills = findUnusedSkills(events, allSkillNames, 30);

  const suggestions =
    options.suggestions !== false ? generateSuggestions(events, allSkillNames, []) : undefined;

  return {
    meta: {
      generatedAt: now.toISOString(),
      startDate,
      endDate,
      periodDays,
      totalEvents: filteredEvents.length,
    },
    statistics: stats,
    topSkills: stats.skillStats.slice(0, 10).map((s) => ({
      skillName: s.skillName,
      triggers: s.totalTriggers,
      successRate: s.successRate,
      avgDuration: s.avgDuration,
    })),
    trends,
    unusedSkills,
    suggestions,
  };
}

export function exportReport(
  report: UsageReport,
  events: AnalyticsEvent[],
  options: ExportOptions
): string {
  switch (options.format) {
    case 'json':
      return exportToJSON(report, events, options);
    case 'csv':
      return exportToCSV(report, events, options);
    case 'html':
      return exportToHTML(report);
    case 'terminal':
      return renderTerminalReport(report);
    default:
      throw new Error(`Unknown export format: ${options.format as string}`);
  }
}

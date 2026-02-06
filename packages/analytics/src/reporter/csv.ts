import type { UsageReport, AnalyticsEvent, ExportOptions } from '../types/index.js';

function escapeCSVField(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function createCSVRow(fields: Array<string | number | boolean | undefined | null>): string {
  return fields.map(escapeCSVField).join(',');
}

export function exportToCSV(
  report: UsageReport,
  events: AnalyticsEvent[],
  options: ExportOptions
): string {
  const sections: string[] = [];

  sections.push('# Summary');
  sections.push(createCSVRow(['Metric', 'Value']));
  sections.push(createCSVRow(['Report Generated', report.meta.generatedAt]));
  sections.push(createCSVRow(['Period Start', report.meta.startDate]));
  sections.push(createCSVRow(['Period End', report.meta.endDate]));
  sections.push(createCSVRow(['Period Days', report.meta.periodDays]));
  sections.push(createCSVRow(['Total Events', report.meta.totalEvents]));
  sections.push(createCSVRow(['Unique Skills', report.statistics.uniqueSkills]));
  sections.push(
    createCSVRow([
      'Overall Success Rate',
      (report.statistics.overallSuccessRate * 100).toFixed(1) + '%',
    ])
  );
  sections.push(createCSVRow(['Average Per Day', report.statistics.avgPerDay.toFixed(2)]));
  sections.push('');

  sections.push('# Top Skills');
  sections.push(
    createCSVRow(['Rank', 'Skill Name', 'Triggers', 'Success Rate', 'Avg Duration (ms)'])
  );
  report.topSkills.forEach((skill, index) => {
    sections.push(
      createCSVRow([
        index + 1,
        skill.skillName,
        skill.triggers,
        (skill.successRate * 100).toFixed(1) + '%',
        skill.avgDuration.toFixed(0),
      ])
    );
  });
  sections.push('');

  if (report.unusedSkills.length > 0) {
    sections.push('# Unused Skills');
    sections.push(
      createCSVRow(['Skill Name', 'Days Since Last Use', 'Last Used', 'Lifetime Triggers'])
    );
    for (const skill of report.unusedSkills) {
      sections.push(
        createCSVRow([
          skill.skillName,
          skill.daysSinceLastUse === Infinity ? 'Never' : skill.daysSinceLastUse,
          skill.lastUsed || 'Never',
          skill.lifetimeTriggers,
        ])
      );
    }
    sections.push('');
  }

  if (report.suggestions && report.suggestions.length > 0) {
    sections.push('# Suggestions');
    sections.push(createCSVRow(['Priority', 'Type', 'Skill', 'Reason', 'Suggestion']));
    for (const suggestion of report.suggestions) {
      sections.push(
        createCSVRow([
          suggestion.priority,
          suggestion.type,
          suggestion.skillName,
          suggestion.reason,
          suggestion.suggestion,
        ])
      );
    }
    sections.push('');
  }

  if (options.includeRawEvents && events.length > 0) {
    sections.push('# Raw Events');
    sections.push(
      createCSVRow([
        'ID',
        'Timestamp',
        'Skill Name',
        'Event Type',
        'Trigger Phrase',
        'Duration (ms)',
        'Success',
        'Error Code',
      ])
    );
    for (const event of events) {
      sections.push(
        createCSVRow([
          event.id,
          event.timestamp,
          event.skillName,
          event.eventType,
          event.triggerPhrase,
          event.duration,
          event.success,
          event.errorCode,
        ])
      );
    }
  }

  return sections.join('\n');
}

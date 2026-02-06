import type { UsageReport, ExportOptions, AnalyticsEvent } from '../types/index.js';

export function exportToJSON(
  report: UsageReport,
  events: AnalyticsEvent[],
  options: ExportOptions
): string {
  const data = options.includeRawEvents ? { report, events } : { report };

  return JSON.stringify(data, null, 2);
}

export function parseJSONReport(json: string): UsageReport {
  const data = JSON.parse(json) as { report: UsageReport } | UsageReport;
  return 'report' in data ? data.report : data;
}

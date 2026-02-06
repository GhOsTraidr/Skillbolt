import type { PrivacyLevel } from './events.js';

/**
 * Analytics configuration options
 */
export interface AnalyticsOptions {
  /** Enable or disable analytics collection */
  enabled?: boolean;
  /** Privacy level for data collection */
  privacyLevel?: PrivacyLevel;
  /** Path to the SQLite database file */
  dbPath?: string;
  /** Data retention period in days (default: 90) */
  retentionDays?: number;
  /** Whether to automatically clean up old data */
  autoCleanup?: boolean;
}

/**
 * Resolved analytics configuration with all defaults applied
 */
export interface ResolvedAnalyticsConfig {
  enabled: boolean;
  privacyLevel: PrivacyLevel;
  dbPath: string;
  retentionDays: number;
  autoCleanup: boolean;
}

/**
 * Default analytics configuration values
 */
export const DEFAULT_ANALYTICS_CONFIG: ResolvedAnalyticsConfig = {
  enabled: true,
  privacyLevel: 'medium',
  dbPath: '~/.skill-kit/analytics.db',
  retentionDays: 90,
  autoCleanup: true,
};

/**
 * Options for report generation
 */
export interface ReportOptions {
  /** Start date for the report period */
  startDate?: string | Date;
  /** End date for the report period */
  endDate?: string | Date;
  /** Filter by specific skills */
  skills?: string[];
  /** Include detailed breakdown */
  detailed?: boolean;
  /** Include optimization suggestions */
  suggestions?: boolean;
}

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'csv' | 'html' | 'terminal';

/**
 * Options for exporting reports
 */
export interface ExportOptions extends ReportOptions {
  /** Export format */
  format: ExportFormat;
  /** Output file path (not needed for terminal) */
  outputPath?: string;
  /** Whether to include raw event data */
  includeRawEvents?: boolean;
}

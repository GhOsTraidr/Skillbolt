import type { AggregatedStats, TrendComparison, UnusedSkill } from './stats.js';
import type { Suggestion } from './suggestions.js';

/**
 * Complete usage report
 */
export interface UsageReport {
  /** Report metadata */
  meta: {
    /** When the report was generated */
    generatedAt: string;
    /** Start of the reporting period */
    startDate: string;
    /** End of the reporting period */
    endDate: string;
    /** Number of days in the period */
    periodDays: number;
    /** Total events in the period */
    totalEvents: number;
  };
  /** Aggregated statistics */
  statistics: AggregatedStats;
  /** Top skills by usage */
  topSkills: {
    skillName: string;
    triggers: number;
    successRate: number;
    avgDuration: number;
  }[];
  /** Trend comparison with previous period */
  trends?: TrendComparison;
  /** Unused skills that may need attention */
  unusedSkills: UnusedSkill[];
  /** Optimization suggestions */
  suggestions?: Suggestion[];
}

/**
 * Summary statistics for terminal display
 */
export interface ReportSummary {
  totalTriggers: number;
  uniqueSkills: number;
  successRate: number;
  avgDuration: number;
  mostUsedSkill: string;
  leastUsedSkill: string;
  peakHour: string;
  peakDay: string;
}

/**
 * Chart data point for visualization
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  percentage?: number;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  title: string;
  data: ChartDataPoint[];
  maxWidth?: number;
  showPercentage?: boolean;
  barChar?: string;
}

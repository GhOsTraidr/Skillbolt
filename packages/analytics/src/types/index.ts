// Event types
export type {
  PrivacyLevel,
  EventType,
  AnalyticsEvent,
  AnalyticsEventInput,
  EventQueryOptions,
  ClearOptions,
} from './events.js';

// Statistics types
export type {
  SkillStats,
  AggregatedStats,
  TrendComparison,
  TriggerPattern,
  PotentialTrigger,
  UnusedSkill,
} from './stats.js';

// Configuration types
export type {
  AnalyticsOptions,
  ResolvedAnalyticsConfig,
  ReportOptions,
  ExportFormat,
  ExportOptions,
} from './config.js';

export { DEFAULT_ANALYTICS_CONFIG } from './config.js';

// Suggestion types
export type {
  SuggestionType,
  SuggestionPriority,
  Suggestion,
  SuggestionOptions,
} from './suggestions.js';

export { DEFAULT_SUGGESTION_OPTIONS } from './suggestions.js';

// Report types
export type { UsageReport, ReportSummary, ChartDataPoint, ChartConfig } from './report.js';

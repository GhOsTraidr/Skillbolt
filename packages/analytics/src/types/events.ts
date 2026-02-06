/**
 * Privacy level for analytics data collection
 * - 'off': Disable data collection entirely
 * - 'low': Only collect skill name and timestamp
 * - 'medium': Collect trigger phrases and basic parameters (default)
 * - 'high': Collect full user input (optional)
 */
export type PrivacyLevel = 'off' | 'low' | 'medium' | 'high';

/**
 * Event type for analytics tracking
 */
export type EventType = 'trigger' | 'complete' | 'error';

/**
 * Analytics event record
 */
export interface AnalyticsEvent {
  /** Unique event identifier */
  id: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Name of the skill that was triggered */
  skillName: string;
  /** Type of event */
  eventType: EventType;
  /** The phrase that triggered the skill */
  triggerPhrase?: string;
  /** Parameters passed to the skill */
  parameters?: Record<string, unknown>;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Whether the execution was successful */
  success?: boolean;
  /** Error code if execution failed */
  errorCode?: string;
  /** Error message if execution failed */
  errorMessage?: string;
  /** Privacy level used when recording this event */
  privacyLevel: PrivacyLevel;
}

/**
 * Input for creating a new analytics event
 */
export interface AnalyticsEventInput {
  skillName: string;
  eventType: EventType;
  triggerPhrase?: string;
  parameters?: Record<string, unknown>;
  duration?: number;
  success?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Query options for retrieving events
 */
export interface EventQueryOptions {
  /** Filter by skill name */
  skillName?: string;
  /** Filter by event type */
  eventType?: EventType;
  /** Start date (inclusive) */
  startDate?: string | Date;
  /** End date (inclusive) */
  endDate?: string | Date;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort order */
  orderBy?: 'timestamp' | 'skillName';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

/**
 * Options for clearing events
 */
export interface ClearOptions {
  /** Clear events older than this date */
  olderThan?: string | Date;
  /** Clear events for specific skill */
  skillName?: string;
  /** Confirm deletion without prompting */
  confirm?: boolean;
}

/**
 * Statistics for a single skill
 */
export interface SkillStats {
  /** Name of the skill */
  skillName: string;
  /** Total number of triggers */
  totalTriggers: number;
  /** Number of successful executions */
  successCount: number;
  /** Number of failed executions */
  failureCount: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Average execution duration in milliseconds */
  avgDuration: number;
  /** Minimum execution duration in milliseconds */
  minDuration: number;
  /** Maximum execution duration in milliseconds */
  maxDuration: number;
  /** ISO 8601 timestamp of first use */
  firstUsed: string;
  /** ISO 8601 timestamp of last use */
  lastUsed: string;
  /** Distribution of trigger phrases (phrase -> count) */
  triggerDistribution: Record<string, number>;
  /** Distribution by hour of day (0-23 -> count) */
  hourlyDistribution: Record<string, number>;
  /** Distribution by day of week (0-6, 0=Sunday -> count) */
  weekdayDistribution: Record<string, number>;
}

/**
 * Aggregated statistics across all skills
 */
export interface AggregatedStats {
  /** Total number of events */
  totalEvents: number;
  /** Total number of unique skills used */
  uniqueSkills: number;
  /** Overall success rate */
  overallSuccessRate: number;
  /** Average executions per day */
  avgPerDay: number;
  /** Most active hour (0-23) */
  peakHour: number;
  /** Most active day of week (0-6) */
  peakWeekday: number;
  /** Date range start */
  startDate: string;
  /** Date range end */
  endDate: string;
  /** Per-skill statistics */
  skillStats: SkillStats[];
}

/**
 * Trend comparison between two periods
 */
export interface TrendComparison {
  /** Current period statistics */
  current: {
    startDate: string;
    endDate: string;
    totalTriggers: number;
    successRate: number;
    avgDuration: number;
  };
  /** Previous period statistics */
  previous: {
    startDate: string;
    endDate: string;
    totalTriggers: number;
    successRate: number;
    avgDuration: number;
  };
  /** Change percentages */
  changes: {
    triggersChange: number;
    successRateChange: number;
    durationChange: number;
  };
}

/**
 * Trigger pattern analysis result
 */
export interface TriggerPattern {
  /** The trigger phrase */
  phrase: string;
  /** Number of times this phrase was used */
  count: number;
  /** Which skill this phrase typically triggers */
  skillName: string;
  /** Success rate when using this phrase */
  successRate: number;
  /** Whether this is a registered trigger or ad-hoc */
  isRegistered: boolean;
}

/**
 * Unmatched input that could be a potential trigger
 */
export interface PotentialTrigger {
  /** The input phrase */
  phrase: string;
  /** Number of times this phrase was attempted */
  attempts: number;
  /** Most similar existing skill */
  similarTo?: string;
  /** Similarity score (0-1) */
  similarity?: number;
}

/**
 * Unused skill detection result
 */
export interface UnusedSkill {
  /** Name of the skill */
  skillName: string;
  /** Days since last use */
  daysSinceLastUse: number;
  /** ISO 8601 timestamp of last use */
  lastUsed: string;
  /** Total lifetime triggers */
  lifetimeTriggers: number;
}

/**
 * Type of optimization suggestion
 */
export type SuggestionType =
  | 'add_trigger'
  | 'remove_trigger'
  | 'remove_skill'
  | 'improve_description'
  | 'optimize_performance';

/**
 * Priority level for suggestions
 */
export type SuggestionPriority = 'high' | 'medium' | 'low';

/**
 * An optimization suggestion for a skill
 */
export interface Suggestion {
  /** Type of suggestion */
  type: SuggestionType;
  /** Priority of the suggestion */
  priority: SuggestionPriority;
  /** Name of the affected skill */
  skillName: string;
  /** Human-readable reason for the suggestion */
  reason: string;
  /** Specific actionable suggestion */
  suggestion: string;
  /** Evidence supporting this suggestion */
  evidence?: string[];
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Suggestion generation options
 */
export interface SuggestionOptions {
  /** Minimum days of no use to suggest removal */
  unusedThresholdDays?: number;
  /** Minimum confidence to include suggestion */
  minConfidence?: number;
  /** Maximum number of suggestions to generate */
  maxSuggestions?: number;
  /** Include low priority suggestions */
  includeLowPriority?: boolean;
}

/**
 * Default suggestion generation options
 */
export const DEFAULT_SUGGESTION_OPTIONS: Required<SuggestionOptions> = {
  unusedThresholdDays: 30,
  minConfidence: 0.5,
  maxSuggestions: 20,
  includeLowPriority: true,
};

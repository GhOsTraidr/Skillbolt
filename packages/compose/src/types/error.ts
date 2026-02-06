/**
 * Error handling types
 */

/**
 * Error handling action
 */
export type ErrorAction = 'fail' | 'continue' | 'retry';

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Delay multiplier for exponential backoff */
  multiplier?: number;
  /** Whether to use exponential backoff */
  exponential?: boolean;
}

/**
 * Error handling strategy
 */
export interface ErrorStrategy {
  /** Action to take on error */
  action: ErrorAction;
  /** Retry configuration (when action is 'retry') */
  retry?: RetryConfig;
  /** Fallback value on error (when action is 'continue') */
  fallback?: unknown;
  /** Steps to execute on error */
  onErrorSteps?: string[];
  /** Finally steps to always execute */
  finally?: string[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  multiplier: 2,
  exponential: true,
};

/**
 * Default error strategy
 */
export const DEFAULT_ERROR_STRATEGY: ErrorStrategy = {
  action: 'fail',
};

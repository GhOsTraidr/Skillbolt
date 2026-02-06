import type { SyncOperationType } from './sync.js';

/**
 * Queued sync operation
 */
export interface QueuedOperation {
  /** Unique operation ID */
  id: string;
  /** Operation type */
  type: SyncOperationType;
  /** Skill name */
  skillName: string;
  /** Relative path */
  relativePath: string;
  /** Content (for push operations) */
  content?: string;
  /** Content hash */
  hash?: string;
  /** Operation timestamp */
  createdAt: Date;
  /** Retry count */
  retryCount: number;
  /** Last error if any */
  lastError?: string;
}

/**
 * Queue status
 */
export interface QueueStatus {
  /** Number of pending operations */
  pending: number;
  /** Number of failed operations */
  failed: number;
  /** Whether queue is being processed */
  processing: boolean;
  /** Operations list */
  operations: QueuedOperation[];
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Retry delay in milliseconds (base for exponential backoff) */
  retryDelay: number;
  /** Queue persistence file path */
  persistPath: string;
  /** Auto-flush when online */
  autoFlush: boolean;
}

/**
 * Queue flush result
 */
export interface QueueFlushResult {
  /** Number of successful operations */
  success: number;
  /** Number of failed operations */
  failed: number;
  /** Number of remaining operations */
  remaining: number;
  /** Errors encountered */
  errors: Array<{ operationId: string; error: string }>;
}

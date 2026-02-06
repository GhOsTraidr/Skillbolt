import type { BackendType, ConflictStrategy } from './sync.js';

/**
 * Sync configuration
 */
export interface SyncConfiguration {
  /** Backend type */
  backend: BackendType;
  /** Skills directory (default: ~/.skill-kit/skills) */
  skillsDir: string;
  /** Default conflict resolution strategy */
  conflictStrategy: ConflictStrategy;
  /** Include patterns (glob) */
  include: string[];
  /** Exclude patterns (glob) */
  exclude: string[];
  /** Auto sync settings */
  autoSync: AutoSyncConfig;
  /** Offline queue settings */
  queue: QueueSettings;
  /** Backup settings */
  backup: BackupSettings;
}

/**
 * Auto sync configuration
 */
export interface AutoSyncConfig {
  /** Enable auto sync */
  enabled: boolean;
  /** Sync interval in milliseconds */
  interval: number;
  /** Watch for file changes */
  watchChanges: boolean;
  /** Debounce delay for file changes (ms) */
  debounceDelay: number;
}

/**
 * Queue settings
 */
export interface QueueSettings {
  /** Enable offline queue */
  enabled: boolean;
  /** Max retry attempts */
  maxRetries: number;
  /** Base retry delay (ms) */
  retryDelay: number;
}

/**
 * Backup settings
 */
export interface BackupSettings {
  /** Create backups on conflict */
  onConflict: boolean;
  /** Backup directory */
  directory: string;
  /** Max backup age in days */
  maxAge: number;
}

/**
 * Default sync configuration
 */
export const DEFAULT_SYNC_CONFIG: SyncConfiguration = {
  backend: 'supabase',
  skillsDir: '~/.skill-kit/skills',
  conflictStrategy: 'manual',
  include: ['**/*.md'],
  exclude: ['**/node_modules/**', '**/.git/**', '**/.*'],
  autoSync: {
    enabled: false,
    interval: 300000, // 5 minutes
    watchChanges: false,
    debounceDelay: 1000,
  },
  queue: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  backup: {
    onConflict: true,
    directory: '~/.skill-kit/backups',
    maxAge: 30,
  },
};

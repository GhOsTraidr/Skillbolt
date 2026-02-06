/**
 * Sync provider types
 */
export type BackendType = 'supabase' | 'github-gist';

/**
 * Conflict resolution strategy
 */
export type ConflictStrategy = 'local-wins' | 'remote-wins' | 'latest-wins' | 'manual';

/**
 * Sync operation type
 */
export type SyncOperationType = 'push' | 'pull' | 'delete-local' | 'delete-remote';

/**
 * Sync status for a skill
 */
export type SyncStatus =
  | 'synced'
  | 'modified-local'
  | 'modified-remote'
  | 'conflict'
  | 'new-local'
  | 'new-remote'
  | 'deleted-local'
  | 'deleted-remote';

/**
 * Local skill representation
 */
export interface LocalSkill {
  /** Skill name (unique identifier) */
  name: string;
  /** Relative path within skills directory */
  relativePath: string;
  /** Full file path */
  fullPath: string;
  /** File content */
  content: string;
  /** Content hash (SHA-256) */
  hash: string;
  /** Last modified timestamp */
  modifiedAt: Date;
  /** File size in bytes */
  size: number;
}

/**
 * Remote skill representation
 */
export interface RemoteSkill {
  /** Unique identifier in backend */
  id: string;
  /** Skill name */
  name: string;
  /** Relative path */
  relativePath: string;
  /** File content */
  content: string;
  /** Content hash */
  hash: string;
  /** Created timestamp */
  createdAt: Date;
  /** Updated timestamp */
  updatedAt: Date;
  /** Additional metadata */
  metadata: Record<string, unknown>;
}

/**
 * Sync metadata stored locally
 */
export interface SyncMetadata {
  /** Backend type */
  backend: BackendType;
  /** Last sync timestamp */
  lastSyncAt: Date | null;
  /** Hash of each synced skill at last sync */
  skillHashes: Record<string, string>;
  /** Skill timestamps at last sync */
  skillTimestamps: Record<string, string>;
}

/**
 * Conflict information
 */
export interface Conflict {
  /** Skill name */
  skillName: string;
  /** Relative path */
  relativePath: string;
  /** Local version */
  localVersion: LocalSkill;
  /** Remote version */
  remoteVersion: RemoteSkill;
  /** Local modification timestamp */
  localModifiedAt: Date;
  /** Remote modification timestamp */
  remoteModifiedAt: Date;
  /** Conflict type */
  type: 'content' | 'delete-modify' | 'modify-delete';
}

/**
 * Resolved conflict
 */
export interface ResolvedConflict {
  /** Original conflict */
  conflict: Conflict;
  /** Resolution choice */
  resolution: 'local' | 'remote';
  /** Backup path if created */
  backupPath?: string;
}

/**
 * Sync diff result
 */
export interface SyncDiff {
  /** Skills to upload (new or modified locally) */
  toUpload: LocalSkill[];
  /** Skills to download (new or modified remotely) */
  toDownload: RemoteSkill[];
  /** Skills to delete locally (deleted remotely) */
  toDeleteLocal: string[];
  /** Skills to delete remotely (deleted locally) */
  toDeleteRemote: string[];
  /** Conflicts requiring resolution */
  conflicts: Conflict[];
  /** Already synced (no changes) */
  synced: string[];
}

/**
 * Sync operation result
 */
export interface SyncResult {
  /** Whether sync succeeded */
  success: boolean;
  /** Number of skills uploaded */
  uploaded: number;
  /** Number of skills downloaded */
  downloaded: number;
  /** Number of skills deleted locally */
  deletedLocal: number;
  /** Number of skills deleted remotely */
  deletedRemote: number;
  /** Number of conflicts */
  conflicts: number;
  /** Number of skipped (unresolved conflicts) */
  skipped: number;
  /** Detailed messages */
  messages: string[];
  /** Errors if any */
  errors: Error[];
  /** Sync duration in milliseconds */
  duration: number;
}

/**
 * Push operation options
 */
export interface PushOptions {
  /** Skills directory path */
  skillsDir?: string;
  /** Force push (overwrite remote) */
  force?: boolean;
  /** Specific skills to push (glob patterns) */
  include?: string[];
  /** Skills to exclude (glob patterns) */
  exclude?: string[];
  /** Delete remote skills not present locally */
  deleteRemote?: boolean;
  /** Dry run (show what would happen) */
  dryRun?: boolean;
}

/**
 * Pull operation options
 */
export interface PullOptions {
  /** Skills directory path */
  skillsDir?: string;
  /** Force pull (overwrite local) */
  force?: boolean;
  /** Specific skills to pull (glob patterns) */
  include?: string[];
  /** Skills to exclude (glob patterns) */
  exclude?: string[];
  /** Delete local skills not present remotely */
  deleteLocal?: boolean;
  /** Dry run (show what would happen) */
  dryRun?: boolean;
}

/**
 * Status check options
 */
export interface StatusOptions {
  /** Skills directory path */
  skillsDir?: string;
  /** Include detailed diff */
  detailed?: boolean;
}

/**
 * Skill status information
 */
export interface SkillStatus {
  /** Skill name */
  name: string;
  /** Sync status */
  status: SyncStatus;
  /** Local hash (if exists) */
  localHash?: string;
  /** Remote hash (if exists) */
  remoteHash?: string;
  /** Last synced hash */
  lastSyncedHash?: string;
  /** Local modified time */
  localModifiedAt?: Date;
  /** Remote modified time */
  remoteModifiedAt?: Date;
}

/**
 * Overall sync status
 */
export interface OverallStatus {
  /** Backend type */
  backend: BackendType;
  /** Whether authenticated */
  authenticated: boolean;
  /** Last sync time */
  lastSyncAt: Date | null;
  /** Total local skills */
  totalLocal: number;
  /** Total remote skills */
  totalRemote: number;
  /** Skills in sync */
  synced: number;
  /** Modified locally */
  modifiedLocal: number;
  /** Modified remotely */
  modifiedRemote: number;
  /** New locally */
  newLocal: number;
  /** New remotely */
  newRemote: number;
  /** Conflicts */
  conflicts: number;
  /** Per-skill status */
  skills: SkillStatus[];
}

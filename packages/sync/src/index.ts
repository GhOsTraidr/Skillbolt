// Types
export type {
  BackendType,
  ConflictStrategy,
  SyncOperationType,
  SyncStatus,
  LocalSkill,
  RemoteSkill,
  SyncMetadata,
  Conflict,
  ResolvedConflict,
  SyncDiff,
  SyncResult,
  PushOptions,
  PullOptions,
  StatusOptions,
  SkillStatus,
  OverallStatus,
} from './types/index.js';

export type {
  Credentials,
  SupabaseCredentials,
  GitHubCredentials,
  BackendConfig,
  UploadResult,
  DeleteResult,
  Backend,
  BackendFactory,
} from './types/index.js';

export type { QueuedOperation, QueueStatus, QueueConfig, QueueFlushResult } from './types/index.js';

export type {
  SyncConfiguration,
  AutoSyncConfig,
  QueueSettings,
  BackupSettings,
} from './types/index.js';

export { DEFAULT_SYNC_CONFIG } from './types/index.js';

// Core
export { SyncEngine } from './core/index.js';
export { computeSyncDiff, getSyncSummary } from './core/index.js';
export {
  detectConflicts,
  resolveConflict,
  resolveConflictWithBackup,
  createConflictBackup,
} from './core/index.js';

// Backends
export {
  BaseBackend,
  SupabaseBackend,
  GitHubGistBackend,
  createBackend,
  getSupportedBackends,
} from './backends/index.js';

// Queue
export { OfflineQueue, QueueStorage } from './queue/index.js';

// Commands
export { push, pull, syncStatus, formatStatus } from './commands/index.js';
export type {
  PushCommandOptions,
  PullCommandOptions,
  StatusCommandOptions,
} from './commands/index.js';

// Utils
export {
  computeHashFromString,
  computeHashFromFile,
  hashesMatch,
  checkNetworkConnectivity,
  createNetworkMonitor,
  scanLocalSkills,
  filterSkills,
} from './utils/index.js';

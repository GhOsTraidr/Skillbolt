/**
 * Installation source types
 */
export type InstallSource =
  | { type: 'local'; path: string }
  | { type: 'github'; repo: string; ref?: string; subdirectory?: string }
  | { type: 'registry'; name: string };

/**
 * Installation mode
 */
export type InstallMode = 'copy' | 'link';

/**
 * Installed Skill metadata
 */
export interface InstalledSkill {
  /** Skill name */
  name: string;
  /** Installed version */
  version: string;
  /** Installation source */
  source: InstallSource;
  /** Local storage path */
  path: string;
  /** Installation timestamp (ISO 8601) */
  installedAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
  /** Installation mode (copy or link) */
  mode: InstallMode;
  /** Original skill manifest */
  manifest?: {
    description?: string;
    author?: string;
    tags?: string[];
    platform?: string[];
  };
}

/**
 * Installed registry file structure
 */
export interface InstalledRegistry {
  /** Registry format version */
  version: string;
  /** List of installed skills */
  skills: InstalledSkill[];
}

/**
 * Install options
 */
export interface InstallOptions {
  /** Installation target (path, URL, or package name) */
  target: string;
  /** Specific version to install */
  version?: string;
  /** Use symlink instead of copy */
  link?: boolean;
  /** Force overwrite existing installation */
  force?: boolean;
  /** Custom storage path */
  storagePath?: string;
}

/**
 * Install result
 */
export interface InstallResult {
  /** Whether installation succeeded */
  success: boolean;
  /** Installed skill metadata */
  skill?: InstalledSkill;
  /** Result message */
  message: string;
  /** Error if any */
  error?: Error;
}

/**
 * List options
 */
export interface ListOptions {
  /** Output format */
  format?: 'table' | 'json';
  /** Filter by name pattern */
  filter?: string;
  /** Custom storage path */
  storagePath?: string;
}

/**
 * Update options
 */
export interface UpdateOptions {
  /** Skill name to update (omit for all) */
  name?: string;
  /** Target version */
  version?: string;
  /** Force update even if up-to-date */
  force?: boolean;
  /** Custom storage path */
  storagePath?: string;
}

/**
 * Update result
 */
export interface UpdateResult {
  /** Whether update succeeded */
  success: boolean;
  /** Updated skill metadata */
  skill?: InstalledSkill;
  /** Previous version */
  previousVersion?: string;
  /** Result message */
  message: string;
  /** Error if any */
  error?: Error;
}

/**
 * Uninstall options
 */
export interface UninstallOptions {
  /** Skill name to uninstall */
  name: string;
  /** Skip confirmation prompt */
  force?: boolean;
  /** Custom storage path */
  storagePath?: string;
}

/**
 * Uninstall result
 */
export interface UninstallResult {
  /** Whether uninstall succeeded */
  success: boolean;
  /** Uninstalled skill name */
  name: string;
  /** Result message */
  message: string;
  /** Error if any */
  error?: Error;
}

/**
 * Outdated check result
 */
export interface OutdatedSkill {
  /** Skill name */
  name: string;
  /** Current installed version */
  currentVersion: string;
  /** Latest available version */
  latestVersion: string;
  /** Update type (major, minor, patch) */
  updateType: 'major' | 'minor' | 'patch';
}

/**
 * Registry configuration
 */
export interface RegistryOptions {
  /** Storage root path (default: ~/.skill-kit/skills) */
  storagePath?: string;
  /** Remote registry URL */
  remoteUrl?: string;
  /** Cache directory */
  cachePath?: string;
}

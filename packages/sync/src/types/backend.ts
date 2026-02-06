import type { LocalSkill, RemoteSkill, SyncMetadata } from './sync.js';

/**
 * Backend authentication credentials
 */
export type Credentials = SupabaseCredentials | GitHubCredentials;

/**
 * Supabase authentication credentials
 */
export interface SupabaseCredentials {
  type: 'supabase';
  /** Supabase project URL */
  url: string;
  /** Supabase anon key or service role key */
  key: string;
  /** Optional user authentication */
  user?: {
    email: string;
    password: string;
  };
}

/**
 * GitHub authentication credentials
 */
export interface GitHubCredentials {
  type: 'github';
  /** Personal access token */
  token: string;
  /** Gist ID for storage (optional, will create if not provided) */
  gistId?: string;
}

/**
 * Backend configuration
 */
export interface BackendConfig {
  /** Backend type identifier */
  type: string;
  /** Backend-specific configuration */
  [key: string]: unknown;
}

/**
 * Upload result
 */
export interface UploadResult {
  /** Whether upload succeeded */
  success: boolean;
  /** Remote skill after upload */
  skill?: RemoteSkill;
  /** Error message if failed */
  error?: string;
}

/**
 * Delete result
 */
export interface DeleteResult {
  /** Whether delete succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Backend interface for cloud storage
 */
export interface Backend {
  /** Backend name/type identifier */
  readonly name: string;

  /**
   * Authenticate with the backend
   */
  authenticate(credentials: Credentials): Promise<void>;

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean;

  /**
   * List all skills in the backend
   */
  list(): Promise<RemoteSkill[]>;

  /**
   * Get a specific skill by ID or name
   */
  get(idOrName: string): Promise<RemoteSkill | null>;

  /**
   * Upload/update a skill
   */
  put(skill: LocalSkill): Promise<UploadResult>;

  /**
   * Delete a skill
   */
  delete(idOrName: string): Promise<DeleteResult>;

  /**
   * Get sync metadata
   */
  getMetadata(): Promise<SyncMetadata | null>;

  /**
   * Update sync metadata
   */
  setMetadata(metadata: SyncMetadata): Promise<void>;

  /**
   * Disconnect/logout from the backend
   */
  disconnect(): Promise<void>;
}

/**
 * Backend factory function type
 */
export type BackendFactory = (config: BackendConfig) => Backend;

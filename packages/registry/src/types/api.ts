/**
 * Skill Hub API types
 */

/**
 * API authentication configuration
 */
export interface ApiAuthConfig {
  /** API token */
  token?: string;
  /** API key */
  apiKey?: string;
}

/**
 * Skill search request
 */
export interface SearchRequest {
  /** Search query */
  query: string;
  /** Maximum results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Filter by tags */
  tags?: string[];
  /** Filter by platform */
  platform?: string;
}

/**
 * Skill search result item
 */
export interface SearchResultItem {
  /** Skill name */
  name: string;
  /** Skill description */
  description: string;
  /** Author */
  author: string;
  /** Latest version */
  version: string;
  /** Download count */
  downloads: number;
  /** Tags */
  tags: string[];
  /** Supported platforms */
  platforms: string[];
  /** Last updated */
  updatedAt: string;
}

/**
 * Skill search response
 */
export interface SearchResponse {
  /** Search results */
  results: SearchResultItem[];
  /** Total count */
  total: number;
  /** Current page offset */
  offset: number;
  /** Results limit */
  limit: number;
}

/**
 * Skill version info
 */
export interface VersionInfo {
  /** Version number */
  version: string;
  /** Release notes */
  releaseNotes?: string;
  /** Published timestamp */
  publishedAt: string;
  /** Tarball download URL */
  tarballUrl: string;
  /** Tarball SHA256 hash */
  shasum: string;
  /** File size in bytes */
  size: number;
}

/**
 * Full skill details from registry
 */
export interface SkillDetails {
  /** Skill name */
  name: string;
  /** Description */
  description: string;
  /** Author */
  author: string;
  /** Repository URL */
  repository?: string;
  /** Homepage URL */
  homepage?: string;
  /** License */
  license?: string;
  /** Tags */
  tags: string[];
  /** Supported platforms */
  platforms: string[];
  /** All versions */
  versions: VersionInfo[];
  /** Latest version */
  latestVersion: string;
  /** Total downloads */
  totalDownloads: number;
  /** Created timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
  /** For Skillbolt API json format */
  skill: {
    id: string;
    name: string;
    slug: string;
    author: string;
    description: string;
    description_zh: string;
    category: string;
    tags: string[];
    skill_md_raw: string;
    skill_path: string;
    // 其他原有字段
  };
}

/**
 * API error response
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional details */
  details?: Record<string, unknown>;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL of the API */
  baseUrl: string;
  /** Authentication config */
  auth?: ApiAuthConfig;
  /** Request timeout in ms */
  timeout?: number;
  /** Retry count on failure */
  retries?: number;
}

import type { Backend, BackendConfig } from '../types/backend.js';
import type { BackendType } from '../types/sync.js';
import { SupabaseBackend } from './supabase.js';
import { GitHubGistBackend } from './github-gist.js';

export { BaseBackend } from './base.js';
export { SupabaseBackend } from './supabase.js';
export { GitHubGistBackend } from './github-gist.js';

export type { Backend } from '../types/backend.js';

export function createBackend(type: BackendType, _config?: BackendConfig): Backend {
  switch (type) {
    case 'supabase':
      return new SupabaseBackend();
    case 'github-gist':
      return new GitHubGistBackend();
    default:
      throw new Error(`Unknown backend type: ${type as string}`);
  }
}

export function getSupportedBackends(): BackendType[] {
  return ['supabase', 'github-gist'];
}

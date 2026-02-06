import type { Platform } from '../types/config.js';
import { SessionLoader, type SessionLoaderOptions } from './base.js';
import { ClaudeSessionLoader } from './claude.js';

export function createSessionLoader(
  platform: Platform,
  options?: SessionLoaderOptions
): SessionLoader {
  switch (platform) {
    case 'claude':
      return new ClaudeSessionLoader(options);
    case 'codex':
    case 'cursor':
      throw new Error(`Platform ${platform} is not yet supported`);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export { SessionLoader, type SessionLoaderOptions } from './base.js';
export type { SessionInfo } from '../types/session.js';
export { ClaudeSessionLoader } from './claude.js';

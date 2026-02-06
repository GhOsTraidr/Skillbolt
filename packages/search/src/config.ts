import type { SearchConfig } from './types.js';

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  maxParallel: 4,
  pruneEnabled: true,
  temperature: 0.3,
  timeout: 30,
  caching: true,
};

export function createSearchConfig(overrides: Partial<SearchConfig> = {}): SearchConfig {
  return {
    ...DEFAULT_SEARCH_CONFIG,
    ...overrides,
  };
}

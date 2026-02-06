import { describe, it, expect } from 'vitest';
import { createSearchConfig, DEFAULT_SEARCH_CONFIG } from '../src/config.js';

describe('createSearchConfig', () => {
  it('returns default values when no overrides provided', () => {
    const config = createSearchConfig();
    expect(config).toEqual(DEFAULT_SEARCH_CONFIG);
  });

  it('applies partial overrides while keeping defaults', () => {
    const config = createSearchConfig({ maxParallel: 8, pruneEnabled: false, model: 'test-model' });

    expect(config).toEqual({
      ...DEFAULT_SEARCH_CONFIG,
      maxParallel: 8,
      pruneEnabled: false,
      model: 'test-model',
    });
  });

  it('applies complete overrides', () => {
    const overrides = {
      model: 'full-model',
      maxParallel: 2,
      pruneEnabled: false,
      temperature: 0.9,
      timeout: 120,
      caching: false,
    };

    const config = createSearchConfig(overrides);
    expect(config).toEqual(overrides);
  });
});

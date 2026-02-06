import { describe, it, expect } from 'vitest';
import { OpenAIEmbeddingAdapter } from '../../src/embedding/index.js';
import type { EmbeddingAdapter } from '../../src/embedding/index.js';

describe('OpenAIEmbeddingAdapter', () => {
  it('implements EmbeddingAdapter interface', () => {
    const adapter = new OpenAIEmbeddingAdapter();
    const embeddingAdapter: EmbeddingAdapter = adapter;

    expect(typeof embeddingAdapter.embed).toBe('function');
    expect(typeof embeddingAdapter.embedSingle).toBe('function');
  });

  it('constructor accepts options', () => {
    const adapter = new OpenAIEmbeddingAdapter({
      apiKey: 'test-key',
      baseUrl: 'https://api.example.com',
      model: 'text-embedding-3-large',
    });

    expect(adapter).toBeDefined();
  });

  it('constructor works with no options', () => {
    const adapter = new OpenAIEmbeddingAdapter();
    expect(adapter).toBeDefined();
  });

  it('embed method exists and is callable', () => {
    const adapter = new OpenAIEmbeddingAdapter();
    expect(typeof adapter.embed).toBe('function');
  });
});

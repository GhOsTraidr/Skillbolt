/**
 * Factory function to create an LLM adapter from configuration or environment.
 */

import type { LLMAdapter, LLMAdapterConfig } from './types.js';
import { OpenAIAdapter } from './openai.js';
import { AnthropicAdapter } from './anthropic.js';
import { ConfigError } from '../errors/index.js';

/**
 * Create an LLM adapter based on provider configuration.
 *
 * Provider is resolved from:
 * 1. config.provider parameter
 * 2. LLM_PROVIDER environment variable
 * 3. Defaults to "openai"
 *
 * Usage:
 * ```ts
 * const adapter = createLLMAdapter(); // uses env vars
 * const adapter = createLLMAdapter({ provider: 'anthropic', apiKey: '...' });
 * ```
 */
export function createLLMAdapter(config?: LLMAdapterConfig): LLMAdapter {
  const provider = config?.provider ?? process.env.LLM_PROVIDER ?? 'openai';

  switch (provider) {
    case 'openai':
      return new OpenAIAdapter(config);
    case 'anthropic':
      return new AnthropicAdapter(config);
    default:
      throw new ConfigError(`Unknown LLM provider: ${provider}. Supported: openai, anthropic`, {
        key: 'provider',
        value: provider,
      });
  }
}

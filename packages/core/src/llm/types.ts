/**
 * LLM and Embedding adapter interfaces.
 *
 * Provides a provider-agnostic abstraction over LLM APIs.
 * Implementations: OpenAIAdapter (covers OpenAI/Azure/OpenRouter), AnthropicAdapter.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  /** Model identifier (e.g., "gpt-4o-mini", "claude-3-haiku-20240307") */
  model?: string;
  /** Sampling temperature. Default: 0.3 */
  temperature?: number;
  /** Maximum response tokens */
  maxTokens?: number;
  /** Request timeout in milliseconds. Default: 30000 */
  timeout?: number;
  /** Enable response caching. Default: false */
  caching?: boolean;
  /** Number of retries on transient failure. Default: 3 */
  retries?: number;
}

/**
 * Adapter for LLM text/JSON completions.
 * All tree, search, compose, and execute packages consume this interface.
 */
export interface LLMAdapter {
  /** Get a text completion */
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;

  /**
   * Get a JSON-parsed completion.
   * Handles markdown fences, bare JSON, and JSON embedded in prose.
   * Throws LLMError on parse failure after retries.
   */
  completeJSON<T>(messages: LLMMessage[], options?: LLMOptions): Promise<T>;
}

export interface EmbeddingOptions {
  /** Embedding model. Default: "text-embedding-3-small" */
  model?: string;
  /** Batch size for multiple texts. Default: 100 */
  batchSize?: number;
}

/**
 * Adapter for text embeddings.
 * Used by optional hybrid search (embedding + tree traversal).
 */
export interface EmbeddingAdapter {
  /** Embed multiple texts in a single batch */
  embed(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;

  /** Embed a single text */
  embedSingle(text: string, options?: EmbeddingOptions): Promise<number[]>;
}

/**
 * Configuration for creating an LLM adapter from environment/config.
 */
export interface LLMAdapterConfig {
  /** Provider: "openai" | "anthropic" */
  provider?: string;
  /** API key */
  apiKey?: string;
  /** Base URL override (for Azure, OpenRouter, etc.) */
  baseUrl?: string;
  /** Default model */
  model?: string;
  /** Default temperature */
  temperature?: number;
  /** Default timeout in ms */
  timeout?: number;
  /** Default retry count */
  retries?: number;
}

export interface EmbeddingAdapterConfig {
  /** Embedding model */
  model?: string;
  /** API key (defaults to LLM API key) */
  apiKey?: string;
  /** Base URL override */
  baseUrl?: string;
  /** Default batch size */
  batchSize?: number;
}

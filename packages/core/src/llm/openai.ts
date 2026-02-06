/**
 * OpenAI-compatible LLM adapter.
 *
 * Covers: OpenAI, Azure OpenAI, OpenRouter, and any OpenAI-compatible API.
 * Uses the `openai` npm package.
 */

import { LLMError, TimeoutError } from '../errors/index.js';
import { extractJSON } from '../utils/json.js';

import type {
  LLMAdapter,
  LLMMessage,
  LLMOptions,
  EmbeddingAdapter,
  EmbeddingOptions,
  LLMAdapterConfig,
  EmbeddingAdapterConfig,
} from './types.js';

/**
 * OpenAI-compatible adapter implementing both LLM and Embedding interfaces.
 *
 * Usage:
 * ```ts
 * const adapter = new OpenAIAdapter({ apiKey: 'sk-...', model: 'gpt-4o-mini' });
 * const text = await adapter.complete([{ role: 'user', content: 'Hello' }]);
 * const data = await adapter.completeJSON<{ name: string }>([...]);
 * ```
 */
export class OpenAIAdapter implements LLMAdapter, EmbeddingAdapter {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultTemperature: number;
  private readonly defaultTimeout: number;
  private readonly defaultRetries: number;
  private readonly embeddingModel: string;
  private readonly embeddingBatchSize: number;

  constructor(llmConfig?: LLMAdapterConfig, embeddingConfig?: EmbeddingAdapterConfig) {
    this.apiKey = llmConfig?.apiKey ?? process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? '';
    this.baseUrl =
      llmConfig?.baseUrl ??
      process.env.LLM_BASE_URL ??
      process.env.OPENAI_BASE_URL ??
      'https://api.openai.com/v1';
    this.defaultModel = llmConfig?.model ?? process.env.LLM_MODEL ?? 'gpt-4o-mini';
    this.defaultTemperature = llmConfig?.temperature ?? 0.3;
    this.defaultTimeout = llmConfig?.timeout ?? 30_000;
    this.defaultRetries = llmConfig?.retries ?? 3;

    this.embeddingModel =
      embeddingConfig?.model ?? process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
    this.embeddingBatchSize = embeddingConfig?.batchSize ?? 100;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const model = options?.model ?? this.defaultModel;
    const temperature = options?.temperature ?? this.defaultTemperature;
    const maxRetries = options?.retries ?? this.defaultRetries;
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxTokens = options?.maxTokens;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              ...(maxTokens ? { max_tokens: maxTokens } : {}),
            }),
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (!response.ok) {
            const body = await response.text().catch(() => '');
            throw new LLMError(
              `OpenAI API error ${response.status}: ${body}`,
              'openai',
              response.status
            );
          }

          const data = (await response.json()) as {
            choices: Array<{ message: { content: string } }>;
          };

          const content = data.choices?.[0]?.message?.content;
          if (content == null) {
            throw new LLMError('No content in OpenAI response', 'openai');
          }

          return content;
        } finally {
          clearTimeout(timer);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = new TimeoutError(`OpenAI request timed out after ${timeout}ms`, timeout);
        } else if (error instanceof LLMError) {
          // Don't retry on 4xx client errors (except 429 rate limit)
          if (
            error.statusCode &&
            error.statusCode >= 400 &&
            error.statusCode < 500 &&
            error.statusCode !== 429
          ) {
            throw error;
          }
          lastError = error;
        } else {
          lastError = error instanceof Error ? error : new Error(String(error));
        }

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10_000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new LLMError('OpenAI request failed', 'openai');
  }

  async completeJSON<T>(messages: LLMMessage[], options?: LLMOptions): Promise<T> {
    const text = await this.complete(messages, options);
    const parsed = extractJSON<T>(text);
    if (parsed === null) {
      throw new LLMError(
        `Failed to parse JSON from OpenAI response: ${text.slice(0, 200)}`,
        'openai'
      );
    }
    return parsed;
  }

  async embed(texts: string[], options?: EmbeddingOptions): Promise<number[][]> {
    const model = options?.model ?? this.embeddingModel;
    const batchSize = options?.batchSize ?? this.embeddingBatchSize;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ model, input: batch }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new LLMError(
          `OpenAI Embedding API error ${response.status}: ${body}`,
          'openai',
          response.status
        );
      }

      const data = (await response.json()) as {
        data: Array<{ embedding: number[] }>;
      };

      for (const item of data.data) {
        results.push(item.embedding);
      }
    }

    return results;
  }

  async embedSingle(text: string, options?: EmbeddingOptions): Promise<number[]> {
    const results = await this.embed([text], options);
    return results[0] ?? [];
  }
}

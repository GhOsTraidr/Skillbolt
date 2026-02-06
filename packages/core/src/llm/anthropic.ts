/**
 * Anthropic LLM adapter.
 *
 * Uses the Anthropic Messages API via fetch (no SDK dependency).
 */

import { LLMError, TimeoutError } from '../errors/index.js';
import { extractJSON } from '../utils/json.js';

import type { LLMAdapter, LLMMessage, LLMOptions, LLMAdapterConfig } from './types.js';

/**
 * Anthropic adapter implementing the LLM interface.
 *
 * Usage:
 * ```ts
 * const adapter = new AnthropicAdapter({ apiKey: 'sk-ant-...', model: 'claude-3-haiku-20240307' });
 * const text = await adapter.complete([{ role: 'user', content: 'Hello' }]);
 * ```
 */
export class AnthropicAdapter implements LLMAdapter {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultTemperature: number;
  private readonly defaultTimeout: number;
  private readonly defaultRetries: number;

  constructor(config?: LLMAdapterConfig) {
    this.apiKey = config?.apiKey ?? process.env.LLM_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? '';
    this.baseUrl = config?.baseUrl ?? process.env.LLM_BASE_URL ?? 'https://api.anthropic.com';
    this.defaultModel = config?.model ?? process.env.LLM_MODEL ?? 'claude-3-haiku-20240307';
    this.defaultTemperature = config?.temperature ?? 0.3;
    this.defaultTimeout = config?.timeout ?? 30_000;
    this.defaultRetries = config?.retries ?? 3;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const model = options?.model ?? this.defaultModel;
    const temperature = options?.temperature ?? this.defaultTemperature;
    const maxRetries = options?.retries ?? this.defaultRetries;
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxTokens = options?.maxTokens ?? 4096;

    // Separate system message from conversation messages
    let system: string | undefined;
    const conversationMessages: Array<{ role: string; content: string }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        system = msg.content;
      } else {
        conversationMessages.push({ role: msg.role, content: msg.content });
      }
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
          const body: Record<string, unknown> = {
            model,
            messages: conversationMessages,
            max_tokens: maxTokens,
            temperature,
          };
          if (system) {
            body.system = system;
          }

          const response = await fetch(`${this.baseUrl}/v1/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (!response.ok) {
            const respBody = await response.text().catch(() => '');
            throw new LLMError(
              `Anthropic API error ${response.status}: ${respBody}`,
              'anthropic',
              response.status
            );
          }

          const data = (await response.json()) as {
            content: Array<{ type: string; text: string }>;
          };

          const textBlock = data.content?.find((b) => b.type === 'text');
          if (!textBlock) {
            throw new LLMError('No text content in Anthropic response', 'anthropic');
          }

          return textBlock.text;
        } finally {
          clearTimeout(timer);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = new TimeoutError(`Anthropic request timed out after ${timeout}ms`, timeout);
        } else if (error instanceof LLMError) {
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

    throw lastError ?? new LLMError('Anthropic request failed', 'anthropic');
  }

  async completeJSON<T>(messages: LLMMessage[], options?: LLMOptions): Promise<T> {
    const text = await this.complete(messages, options);
    const parsed = extractJSON<T>(text);
    if (parsed === null) {
      throw new LLMError(
        `Failed to parse JSON from Anthropic response: ${text.slice(0, 200)}`,
        'anthropic'
      );
    }
    return parsed;
  }
}

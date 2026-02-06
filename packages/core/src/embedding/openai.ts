import type { EmbeddingAdapter, EmbeddingOptions } from './types.js';

const DEFAULT_MODEL = 'text-embedding-3-small';
const DEFAULT_BATCH_SIZE = 100;

interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>;
}

export class OpenAIEmbeddingAdapter implements EmbeddingAdapter {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(options?: { apiKey?: string; baseUrl?: string; model?: string }) {
    this.apiKey = options?.apiKey || process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY || '';
    this.baseUrl =
      options?.baseUrl ||
      process.env.EMBEDDING_BASE_URL ||
      process.env.LLM_BASE_URL ||
      'https://api.openai.com/v1';
    this.model = options?.model || process.env.EMBEDDING_MODEL || DEFAULT_MODEL;
  }

  async embed(texts: string[], options?: EmbeddingOptions): Promise<number[][]> {
    const model = options?.model || this.model;
    const batchSize = options?.batchSize || DEFAULT_BATCH_SIZE;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await this.callAPI(batch, model);
      const sorted = response.data.sort((a, b) => a.index - b.index);
      results.push(...sorted.map((item) => item.embedding));
    }

    return results;
  }

  async embedSingle(text: string, options?: EmbeddingOptions): Promise<number[]> {
    const results = await this.embed([text], options);
    const first = results[0];
    if (!first) throw new Error('No embedding returned');
    return first;
  }

  private async callAPI(input: string[], model: string): Promise<OpenAIEmbeddingResponse> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/embeddings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ input, model }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Embedding API error (${response.status}): ${text}`);
    }

    return response.json() as Promise<OpenAIEmbeddingResponse>;
  }
}

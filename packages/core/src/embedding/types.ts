export interface EmbeddingOptions {
  model?: string;
  batchSize?: number;
}

export interface EmbeddingAdapter {
  embed(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;
  embedSingle(text: string, options?: EmbeddingOptions): Promise<number[]>;
}

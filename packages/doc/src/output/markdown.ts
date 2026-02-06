import type { MarkdownOutputOptions } from '../types/index.js';

export function toMarkdown(content: string, options: Partial<MarkdownOutputOptions> = {}): string {
  const { trailingNewline = true } = options;

  let result = content;

  if (trailingNewline && !result.endsWith('\n')) {
    result += '\n';
  }

  return result;
}

export function normalizeMarkdown(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

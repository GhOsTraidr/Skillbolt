export type OutputFormat = 'markdown' | 'html' | 'json';

export interface OutputOptions {
  format: OutputFormat;
  prettyPrint?: boolean;
  indentSize?: number;
  includeCss?: boolean;
  cssPath?: string;
  fullDocument?: boolean;
}

export interface HtmlOutputOptions extends OutputOptions {
  format: 'html';
  title?: string;
  includeSyntaxHighlight?: boolean;
  darkTheme?: boolean;
}

export interface JsonOutputOptions extends OutputOptions {
  format: 'json';
  includeRaw?: boolean;
  includeMetadata?: boolean;
}

export interface MarkdownOutputOptions extends OutputOptions {
  format: 'markdown';
  gfm?: boolean;
  trailingNewline?: boolean;
}

export interface WriteOutputOptions {
  outputPath: string;
  content: string;
  createDirs?: boolean;
  overwrite?: boolean;
}

export interface OutputResult {
  success: boolean;
  path: string;
  size: number;
  error?: Error;
}

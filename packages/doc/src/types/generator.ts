import type { SkillFile } from '@skillbolt/core';
import type { OutputFormat } from './output.js';

export interface GeneratorOptions {
  skill: SkillFile;
  format?: OutputFormat;
  templatePath?: string;
  variables?: Record<string, unknown>;
  includeToc?: boolean;
  includeTimestamp?: boolean;
}

export interface GeneratorResult {
  content: string;
  format: OutputFormat;
  metadata: GeneratorMetadata;
}

export interface GeneratorMetadata {
  generatedAt: Date;
  sourceFile: string;
  templateUsed: string;
  generatorVersion: string;
}

export type DocType = 'readme' | 'api' | 'examples' | 'toc' | 'index';

export type GeneratorFunction = (options: GeneratorOptions) => Promise<GeneratorResult>;

export interface TocItem {
  title: string;
  anchor: string;
  level: number;
  children?: TocItem[];
}

export interface ReadmeOptions extends GeneratorOptions {
  includeInstallation?: boolean;
  includeQuickStart?: boolean;
  includeParameters?: boolean;
  includeLicense?: boolean;
  licenseType?: string;
}

export interface ApiDocOptions extends GeneratorOptions {
  includeTypes?: boolean;
  includeJsDoc?: boolean;
  groupByCategory?: boolean;
}

export interface ExamplesOptions extends GeneratorOptions {
  codeLanguage?: string;
  includeComments?: boolean;
}

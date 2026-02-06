import type { OutputFormat } from './output.js';
import type { DocType } from './generator.js';

export interface BatchOptions {
  inputDir: string;
  outputDir: string;
  format?: OutputFormat;
  docType?: DocType;
  concurrency?: number;
  generateIndex?: boolean;
  templatePath?: string;
  pattern?: string;
  verbose?: boolean;
}

export interface BatchResult {
  success: BatchSuccessItem[];
  failed: BatchFailedItem[];
  indexPath?: string;
  duration: number;
  stats: BatchStats;
}

export interface BatchSuccessItem {
  inputPath: string;
  outputPath: string;
  duration: number;
}

export interface BatchFailedItem {
  inputPath: string;
  error: Error;
}

export interface BatchStats {
  totalFiles: number;
  successCount: number;
  failedCount: number;
  avgDuration: number;
}

export interface ScanResult {
  files: string[];
  baseDir: string;
  pattern: string;
}

export interface IndexItem {
  name: string;
  description: string;
  version?: string;
  docPath: string;
  sourcePath: string;
  tags: string[];
}

export interface IndexOptions {
  items: IndexItem[];
  title?: string;
  format?: OutputFormat;
  templatePath?: string;
  sortBy?: 'name' | 'date' | 'version';
  groupByTags?: boolean;
}

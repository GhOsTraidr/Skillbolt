import { Command } from 'commander';
import { logger } from '@skillbolt/core';
import { resolve } from 'node:path';

import type { OutputFormat, DocType } from '../../types/index.js';
import { batchGenerate } from '../../batch/processor.js';

interface BatchOptions {
  output: string;
  format?: OutputFormat;
  type?: DocType;
  pattern?: string;
  concurrency?: string;
  index?: boolean;
  verbose?: boolean;
}

export function createBatchCommand(): Command {
  const cmd = new Command('batch')
    .description('Generate documentation for multiple SKILL.md files')
    .argument('<input>', 'Input directory to scan')
    .requiredOption('-o, --output <path>', 'Output directory')
    .option('-f, --format <format>', 'Output format (markdown|html|json)', 'markdown')
    .option('-t, --type <type>', 'Document type (readme|api|examples)', 'readme')
    .option('-p, --pattern <glob>', 'File pattern to match', '**/SKILL.md')
    .option('-c, --concurrency <number>', 'Number of concurrent operations', '5')
    .option('--index', 'Generate index page', false)
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (input: string, options: BatchOptions) => {
      try {
        const inputDir = resolve(input);
        const outputDir = resolve(options.output);

        logger.info(`Scanning ${inputDir} for SKILL.md files...`);

        const result = await batchGenerate({
          inputDir,
          outputDir,
          format: (options.format ?? 'markdown') as OutputFormat,
          docType: (options.type ?? 'readme') as DocType,
          pattern: options.pattern,
          concurrency: parseInt(options.concurrency ?? '5', 10),
          generateIndex: options.index,
          verbose: options.verbose,
        });

        if (options.verbose) {
          for (const item of result.success) {
            logger.info(`Generated: ${item.outputPath}`);
          }
          for (const item of result.failed) {
            logger.warn(`Failed: ${item.inputPath} - ${item.error.message}`);
          }
        }

        logger.info('');
        logger.info('Batch Generation Summary:');
        logger.info(`  Total files: ${result.stats.totalFiles}`);
        logger.success(`  Success: ${result.stats.successCount}`);
        if (result.stats.failedCount > 0) {
          logger.error(`  Failed: ${result.stats.failedCount}`);
        }
        logger.info(`  Duration: ${result.duration}ms`);
        logger.info(`  Avg per file: ${result.stats.avgDuration.toFixed(0)}ms`);

        if (result.indexPath) {
          logger.success(`  Index: ${result.indexPath}`);
        }

        if (result.stats.failedCount > 0) {
          process.exit(1);
        }
      } catch (error) {
        logger.error(`Batch generation failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  return cmd;
}

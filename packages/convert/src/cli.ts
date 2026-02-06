#!/usr/bin/env node

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, basename, join } from 'node:path';
import { Command } from 'commander';
import { logger } from '@skillbolt/core';

import type { Format, ConvertResult, BatchConvertSummary } from './types.js';
import { ALL_FORMATS } from './types.js';
import { detectFormat, detectFormatFromPath } from './detector/index.js';
import { parseSkill } from './parsers/index.js';
import { convertWithWarnings, convertToAll } from './converters/index.js';

const FORMAT_EXTENSIONS: Record<Format, string> = {
  claude: '.skill.md',
  codex: '.agent.md',
  cursor: '.cursorrules',
  continue: '.config.json',
  openclaw: '.openclaw.md',
};

async function ensureDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
  } catch {}
}

async function convertFile(
  inputPath: string,
  targetFormat: Format,
  options: { output?: string; overwrite?: boolean }
): Promise<ConvertResult> {
  const absolutePath = resolve(inputPath);
  const content = await readFile(absolutePath, 'utf-8');

  const pathFormat = detectFormatFromPath(absolutePath);
  const detectedFormat = pathFormat ?? detectFormat(content).format;

  const skill = parseSkill(content, detectedFormat);
  const { content: converted, warnings } = convertWithWarnings(skill, detectedFormat, targetFormat);

  const outputDir = options.output ? resolve(options.output) : dirname(absolutePath);
  await ensureDir(outputDir);

  const baseName = basename(absolutePath).replace(
    /\.(skill\.md|agent\.md|cursorrules|config\.json|md)$/i,
    ''
  );
  const outputPath = join(outputDir, baseName + FORMAT_EXTENSIONS[targetFormat]);

  if (!options.overwrite) {
    try {
      await stat(outputPath);
      return {
        source: detectedFormat,
        target: targetFormat,
        inputPath: absolutePath,
        outputPath,
        success: false,
        error: `Output file already exists: ${outputPath}`,
      };
    } catch {}
  }

  await writeFile(outputPath, converted, 'utf-8');

  return {
    source: detectedFormat,
    target: targetFormat,
    inputPath: absolutePath,
    outputPath,
    success: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

async function convertFileToAll(
  inputPath: string,
  options: { output?: string; overwrite?: boolean }
): Promise<ConvertResult[]> {
  const absolutePath = resolve(inputPath);
  const content = await readFile(absolutePath, 'utf-8');

  const pathFormat = detectFormatFromPath(absolutePath);
  const sourceFormat = pathFormat ?? detectFormat(content).format;

  const skill = parseSkill(content, sourceFormat);
  const results = convertToAll(skill, sourceFormat);

  const outputDir = options.output ? resolve(options.output) : dirname(absolutePath);
  await ensureDir(outputDir);

  const baseName = basename(absolutePath).replace(
    /\.(skill\.md|agent\.md|cursorrules|config\.json|md)$/i,
    ''
  );

  const convertResults: ConvertResult[] = [];

  for (const [format, { content: converted, warnings }] of Object.entries(results) as [
    Format,
    { content: string; warnings: string[] },
  ][]) {
    const outputPath = join(outputDir, baseName + FORMAT_EXTENSIONS[format]);

    if (!options.overwrite) {
      try {
        await stat(outputPath);
        convertResults.push({
          source: sourceFormat,
          target: format,
          inputPath: absolutePath,
          outputPath,
          success: false,
          error: `Output file already exists: ${outputPath}`,
        });
        continue;
      } catch {}
    }

    await writeFile(outputPath, converted, 'utf-8');
    convertResults.push({
      source: sourceFormat,
      target: format,
      inputPath: absolutePath,
      outputPath,
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  }

  return convertResults;
}

async function batchConvert(
  dirPath: string,
  targetFormat: Format | 'all',
  options: { output?: string; overwrite?: boolean; recursive?: boolean }
): Promise<BatchConvertSummary> {
  const results: ConvertResult[] = [];
  const absoluteDir = resolve(dirPath);

  async function processDir(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory() && options.recursive) {
        await processDir(fullPath);
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase();
        if (ext.endsWith('.md') || ext.endsWith('.cursorrules') || ext.endsWith('.json')) {
          try {
            if (targetFormat === 'all') {
              const fileResults = await convertFileToAll(fullPath, options);
              results.push(...fileResults);
            } else {
              const result = await convertFile(fullPath, targetFormat, options);
              results.push(result);
            }
          } catch (err) {
            results.push({
              source: 'claude',
              target: targetFormat === 'all' ? 'claude' : targetFormat,
              inputPath: fullPath,
              outputPath: '',
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }
      }
    }
  }

  await processDir(absoluteDir);

  return {
    total: results.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

const program = new Command();

program
  .name('skill-convert')
  .description('Convert skill files between different AI agent platform formats')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert a skill file to a different format')
  .argument('<path>', 'Path to skill file or directory')
  .requiredOption('--to <format>', `Target format: ${ALL_FORMATS.join(', ')}, or "all"`)
  .option('-o, --output <dir>', 'Output directory')
  .option('--overwrite', 'Overwrite existing files', false)
  .option('-r, --recursive', 'Process directories recursively', false)
  .action(
    async (
      inputPath: string,
      opts: { to: string; output?: string; overwrite: boolean; recursive: boolean }
    ) => {
      const targetFormat = opts.to.toLowerCase();
      if (targetFormat !== 'all' && !ALL_FORMATS.includes(targetFormat as Format)) {
        logger.error(`Invalid format: ${opts.to}. Must be one of: ${ALL_FORMATS.join(', ')}, all`);
        process.exit(1);
      }

      try {
        const inputStat = await stat(resolve(inputPath));

        if (inputStat.isDirectory()) {
          const summary = await batchConvert(inputPath, targetFormat as Format | 'all', {
            output: opts.output,
            overwrite: opts.overwrite,
            recursive: opts.recursive,
          });

          logger.info(`Batch conversion complete: ${summary.success}/${summary.total} successful`);
          if (summary.failed > 0) {
            logger.warn(`${summary.failed} files failed`);
            for (const result of summary.results.filter((r) => !r.success)) {
              logger.error(`  ${result.inputPath}: ${result.error}`);
            }
          }
        } else {
          let results: ConvertResult[];
          if (targetFormat === 'all') {
            results = await convertFileToAll(inputPath, {
              output: opts.output,
              overwrite: opts.overwrite,
            });
          } else {
            results = [
              await convertFile(inputPath, targetFormat as Format, {
                output: opts.output,
                overwrite: opts.overwrite,
              }),
            ];
          }

          for (const result of results) {
            if (result.success) {
              logger.info(`Converted: ${result.inputPath} -> ${result.outputPath}`);
              if (result.warnings && result.warnings.length > 0) {
                for (const warning of result.warnings) {
                  logger.warn(`  Warning: ${warning}`);
                }
              }
            } else {
              logger.error(`Failed: ${result.inputPath} - ${result.error}`);
            }
          }
        }
      } catch (err) {
        logger.error(err instanceof Error ? err.message : 'Unknown error');
        process.exit(1);
      }
    }
  );

program
  .command('detect')
  .description('Detect the format of a skill file')
  .argument('<path>', 'Path to skill file')
  .option('--json', 'Output as JSON', false)
  .action(async (inputPath: string, opts: { json: boolean }) => {
    try {
      const content = await readFile(resolve(inputPath), 'utf-8');
      const pathHint = detectFormatFromPath(inputPath);
      const result = detectFormat(content);

      if (pathHint && pathHint !== result.format) {
        result.indicators.push(`Path suggests ${pathHint} format`);
      }

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const formatNames: Record<Format, string> = {
          claude: 'Claude Code',
          codex: 'Codex CLI',
          cursor: 'Cursor',
          continue: 'Continue',
          openclaw: 'OpenClaw',
        };
        logger.info(`Format: ${formatNames[result.format]}`);
        logger.info(`Confidence: ${result.confidence}%`);
        logger.info('Indicators:');
        for (const indicator of result.indicators) {
          logger.info(`  - ${indicator}`);
        }
      }
    } catch (err) {
      logger.error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse();

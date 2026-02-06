import { parseSkillFile } from '@skillbolt/core';
import { resolve, relative, dirname } from 'node:path';

import type {
  BatchOptions,
  BatchResult,
  BatchSuccessItem,
  BatchFailedItem,
  BatchStats,
  DocType,
} from '../types/index.js';
import { scanSkillFiles } from './scanner.js';
import { generateReadme } from '../generator/readme.js';
import { generateApiDocs } from '../generator/api.js';
import { generateExamples } from '../generator/examples.js';
import { writeOutput } from '../output/writer.js';
import { generateIndex } from './indexer.js';

async function processFile(
  inputPath: string,
  outputDir: string,
  baseDir: string,
  options: BatchOptions
): Promise<BatchSuccessItem | BatchFailedItem> {
  const startTime = Date.now();

  try {
    const skill = await parseSkillFile(inputPath);
    const relativePath = relative(baseDir, inputPath);
    const outputFileName = getOutputFileName(
      relativePath,
      options.docType ?? 'readme',
      options.format ?? 'markdown'
    );
    const outputPath = resolve(outputDir, outputFileName);

    let result;
    switch (options.docType ?? 'readme') {
      case 'api':
        result = await generateApiDocs({ skill, format: options.format });
        break;
      case 'examples':
        result = await generateExamples({ skill, format: options.format });
        break;
      default:
        result = await generateReadme({ skill, format: options.format });
    }

    await writeOutput({
      outputPath,
      content: result.content,
      createDirs: true,
    });

    return {
      inputPath,
      outputPath,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      inputPath,
      error: error as Error,
    };
  }
}

function getOutputFileName(relativePath: string, docType: DocType, format: string): string {
  const dir = dirname(relativePath);
  const ext = format === 'html' ? '.html' : format === 'json' ? '.json' : '.md';

  let fileName: string;
  switch (docType) {
    case 'api':
      fileName = 'API' + ext;
      break;
    case 'examples':
      fileName = 'EXAMPLES' + ext;
      break;
    default:
      fileName = 'README' + ext;
  }

  return dir === '.' ? fileName : resolve(dir, fileName);
}

function isSuccessItem(item: BatchSuccessItem | BatchFailedItem): item is BatchSuccessItem {
  return 'outputPath' in item;
}

export async function batchGenerate(options: BatchOptions): Promise<BatchResult> {
  const startTime = Date.now();
  const {
    inputDir,
    outputDir,
    pattern,
    concurrency = 5,
    generateIndex: shouldGenerateIndex = false,
    format = 'markdown',
  } = options;

  const scanResult = await scanSkillFiles(inputDir, pattern);
  const { files, baseDir } = scanResult;

  if (files.length === 0) {
    return {
      success: [],
      failed: [],
      duration: Date.now() - startTime,
      stats: {
        totalFiles: 0,
        successCount: 0,
        failedCount: 0,
        avgDuration: 0,
      },
    };
  }

  const results: (BatchSuccessItem | BatchFailedItem)[] = [];

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((file) => processFile(file, outputDir, baseDir, options))
    );
    results.push(...batchResults);
  }

  const success = results.filter(isSuccessItem);
  const failed = results.filter((r): r is BatchFailedItem => !isSuccessItem(r));

  let indexPath: string | undefined;
  if (shouldGenerateIndex && success.length > 0) {
    indexPath = await generateIndex(success, outputDir, format);
  }

  const totalDuration = success.reduce((sum, item) => sum + item.duration, 0);
  const stats: BatchStats = {
    totalFiles: files.length,
    successCount: success.length,
    failedCount: failed.length,
    avgDuration: success.length > 0 ? totalDuration / success.length : 0,
  };

  return {
    success,
    failed,
    indexPath,
    duration: Date.now() - startTime,
    stats,
  };
}

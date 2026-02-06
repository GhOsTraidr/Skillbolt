import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { WriteOutputOptions, OutputResult } from '../types/index.js';

export async function writeOutput(options: WriteOutputOptions): Promise<OutputResult> {
  const { outputPath, content, createDirs = true } = options;

  try {
    if (createDirs) {
      await mkdir(dirname(outputPath), { recursive: true });
    }

    await writeFile(outputPath, content, 'utf-8');

    return {
      success: true,
      path: outputPath,
      size: Buffer.byteLength(content, 'utf-8'),
    };
  } catch (error) {
    return {
      success: false,
      path: outputPath,
      size: 0,
      error: error as Error,
    };
  }
}

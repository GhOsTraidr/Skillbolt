import fg from 'fast-glob';
import { resolve } from 'node:path';

import type { ScanResult } from '../types/index.js';

const DEFAULT_PATTERN = '**/SKILL.md';

export async function scanSkillFiles(
  baseDir: string,
  pattern: string = DEFAULT_PATTERN
): Promise<ScanResult> {
  const absoluteBaseDir = resolve(baseDir);

  const files = await fg(pattern, {
    cwd: absoluteBaseDir,
    absolute: true,
    onlyFiles: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
  });

  return {
    files,
    baseDir: absoluteBaseDir,
    pattern,
  };
}

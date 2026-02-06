import { mkdir, rm } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { exists } from '@skillbolt/core';
import * as tar from 'tar';

export interface ExtractOptions {
  strip?: number;
  filter?: (path: string) => boolean;
}

export async function extractTarball(
  tarballPath: string,
  destPath: string,
  options: ExtractOptions = {}
): Promise<string> {
  const { strip = 1, filter } = options;

  if (!(await exists(tarballPath))) {
    throw new Error(`Tarball not found: ${tarballPath}`);
  }

  const destDir = dirname(destPath);
  if (!(await exists(destDir))) {
    await mkdir(destDir, { recursive: true });
  }

  if (await exists(destPath)) {
    await rm(destPath, { recursive: true, force: true });
  }

  await mkdir(destPath, { recursive: true });

  await tar.extract({
    file: tarballPath,
    cwd: destPath,
    strip,
    filter,
  });

  return destPath;
}

export async function createTarball(
  sourcePath: string,
  destPath: string,
  options: { prefix?: string } = {}
): Promise<string> {
  const { prefix = '' } = options;

  const destDir = dirname(destPath);
  if (!(await exists(destDir))) {
    await mkdir(destDir, { recursive: true });
  }

  await tar.create(
    {
      file: destPath,
      cwd: dirname(sourcePath),
      prefix,
      gzip: true,
    },
    [basename(sourcePath)]
  );

  return destPath;
}

export async function listTarballContents(tarballPath: string): Promise<string[]> {
  const files: string[] = [];

  await tar.list({
    file: tarballPath,
    onentry: (entry: tar.ReadEntry) => {
      files.push(entry.path);
    },
  });

  return files;
}

export function getTempExtractPath(cachePath: string, name: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return join(cachePath, 'extract', `${name}-${timestamp}-${randomSuffix}`);
}

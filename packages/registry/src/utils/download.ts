import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { exists } from '@skillbolt/core';

export interface DownloadOptions {
  timeout?: number;
  retries?: number;
  expectedSha?: string;
}

export interface DownloadResult {
  path: string;
  size: number;
  sha256: string;
}

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RETRIES = 3;

export async function downloadFile(
  url: string,
  destPath: string,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  const { timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, expectedSha } = options;

  const dir = dirname(destPath);
  if (!(await exists(dir))) {
    await mkdir(dir, { recursive: true });
  }

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await attemptDownload(url, destPath, timeout);

      if (expectedSha && result.sha256 !== expectedSha) {
        throw new Error(`SHA256 mismatch: expected ${expectedSha}, got ${result.sha256}`);
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError ?? new Error('Download failed');
}

async function attemptDownload(
  url: string,
  destPath: string,
  timeout: number
): Promise<DownloadResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'skill-kit-registry/1.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    const fileStream = createWriteStream(destPath);

    await pipeline(response.body as unknown as NodeJS.ReadableStream, fileStream);

    const sha256 = await calculateFileSha256(destPath);
    const content = await readFile(destPath);

    return {
      path: destPath,
      size: content.length,
      sha256,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function calculateFileSha256(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTempDownloadPath(cachePath: string, filename: string): string {
  return join(cachePath, 'downloads', filename);
}

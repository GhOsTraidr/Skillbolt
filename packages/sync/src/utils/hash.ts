import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export function computeHashFromString(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

export async function computeHashFromFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf8');
  return computeHashFromString(content);
}

export function hashesMatch(hash1: string, hash2: string): boolean {
  return hash1.toLowerCase() === hash2.toLowerCase();
}

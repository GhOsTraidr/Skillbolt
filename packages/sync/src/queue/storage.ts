import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { expandTilde, exists } from '@skillbolt/core';

import type { QueuedOperation } from '../types/queue.js';

interface SerializedOperation {
  id: string;
  type: string;
  skillName: string;
  relativePath: string;
  content?: string;
  hash?: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export class QueueStorage {
  private path: string;

  constructor(persistPath: string) {
    this.path = expandTilde(persistPath);
  }

  async save(operations: QueuedOperation[]): Promise<void> {
    const dir = dirname(this.path);
    if (!(await exists(dir))) {
      await mkdir(dir, { recursive: true });
    }

    const serialized: SerializedOperation[] = operations.map((op) => ({
      id: op.id,
      type: op.type,
      skillName: op.skillName,
      relativePath: op.relativePath,
      content: op.content,
      hash: op.hash,
      createdAt: op.createdAt.toISOString(),
      retryCount: op.retryCount,
      lastError: op.lastError,
    }));

    await writeFile(this.path, JSON.stringify(serialized, null, 2), 'utf8');
  }

  async load(): Promise<QueuedOperation[]> {
    if (!(await exists(this.path))) {
      return [];
    }

    try {
      const content = await readFile(this.path, 'utf8');
      const serialized = JSON.parse(content) as SerializedOperation[];

      return serialized.map((op) => ({
        id: op.id,
        type: op.type as QueuedOperation['type'],
        skillName: op.skillName,
        relativePath: op.relativePath,
        content: op.content,
        hash: op.hash,
        createdAt: new Date(op.createdAt),
        retryCount: op.retryCount,
        lastError: op.lastError,
      }));
    } catch {
      return [];
    }
  }

  getPath(): string {
    return this.path;
  }
}

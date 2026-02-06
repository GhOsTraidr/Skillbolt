import { randomUUID } from 'node:crypto';

import type { Backend } from '../types/backend.js';
import type {
  QueuedOperation,
  QueueStatus,
  QueueConfig,
  QueueFlushResult,
} from '../types/queue.js';
import type { SyncOperationType, LocalSkill } from '../types/sync.js';
import { QueueStorage } from './storage.js';
import { checkNetworkConnectivity, createNetworkMonitor } from '../utils/network.js';

const DEFAULT_CONFIG: QueueConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  persistPath: '~/.skill-kit/sync-queue.json',
  autoFlush: true,
};

export class OfflineQueue {
  private operations: QueuedOperation[] = [];
  private config: QueueConfig;
  private storage: QueueStorage;
  private processing = false;
  private networkMonitor: ReturnType<typeof createNetworkMonitor> | null = null;
  private backend: Backend | null = null;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = new QueueStorage(this.config.persistPath);
  }

  setBackend(backend: Backend): void {
    this.backend = backend;
  }

  async enqueue(type: SyncOperationType, skill: LocalSkill): Promise<string> {
    const operation: QueuedOperation = {
      id: randomUUID(),
      type,
      skillName: skill.name,
      relativePath: skill.relativePath,
      content: type === 'push' ? skill.content : undefined,
      hash: skill.hash,
      createdAt: new Date(),
      retryCount: 0,
    };

    this.operations = this.deduplicateOperations([...this.operations, operation]);
    await this.save();

    return operation.id;
  }

  async enqueueDelete(
    type: 'delete-local' | 'delete-remote',
    relativePath: string,
    skillName: string
  ): Promise<string> {
    const operation: QueuedOperation = {
      id: randomUUID(),
      type,
      skillName,
      relativePath,
      createdAt: new Date(),
      retryCount: 0,
    };

    this.operations = this.deduplicateOperations([...this.operations, operation]);
    await this.save();

    return operation.id;
  }

  dequeue(): QueuedOperation | undefined {
    return this.operations.shift();
  }

  peek(): QueuedOperation | undefined {
    return this.operations[0];
  }

  isEmpty(): boolean {
    return this.operations.length === 0;
  }

  getAll(): QueuedOperation[] {
    return [...this.operations];
  }

  getStatus(): QueueStatus {
    const failed = this.operations.filter((op) => op.retryCount >= this.config.maxRetries);
    return {
      pending: this.operations.length - failed.length,
      failed: failed.length,
      processing: this.processing,
      operations: [...this.operations],
    };
  }

  async remove(operationId: string): Promise<boolean> {
    const index = this.operations.findIndex((op) => op.id === operationId);
    if (index === -1) return false;

    this.operations.splice(index, 1);
    await this.save();
    return true;
  }

  async clear(): Promise<void> {
    this.operations = [];
    await this.save();
  }

  async save(): Promise<void> {
    await this.storage.save(this.operations);
  }

  async load(): Promise<void> {
    this.operations = await this.storage.load();
  }

  async flush(): Promise<QueueFlushResult> {
    if (this.processing || !this.backend) {
      return { success: 0, failed: 0, remaining: this.operations.length, errors: [] };
    }

    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      return { success: 0, failed: 0, remaining: this.operations.length, errors: [] };
    }

    this.processing = true;
    const result: QueueFlushResult = {
      success: 0,
      failed: 0,
      remaining: 0,
      errors: [],
    };

    const toProcess = [...this.operations];
    const remaining: QueuedOperation[] = [];

    for (const operation of toProcess) {
      try {
        await this.processOperation(operation);
        result.success++;
      } catch (error) {
        operation.retryCount++;
        operation.lastError = error instanceof Error ? error.message : String(error);

        if (operation.retryCount < this.config.maxRetries) {
          remaining.push(operation);
        } else {
          result.failed++;
          result.errors.push({
            operationId: operation.id,
            error: operation.lastError,
          });
        }
      }
    }

    this.operations = remaining;
    result.remaining = remaining.length;
    await this.save();

    this.processing = false;
    return result;
  }

  startAutoFlush(): void {
    if (this.networkMonitor) return;

    this.networkMonitor = createNetworkMonitor(
      () => {
        if (this.config.autoFlush) {
          void this.flush();
        }
      },
      () => {
        // No action needed when going offline
      }
    );

    this.networkMonitor.start();
  }

  stopAutoFlush(): void {
    if (this.networkMonitor) {
      this.networkMonitor.stop();
      this.networkMonitor = null;
    }
  }

  private async processOperation(operation: QueuedOperation): Promise<void> {
    if (!this.backend) {
      throw new Error('No backend configured');
    }

    switch (operation.type) {
      case 'push': {
        if (!operation.content) {
          throw new Error('Push operation missing content');
        }
        const result = await this.backend.put({
          name: operation.skillName,
          relativePath: operation.relativePath,
          fullPath: '',
          content: operation.content,
          hash: operation.hash ?? '',
          modifiedAt: operation.createdAt,
          size: operation.content.length,
        });
        if (!result.success) {
          throw new Error(result.error ?? 'Upload failed');
        }
        break;
      }

      case 'delete-remote': {
        const result = await this.backend.delete(operation.relativePath);
        if (!result.success) {
          throw new Error(result.error ?? 'Delete failed');
        }
        break;
      }

      case 'pull':
      case 'delete-local':
        // These operations don't require backend calls
        break;

      default:
        throw new Error(`Unknown operation type: ${operation.type as string}`);
    }
  }

  private deduplicateOperations(operations: QueuedOperation[]): QueuedOperation[] {
    const byPath = new Map<string, QueuedOperation>();

    for (const op of operations) {
      const key = `${op.type}:${op.relativePath}`;
      const existing = byPath.get(key);

      if (!existing || op.createdAt > existing.createdAt) {
        byPath.set(key, op);
      }
    }

    return Array.from(byPath.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }
}

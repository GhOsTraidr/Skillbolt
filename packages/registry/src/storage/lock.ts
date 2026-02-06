import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { exists } from '@skillbolt/core';

const LOCK_TIMEOUT_MS = 30000;
const LOCK_RETRY_INTERVAL_MS = 100;

interface LockInfo {
  pid: number;
  timestamp: number;
  operation: string;
}

export class FileLock {
  private readonly lockPath: string;
  private acquired = false;

  constructor(lockPath?: string) {
    this.lockPath = lockPath ?? join(homedir(), '.skill-kit', '.lock');
  }

  async acquire(operation: string, timeoutMs: number = LOCK_TIMEOUT_MS): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (await this.tryAcquire(operation)) {
        return true;
      }

      if (await this.isLockStale()) {
        await this.forceRelease();
        continue;
      }

      await this.sleep(LOCK_RETRY_INTERVAL_MS);
    }

    return false;
  }

  async release(): Promise<void> {
    if (!this.acquired) {
      return;
    }

    try {
      if (await exists(this.lockPath)) {
        const info = await this.readLockInfo();
        if (info && info.pid === process.pid) {
          await rm(this.lockPath, { force: true });
        }
      }
    } finally {
      this.acquired = false;
    }
  }

  isAcquired(): boolean {
    return this.acquired;
  }

  private async tryAcquire(operation: string): Promise<boolean> {
    if (await exists(this.lockPath)) {
      return false;
    }

    try {
      const dir = dirname(this.lockPath);
      if (!(await exists(dir))) {
        await mkdir(dir, { recursive: true });
      }

      const lockInfo: LockInfo = {
        pid: process.pid,
        timestamp: Date.now(),
        operation,
      };

      await writeFile(this.lockPath, JSON.stringify(lockInfo), { flag: 'wx' });
      this.acquired = true;
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        return false;
      }
      throw error;
    }
  }

  private async isLockStale(): Promise<boolean> {
    const info = await this.readLockInfo();
    if (!info) {
      return true;
    }

    const isOwnLock = info.pid === process.pid;
    if (isOwnLock) {
      return false;
    }

    const lockAge = Date.now() - info.timestamp;
    if (lockAge > LOCK_TIMEOUT_MS * 2) {
      return true;
    }

    const isProcessAlive = await this.isProcessRunning(info.pid);
    return !isProcessAlive;
  }

  private async readLockInfo(): Promise<LockInfo | null> {
    try {
      const content = await readFile(this.lockPath, 'utf-8');
      return JSON.parse(content) as LockInfo;
    } catch {
      return null;
    }
  }

  private async forceRelease(): Promise<void> {
    try {
      await rm(this.lockPath, { force: true });
    } catch {
      // Ignore errors
    }
  }

  private async isProcessRunning(pid: number): Promise<boolean> {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export async function withLock<T>(
  operation: string,
  fn: () => Promise<T>,
  lockPath?: string
): Promise<T> {
  const lock = new FileLock(lockPath);
  const acquired = await lock.acquire(operation);

  if (!acquired) {
    throw new Error(`Failed to acquire lock for operation: ${operation}`);
  }

  try {
    return await fn();
  } finally {
    await lock.release();
  }
}

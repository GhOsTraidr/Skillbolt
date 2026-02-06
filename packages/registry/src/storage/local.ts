import { mkdir, rm, symlink, cp, readdir, lstat, readlink } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { expandTilde, exists, isDirectory } from '@skillbolt/core';

import type { InstallMode } from '../types/registry.js';

const DEFAULT_STORAGE_ROOT = '~/.skill-kit/skills';

const IGNORED_PATTERNS = ['.git', 'node_modules', '.DS_Store', 'Thumbs.db', '.env', '.env.local'];

export class LocalStorage {
  private readonly storageRoot: string;

  constructor(customPath?: string) {
    this.storageRoot = expandTilde(customPath ?? DEFAULT_STORAGE_ROOT);
  }

  getStorageRoot(): string {
    return this.storageRoot;
  }

  getSkillPath(name: string): string {
    const safeName = this.sanitizeName(name);
    return join(this.storageRoot, safeName);
  }

  async hasSkill(name: string): Promise<boolean> {
    const skillPath = this.getSkillPath(name);
    return exists(skillPath);
  }

  async ensureStorageRoot(): Promise<void> {
    if (!(await exists(this.storageRoot))) {
      await mkdir(this.storageRoot, { recursive: true });
    }
  }

  async saveSkill(name: string, sourcePath: string, mode: InstallMode): Promise<string> {
    await this.ensureStorageRoot();

    const targetPath = this.getSkillPath(name);
    const sourceExists = await exists(sourcePath);

    if (!sourceExists) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    const sourceIsDir = await isDirectory(sourcePath);
    if (!sourceIsDir) {
      throw new Error(`Source path is not a directory: ${sourcePath}`);
    }

    if (await exists(targetPath)) {
      await rm(targetPath, { recursive: true, force: true });
    }

    if (mode === 'link') {
      await symlink(sourcePath, targetPath, 'dir');
    } else {
      await this.copyDirectory(sourcePath, targetPath);
    }

    return targetPath;
  }

  async removeSkill(name: string): Promise<void> {
    const skillPath = this.getSkillPath(name);
    if (await exists(skillPath)) {
      await rm(skillPath, { recursive: true, force: true });
    }
  }

  async listSkillDirs(): Promise<string[]> {
    if (!(await exists(this.storageRoot))) {
      return [];
    }

    const entries = await readdir(this.storageRoot, { withFileTypes: true });
    const dirs: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        dirs.push(entry.name);
      }
    }

    return dirs.sort();
  }

  async getInstallMode(name: string): Promise<InstallMode | null> {
    const skillPath = this.getSkillPath(name);
    if (!(await exists(skillPath))) {
      return null;
    }

    try {
      const stats = await lstat(skillPath);
      return stats.isSymbolicLink() ? 'link' : 'copy';
    } catch {
      return null;
    }
  }

  async getLinkedPath(name: string): Promise<string | null> {
    const skillPath = this.getSkillPath(name);
    try {
      const stats = await lstat(skillPath);
      if (stats.isSymbolicLink()) {
        return readlink(skillPath);
      }
    } catch {
      // Ignore errors
    }
    return null;
  }

  private sanitizeName(name: string): string {
    return name.replace(/^@/, '').replace(/\//g, '__');
  }

  private shouldIgnore(name: string): boolean {
    return IGNORED_PATTERNS.some((pattern) => name === pattern || name.startsWith(pattern + '/'));
  }

  private async copyDirectory(source: string, target: string): Promise<void> {
    await mkdir(target, { recursive: true });

    const entries = await readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      if (this.shouldIgnore(entry.name)) {
        continue;
      }

      const srcPath = join(source, entry.name);
      const destPath = join(target, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else if (entry.isFile()) {
        await cp(srcPath, destPath);
      }
    }
  }
}

export function getDefaultStorageRoot(): string {
  return join(homedir(), '.skill-kit', 'skills');
}

export function getDefaultCachePath(): string {
  return join(homedir(), '.skill-kit', 'cache');
}

export function getMetadataPath(storagePath?: string): string {
  const root = storagePath ?? getDefaultStorageRoot();
  return join(root, '..', 'installed.json');
}

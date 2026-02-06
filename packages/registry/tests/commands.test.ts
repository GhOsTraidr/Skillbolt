import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

import { formatSkillList } from '../src/commands/list.js';
import { LocalStorage } from '../src/storage/local.js';
import { MetadataManager } from '../src/storage/metadata.js';
import { installFromLocal } from '../src/installer/local.js';
import type { InstalledSkill } from '../src/types/registry.js';

vi.mock('../src/storage/lock.js', () => ({
  withLock: async <T>(_operation: string, fn: () => Promise<T>) => fn(),
  FileLock: vi.fn(),
}));

function uniqueTestDir(): string {
  const random = randomBytes(8).toString('hex');
  return join(tmpdir(), `skill-kit-cmd-${Date.now()}-${random}`);
}

describe('installFromLocal (direct)', () => {
  let testDir: string;
  let storageDir: string;
  let metadataPath: string;
  let sourceDir: string;

  beforeEach(async () => {
    testDir = uniqueTestDir();
    storageDir = join(testDir, 'skills');
    metadataPath = join(testDir, 'installed.json');
    sourceDir = join(testDir, 'source');

    await mkdir(storageDir, { recursive: true });
    await mkdir(sourceDir, { recursive: true });

    const skillContent = `---
name: test-skill
description: A test skill
version: 1.0.0
---

# Overview

Test skill.

# Workflow

1. Do something
`;
    await writeFile(join(sourceDir, 'SKILL.md'), skillContent);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('installs skill from local path', async () => {
    const storage = new LocalStorage(storageDir);
    const metadata = new MetadataManager(metadataPath);

    const result = await installFromLocal({
      sourcePath: sourceDir,
      mode: 'copy',
      storage,
      metadata,
    });

    expect(result.success).toBe(true);
    expect(result.skill?.name).toBe('test-skill');
  });

  it('fails with invalid path', async () => {
    const storage = new LocalStorage(storageDir);
    const metadata = new MetadataManager(metadataPath);

    const result = await installFromLocal({
      sourcePath: join(testDir, 'nonexistent'),
      mode: 'copy',
      storage,
      metadata,
    });

    expect(result.success).toBe(false);
  });
});

describe('MetadataManager listSkills', () => {
  let testDir: string;
  let metadataPath: string;
  let manager: MetadataManager;

  beforeEach(async () => {
    testDir = uniqueTestDir();
    metadataPath = join(testDir, 'installed.json');
    await mkdir(testDir, { recursive: true });
    manager = new MetadataManager(metadataPath);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('returns empty list when no skills installed', async () => {
    const skills = await manager.listSkills();
    expect(skills).toEqual([]);
  });

  it('returns skills after adding', async () => {
    await manager.addSkill({
      name: 'test-skill',
      version: '1.0.0',
      source: { type: 'local', path: '/test' },
      path: '/skills/test-skill',
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'copy',
    });

    const skills = await manager.listSkills();
    expect(skills).toHaveLength(1);
    expect(skills[0]?.name).toBe('test-skill');
  });
});

describe('formatSkillList', () => {
  const mockSkills: InstalledSkill[] = [
    {
      name: 'skill-a',
      version: '1.0.0',
      source: { type: 'local', path: '/test' },
      path: '/skills/skill-a',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      mode: 'copy',
    },
    {
      name: 'skill-b',
      version: '2.0.0',
      source: { type: 'github', repo: 'user/repo' },
      path: '/skills/skill-b',
      installedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      mode: 'copy',
    },
  ];

  it('formats skills as table', () => {
    const output = formatSkillList(mockSkills, 'table');
    expect(output).toContain('skill-a');
    expect(output).toContain('1.0.0');
    expect(output).toContain('local');
    expect(output).toContain('skill-b');
    expect(output).toContain('github');
  });

  it('formats skills as JSON', () => {
    const output = formatSkillList(mockSkills, 'json');
    const parsed = JSON.parse(output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('skill-a');
  });

  it('handles empty list', () => {
    const output = formatSkillList([], 'table');
    expect(output).toBe('No skills installed.');
  });
});

describe('uninstall flow', () => {
  let testDir: string;
  let storageDir: string;
  let metadataPath: string;
  let sourceDir: string;

  beforeEach(async () => {
    testDir = uniqueTestDir();
    storageDir = join(testDir, 'skills');
    metadataPath = join(testDir, 'installed.json');
    sourceDir = join(testDir, 'source');

    await mkdir(storageDir, { recursive: true });
    await mkdir(sourceDir, { recursive: true });

    const skillContent = `---
name: test-skill
description: A test skill
version: 1.0.0
---

# Overview

Test.

# Workflow

1. Do it
`;
    await writeFile(join(sourceDir, 'SKILL.md'), skillContent);

    const storage = new LocalStorage(storageDir);
    const metadata = new MetadataManager(metadataPath);

    await storage.saveSkill('test-skill', sourceDir, 'copy');
    await metadata.addSkill({
      name: 'test-skill',
      version: '1.0.0',
      source: { type: 'local', path: sourceDir },
      path: join(storageDir, 'test-skill'),
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'copy',
    });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('removes skill from storage and metadata', async () => {
    const storage = new LocalStorage(storageDir);
    const metadata = new MetadataManager(metadataPath);

    await storage.removeSkill('test-skill');
    await metadata.removeSkill('test-skill');

    expect(await storage.hasSkill('test-skill')).toBe(false);
    expect(await metadata.hasSkill('test-skill')).toBe(false);
  });

  it('metadata reports skill not found after removal', async () => {
    const metadata = new MetadataManager(metadataPath);

    const hasSkillBefore = await metadata.hasSkill('test-skill');
    expect(hasSkillBefore).toBe(true);

    await metadata.removeSkill('test-skill');

    const hasSkillAfter = await metadata.hasSkill('test-skill');
    expect(hasSkillAfter).toBe(false);
  });
});

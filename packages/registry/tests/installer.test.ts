import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

import { installFromLocal } from '../src/installer/local.js';
import { validateSkillDirectory } from '../src/installer/validator.js';
import {
  resolveInstallTarget,
  isLocalSource,
  isGitHubSource,
  isRegistrySource,
} from '../src/installer/resolver.js';
import { LocalStorage } from '../src/storage/local.js';
import { MetadataManager } from '../src/storage/metadata.js';

function uniqueTestDir(): string {
  const random = randomBytes(8).toString('hex');
  return join(tmpdir(), `skill-kit-inst-${Date.now()}-${random}`);
}

describe('resolveInstallTarget', () => {
  describe('local paths', () => {
    it('recognizes relative paths starting with ./', () => {
      const result = resolveInstallTarget('./my-skill');
      expect(isLocalSource(result.source)).toBe(true);
      if (isLocalSource(result.source)) {
        expect(result.source.path).toBe('./my-skill');
      }
    });

    it('recognizes relative paths starting with ../', () => {
      const result = resolveInstallTarget('../skills/my-skill');
      expect(isLocalSource(result.source)).toBe(true);
    });

    it('recognizes absolute paths', () => {
      const result = resolveInstallTarget('/home/user/skills/my-skill');
      expect(isLocalSource(result.source)).toBe(true);
    });

    it('recognizes tilde paths', () => {
      const result = resolveInstallTarget('~/skills/my-skill');
      expect(isLocalSource(result.source)).toBe(true);
    });
  });

  describe('GitHub sources', () => {
    it('parses github: shorthand', () => {
      const result = resolveInstallTarget('github:user/repo');
      expect(isGitHubSource(result.source)).toBe(true);
      if (isGitHubSource(result.source)) {
        expect(result.source.repo).toBe('user/repo');
        expect(result.source.ref).toBeUndefined();
      }
    });

    it('parses github: with ref', () => {
      const result = resolveInstallTarget('github:user/repo@v1.0.0');
      expect(isGitHubSource(result.source)).toBe(true);
      if (isGitHubSource(result.source)) {
        expect(result.source.repo).toBe('user/repo');
        expect(result.source.ref).toBe('v1.0.0');
      }
    });

    it('parses https GitHub URL', () => {
      const result = resolveInstallTarget('https://github.com/user/repo');
      expect(isGitHubSource(result.source)).toBe(true);
      if (isGitHubSource(result.source)) {
        expect(result.source.repo).toBe('user/repo');
      }
    });
  });

  describe('registry sources', () => {
    it('parses scoped package names', () => {
      const result = resolveInstallTarget('@user/skill');
      expect(isRegistrySource(result.source)).toBe(true);
      if (isRegistrySource(result.source)) {
        expect(result.source.name).toBe('@user/skill');
      }
    });

    it('parses scoped package with version', () => {
      const result = resolveInstallTarget('@user/skill@1.0.0');
      expect(isRegistrySource(result.source)).toBe(true);
      expect(result.version).toBe('1.0.0');
    });

    it('parses unscoped package names', () => {
      const result = resolveInstallTarget('my-skill');
      expect(isRegistrySource(result.source)).toBe(true);
      if (isRegistrySource(result.source)) {
        expect(result.source.name).toBe('my-skill');
      }
    });

    it('parses unscoped package with version', () => {
      const result = resolveInstallTarget('my-skill@^1.0.0');
      expect(isRegistrySource(result.source)).toBe(true);
      expect(result.version).toBe('^1.0.0');
    });
  });
});

describe('validateSkillDirectory', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = uniqueTestDir();
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('returns invalid for non-existent directory', async () => {
    const result = await validateSkillDirectory(join(testDir, 'nonexistent'));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('does not exist');
  });

  it('returns invalid for directory without SKILL.md', async () => {
    const emptyDir = join(testDir, 'empty');
    await mkdir(emptyDir);
    const result = await validateSkillDirectory(emptyDir);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('No SKILL.md found');
  });

  it('returns valid for directory with valid SKILL.md', async () => {
    const skillContent = `---
name: test-skill
description: A test skill
---

# Overview

Test overview.
`;
    await writeFile(join(testDir, 'SKILL.md'), skillContent);

    const result = await validateSkillDirectory(testDir);
    expect(result.valid).toBe(true);
    expect(result.manifest?.name).toBe('test-skill');
  });

  it('returns invalid for malformed SKILL.md', async () => {
    await writeFile(join(testDir, 'SKILL.md'), '# Just a header\n\nNo frontmatter');

    const result = await validateSkillDirectory(testDir);
    expect(result.valid).toBe(false);
  });
});

describe('installFromLocal', () => {
  let testDir: string;
  let storageDir: string;
  let metadataPath: string;
  let sourceDir: string;

  beforeEach(async () => {
    testDir = uniqueTestDir();
    storageDir = join(testDir, 'storage');
    metadataPath = join(testDir, 'installed.json');
    sourceDir = join(testDir, 'source');

    await mkdir(testDir, { recursive: true });
    await mkdir(storageDir, { recursive: true });
    await mkdir(sourceDir, { recursive: true });

    const skillContent = `---
name: test-skill
description: A test skill
version: 1.0.0
---

# Overview

Test skill overview.

# Workflow

1. Step one
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
    expect(result.skill?.version).toBe('1.0.0');
    expect(result.skill?.mode).toBe('copy');
  });

  it('fails when skill already exists without force', async () => {
    const storage = new LocalStorage(storageDir);
    const metadata = new MetadataManager(metadataPath);

    await installFromLocal({
      sourcePath: sourceDir,
      mode: 'copy',
      storage,
      metadata,
    });

    const result = await installFromLocal({
      sourcePath: sourceDir,
      mode: 'copy',
      storage,
      metadata,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('already installed');
  });

  it('overwrites when force is true', async () => {
    const storage = new LocalStorage(storageDir);
    const metadata = new MetadataManager(metadataPath);

    await installFromLocal({
      sourcePath: sourceDir,
      mode: 'copy',
      storage,
      metadata,
    });

    const result = await installFromLocal({
      sourcePath: sourceDir,
      mode: 'copy',
      force: true,
      storage,
      metadata,
    });

    expect(result.success).toBe(true);
  });

  it('creates symlink when mode is link', async () => {
    const storage = new LocalStorage(storageDir);
    const metadata = new MetadataManager(metadataPath);

    const result = await installFromLocal({
      sourcePath: sourceDir,
      mode: 'link',
      storage,
      metadata,
    });

    expect(result.success).toBe(true);
    expect(result.skill?.mode).toBe('link');

    const storedMode = await storage.getInstallMode('test-skill');
    expect(storedMode).toBe('link');
  });
});

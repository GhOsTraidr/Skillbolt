import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';

import { LocalStorage } from '../src/storage/local.js';
import { MetadataManager } from '../src/storage/metadata.js';
import type { InstalledSkill } from '../src/types/registry.js';

function uniqueTestDir(): string {
  const random = randomBytes(8).toString('hex');
  return join(tmpdir(), `skill-kit-test-${Date.now()}-${random}`);
}

describe('LocalStorage', () => {
  let testDir: string;
  let storageDir: string;
  let storage: LocalStorage;
  let sourceDir: string;

  beforeEach(async () => {
    testDir = uniqueTestDir();
    storageDir = join(testDir, 'skills');
    sourceDir = join(testDir, 'source');
    await mkdir(storageDir, { recursive: true });
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'SKILL.md'), '# Test Skill\n');
    storage = new LocalStorage(storageDir);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getStorageRoot', () => {
    it('returns the storage root path', () => {
      expect(storage.getStorageRoot()).toBe(storageDir);
    });
  });

  describe('getSkillPath', () => {
    it('returns correct path for simple name', () => {
      const path = storage.getSkillPath('my-skill');
      expect(path).toBe(join(storageDir, 'my-skill'));
    });

    it('sanitizes scoped package names', () => {
      const path = storage.getSkillPath('@user/skill');
      expect(path).toBe(join(storageDir, 'user__skill'));
    });
  });

  describe('hasSkill', () => {
    it('returns false when skill does not exist', async () => {
      expect(await storage.hasSkill('nonexistent')).toBe(false);
    });

    it('returns true when skill exists', async () => {
      await storage.saveSkill('test-skill', sourceDir, 'copy');
      expect(await storage.hasSkill('test-skill')).toBe(true);
    });
  });

  describe('saveSkill', () => {
    it('copies skill to storage in copy mode', async () => {
      const destPath = await storage.saveSkill('test-skill', sourceDir, 'copy');
      expect(destPath).toBe(join(storageDir, 'test-skill'));

      const content = await readFile(join(destPath, 'SKILL.md'), 'utf-8');
      expect(content).toBe('# Test Skill\n');
    });

    it('creates symlink in link mode', async () => {
      const destPath = await storage.saveSkill('test-skill', sourceDir, 'link');
      expect(destPath).toBe(join(storageDir, 'test-skill'));

      const mode = await storage.getInstallMode('test-skill');
      expect(mode).toBe('link');
    });

    it('overwrites existing skill', async () => {
      await storage.saveSkill('test-skill', sourceDir, 'copy');

      await writeFile(join(sourceDir, 'SKILL.md'), '# Updated Skill\n');
      await storage.saveSkill('test-skill', sourceDir, 'copy');

      const content = await readFile(join(storageDir, 'test-skill', 'SKILL.md'), 'utf-8');
      expect(content).toBe('# Updated Skill\n');
    });
  });

  describe('removeSkill', () => {
    it('removes existing skill', async () => {
      await storage.saveSkill('test-skill', sourceDir, 'copy');
      await storage.removeSkill('test-skill');
      expect(await storage.hasSkill('test-skill')).toBe(false);
    });

    it('does not throw for non-existent skill', async () => {
      await expect(storage.removeSkill('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('listSkillDirs', () => {
    it('returns empty array when no skills installed', async () => {
      const dirs = await storage.listSkillDirs();
      expect(dirs).toEqual([]);
    });

    it('returns sorted list of skill directories', async () => {
      await storage.saveSkill('skill-b', sourceDir, 'copy');
      await storage.saveSkill('skill-a', sourceDir, 'copy');
      const dirs = await storage.listSkillDirs();
      expect(dirs).toEqual(['skill-a', 'skill-b']);
    });
  });
});

describe('MetadataManager', () => {
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
      // Ignore cleanup errors
    }
  });

  const createTestSkill = (name: string): InstalledSkill => ({
    name,
    version: '1.0.0',
    source: { type: 'local', path: '/test/path' },
    path: `/skills/${name}`,
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: 'copy',
  });

  describe('load', () => {
    it('creates empty registry when file does not exist', async () => {
      const registry = await manager.load();
      expect(registry.version).toBe('1.0.0');
      expect(registry.skills).toEqual([]);
    });

    it('loads existing registry', async () => {
      const skill = createTestSkill('test-skill');
      await manager.addSkill(skill);
      manager.clearCache();

      const registry = await manager.load();
      expect(registry.skills).toHaveLength(1);
      expect(registry.skills[0]?.name).toBe('test-skill');
    });
  });

  describe('addSkill', () => {
    it('adds new skill to registry', async () => {
      const skill = createTestSkill('test-skill');
      await manager.addSkill(skill);

      const stored = await manager.getSkill('test-skill');
      expect(stored?.name).toBe('test-skill');
    });

    it('updates existing skill', async () => {
      const skill = createTestSkill('test-skill');
      await manager.addSkill(skill);

      skill.version = '2.0.0';
      await manager.addSkill(skill);

      const skills = await manager.listSkills();
      expect(skills).toHaveLength(1);
      expect(skills[0]?.version).toBe('2.0.0');
    });
  });

  describe('removeSkill', () => {
    it('removes existing skill', async () => {
      await manager.addSkill(createTestSkill('test-skill'));
      const removed = await manager.removeSkill('test-skill');
      expect(removed).toBe(true);

      const skill = await manager.getSkill('test-skill');
      expect(skill).toBeUndefined();
    });

    it('returns false for non-existent skill', async () => {
      const removed = await manager.removeSkill('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('listSkills', () => {
    it('returns sorted list of skills', async () => {
      await manager.addSkill(createTestSkill('skill-b'));
      await manager.addSkill(createTestSkill('skill-a'));

      const skills = await manager.listSkills();
      expect(skills.map((s) => s.name)).toEqual(['skill-a', 'skill-b']);
    });
  });

  describe('hasSkill', () => {
    it('returns true for existing skill', async () => {
      await manager.addSkill(createTestSkill('test-skill'));
      expect(await manager.hasSkill('test-skill')).toBe(true);
    });

    it('returns false for non-existent skill', async () => {
      expect(await manager.hasSkill('nonexistent')).toBe(false);
    });
  });
});

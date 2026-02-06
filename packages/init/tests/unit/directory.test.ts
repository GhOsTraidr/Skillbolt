import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  generateDirectory,
  directoryExists,
  isDirectoryEmpty,
  displayTree,
} from '../../src/generators/directory.js';

describe('directory generator', () => {
  const testDir = join(tmpdir(), 'skill-init-test-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('directoryExists', () => {
    it('should return true for existing directory', async () => {
      const result = await directoryExists(testDir);
      expect(result).toBe(true);
    });

    it('should return false for non-existing directory', async () => {
      const result = await directoryExists(join(testDir, 'nonexistent'));
      expect(result).toBe(false);
    });
  });

  describe('isDirectoryEmpty', () => {
    it('should return true for empty directory', async () => {
      const emptyDir = join(testDir, 'empty');
      await mkdir(emptyDir);
      const result = await isDirectoryEmpty(emptyDir);
      expect(result).toBe(true);
    });

    it('should return false for non-empty directory', async () => {
      await writeFile(join(testDir, 'file.txt'), 'content');
      const result = await isDirectoryEmpty(testDir);
      expect(result).toBe(false);
    });

    it('should return true for non-existing directory', async () => {
      const result = await isDirectoryEmpty(join(testDir, 'nonexistent'));
      expect(result).toBe(true);
    });
  });

  describe('generateDirectory', () => {
    it('should create minimal directory', async () => {
      const skillDir = join(testDir, 'minimal-skill');
      const result = await generateDirectory(skillDir, 'minimal');

      expect(existsSync(skillDir)).toBe(true);
      expect(result).toContain(skillDir);
    });

    it('should create standard directories', async () => {
      const skillDir = join(testDir, 'standard-skill');
      const result = await generateDirectory(skillDir, 'standard');

      expect(existsSync(skillDir)).toBe(true);
      expect(existsSync(join(skillDir, 'references'))).toBe(true);
      expect(result.length).toBeGreaterThan(1);
    });

    it('should create complete directories', async () => {
      const skillDir = join(testDir, 'complete-skill');
      const result = await generateDirectory(skillDir, 'complete');

      expect(existsSync(skillDir)).toBe(true);
      expect(existsSync(join(skillDir, 'references'))).toBe(true);
      expect(existsSync(join(skillDir, 'examples'))).toBe(true);
      expect(existsSync(join(skillDir, 'scripts'))).toBe(true);
    });

    it('should throw if directory exists and is not empty', async () => {
      const skillDir = join(testDir, 'existing');
      await mkdir(skillDir);
      await writeFile(join(skillDir, 'file.txt'), 'content');

      await expect(generateDirectory(skillDir, 'minimal')).rejects.toThrow(
        'Directory already exists'
      );
    });

    it('should overwrite if force is true', async () => {
      const skillDir = join(testDir, 'force-test');
      await mkdir(skillDir);
      await writeFile(join(skillDir, 'old.txt'), 'old content');

      await generateDirectory(skillDir, 'minimal', { force: true });

      expect(existsSync(skillDir)).toBe(true);
      expect(existsSync(join(skillDir, 'old.txt'))).toBe(false);
    });
  });

  describe('displayTree', () => {
    it('should display minimal tree', () => {
      const tree = displayTree('/path/to/skill', ['SKILL.md']);
      expect(tree).toContain('skill/');
      expect(tree).toContain('SKILL.md');
    });

    it('should display standard tree with subdirectories', () => {
      const files = ['SKILL.md', 'README.md', 'references/patterns.md'];
      const tree = displayTree('/path/to/skill', files);

      expect(tree).toContain('skill/');
      expect(tree).toContain('references/');
      expect(tree).toContain('patterns.md');
      expect(tree).toContain('README.md');
      expect(tree).toContain('SKILL.md');
    });

    it('should display tree structure markers', () => {
      const files = ['SKILL.md', 'README.md'];
      const tree = displayTree('/path/to/skill', files);

      expect(tree).toMatch(/[├└]/);
      expect(tree).toMatch(/[──]/);
    });
  });
});

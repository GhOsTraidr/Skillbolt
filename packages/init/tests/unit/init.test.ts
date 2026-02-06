import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { initSkill, getTreeDisplay } from '../../src/init.js';
import type { InitOptions } from '../../src/types.js';

describe('initSkill', () => {
  const testDir = join(tmpdir(), 'skill-init-integration-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should create minimal skill', async () => {
    const skillDir = join(testDir, 'minimal-skill');
    const options: InitOptions = {
      directory: skillDir,
      name: 'Test Skill',
      description: 'A test skill',
      triggers: ['test it'],
      template: 'minimal',
      platform: 'all',
      interactive: false,
    };

    const result = await initSkill(options);

    expect(result.directory).toBe(skillDir);
    expect(result.files).toHaveLength(1);
    expect(result.metadata.name).toBe('Test Skill');
    expect(existsSync(join(skillDir, 'SKILL.md'))).toBe(true);
  });

  it('should create standard skill', async () => {
    const skillDir = join(testDir, 'standard-skill');
    const options: InitOptions = {
      directory: skillDir,
      name: 'Standard Skill',
      description: 'A standard skill',
      triggers: ['do something'],
      template: 'standard',
      platform: 'claude-code',
      interactive: false,
    };

    const result = await initSkill(options);

    expect(result.files.length).toBe(3);
    expect(existsSync(join(skillDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(skillDir, 'README.md'))).toBe(true);
    expect(existsSync(join(skillDir, 'references/patterns.md'))).toBe(true);
  });

  it('should create complete skill', async () => {
    const skillDir = join(testDir, 'complete-skill');
    const options: InitOptions = {
      directory: skillDir,
      name: 'Complete Skill',
      description: 'A complete skill',
      triggers: ['do everything'],
      template: 'complete',
      platform: 'all',
      interactive: false,
      author: 'Test Author',
    };

    const result = await initSkill(options);

    expect(result.files.length).toBe(6);
    expect(existsSync(join(skillDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(skillDir, 'examples/example.sh'))).toBe(true);
    expect(existsSync(join(skillDir, 'scripts/validate.sh'))).toBe(true);
  });

  it('should generate correct SKILL.md content', async () => {
    const skillDir = join(testDir, 'content-test');
    const options: InitOptions = {
      directory: skillDir,
      name: 'Content Test',
      description: 'Testing content generation',
      triggers: ['trigger one', 'trigger two'],
      template: 'minimal',
      platform: 'all',
      interactive: false,
    };

    await initSkill(options);

    const content = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');

    expect(content).toContain('name: Content Test');
    expect(content).toContain('Testing content generation');
    expect(content).toContain('- trigger one');
    expect(content).toContain('- trigger two');
    expect(content).toContain('version: 1.0.0');
  });

  it('should include author in SKILL.md when provided', async () => {
    const skillDir = join(testDir, 'author-test');
    const options: InitOptions = {
      directory: skillDir,
      name: 'Author Test',
      description: 'Testing author field',
      template: 'minimal',
      platform: 'all',
      interactive: false,
      author: 'John Doe',
    };

    await initSkill(options);

    const content = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('author: John Doe');
  });

  it('should fail for invalid options', async () => {
    const options: InitOptions = {
      directory: '',
      interactive: false,
    };

    await expect(initSkill(options)).rejects.toThrow('Invalid options');
  });

  it('should fail without name in non-interactive mode', async () => {
    const skillDir = join(testDir, 'no-name');
    const options: InitOptions = {
      directory: skillDir,
      description: 'test',
      interactive: false,
    };

    await expect(initSkill(options)).rejects.toThrow();
  });

  it('should call callbacks during generation', async () => {
    const skillDir = join(testDir, 'callbacks-test');
    const options: InitOptions = {
      directory: skillDir,
      name: 'Callback Test',
      description: 'Testing callbacks',
      template: 'minimal',
      platform: 'all',
      interactive: false,
    };

    const events: string[] = [];

    await initSkill(options, {
      onStart: () => events.push('start'),
      onMetadataCollected: () => events.push('metadata'),
      onDirectoryCreated: () => events.push('directory'),
      onFilesGenerated: () => events.push('files'),
      onComplete: () => events.push('complete'),
    });

    expect(events).toEqual(['start', 'metadata', 'directory', 'files', 'complete']);
  });

  it('should call onError callback on failure', async () => {
    const options: InitOptions = {
      directory: '',
      interactive: false,
    };

    let errorCalled = false;

    try {
      await initSkill(options, {
        onError: () => {
          errorCalled = true;
        },
      });
    } catch {}

    expect(errorCalled).toBe(true);
  });

  describe('getTreeDisplay', () => {
    it('should generate tree display from result', () => {
      const directory = '/path/to/skill';
      const files = ['/path/to/skill/SKILL.md', '/path/to/skill/README.md'];

      const tree = getTreeDisplay(directory, files);

      expect(tree).toContain('skill/');
      expect(tree).toContain('SKILL.md');
      expect(tree).toContain('README.md');
    });
  });
});

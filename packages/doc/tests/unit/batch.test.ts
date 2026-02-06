import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rm, mkdir, readFile } from 'node:fs/promises';
import { scanSkillFiles } from '../../src/batch/scanner.js';
import { batchGenerate } from '../../src/batch/processor.js';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures');
const TEMP_DIR = join(import.meta.dirname, '../temp');

describe('scanSkillFiles', () => {
  it('should find SKILL.md files in directory', async () => {
    const result = await scanSkillFiles(FIXTURES_DIR);

    expect(result.files.length).toBeGreaterThan(0);
    expect(result.files.some((f) => f.includes('valid-skill'))).toBe(true);
    expect(result.files.some((f) => f.includes('minimal-skill'))).toBe(true);
  });

  it('should use custom pattern', async () => {
    const result = await scanSkillFiles(FIXTURES_DIR, '**/valid-skill/SKILL.md');

    expect(result.files.length).toBe(1);
    expect(result.files[0]).toContain('valid-skill');
  });

  it('should return base directory', async () => {
    const result = await scanSkillFiles(FIXTURES_DIR);

    expect(result.baseDir).toBe(FIXTURES_DIR);
  });
});

describe('batchGenerate', () => {
  beforeEach(async () => {
    await mkdir(TEMP_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEMP_DIR, { recursive: true, force: true });
  });

  it('should generate docs for multiple files', async () => {
    const result = await batchGenerate({
      inputDir: FIXTURES_DIR,
      outputDir: TEMP_DIR,
    });

    expect(result.success.length).toBeGreaterThan(0);
    expect(result.failed.length).toBe(0);
    expect(result.stats.successCount).toBe(result.success.length);
  });

  it('should generate index when requested', async () => {
    const result = await batchGenerate({
      inputDir: FIXTURES_DIR,
      outputDir: TEMP_DIR,
      generateIndex: true,
    });

    expect(result.indexPath).toBeDefined();
    const indexContent = await readFile(result.indexPath!, 'utf-8');
    expect(indexContent).toContain('Skills Index');
    expect(indexContent).toContain('Test Skill');
    expect(indexContent).toContain('Minimal Skill');
  });

  it('should report duration', async () => {
    const result = await batchGenerate({
      inputDir: FIXTURES_DIR,
      outputDir: TEMP_DIR,
    });

    expect(result.duration).toBeGreaterThan(0);
    expect(result.stats.avgDuration).toBeGreaterThan(0);
  });

  it('should handle empty directory', async () => {
    const emptyDir = join(TEMP_DIR, 'empty');
    await mkdir(emptyDir, { recursive: true });

    const result = await batchGenerate({
      inputDir: emptyDir,
      outputDir: TEMP_DIR,
    });

    expect(result.success.length).toBe(0);
    expect(result.failed.length).toBe(0);
    expect(result.stats.totalFiles).toBe(0);
  });

  it('should support HTML format', async () => {
    const result = await batchGenerate({
      inputDir: FIXTURES_DIR,
      outputDir: TEMP_DIR,
      format: 'html',
    });

    expect(result.success.length).toBeGreaterThan(0);
    expect(result.success[0]?.outputPath).toContain('.html');
  });
});

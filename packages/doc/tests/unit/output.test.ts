import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rm, readFile, mkdir } from 'node:fs/promises';
import { parseSkillFile } from '@skillbolt/core';
import { toMarkdown, normalizeMarkdown } from '../../src/output/markdown.js';
import { toHtml } from '../../src/output/html.js';
import { toJson } from '../../src/output/json.js';
import { writeOutput } from '../../src/output/writer.js';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures');
const TEMP_DIR = join(import.meta.dirname, '../temp');

describe('toMarkdown', () => {
  it('should add trailing newline', () => {
    expect(toMarkdown('content')).toBe('content\n');
    expect(toMarkdown('content\n')).toBe('content\n');
  });

  it('should respect trailingNewline option', () => {
    expect(toMarkdown('content', { trailingNewline: false })).toBe('content');
  });
});

describe('normalizeMarkdown', () => {
  it('should normalize line endings', () => {
    expect(normalizeMarkdown('a\r\nb\rc')).toBe('a\nb\nc');
  });

  it('should collapse multiple newlines', () => {
    expect(normalizeMarkdown('a\n\n\n\nb')).toBe('a\n\nb');
  });
});

describe('toHtml', () => {
  it('should convert markdown to HTML', async () => {
    const html = await toHtml('# Hello\n\nWorld');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<p>World</p>');
  });

  it('should include custom title', async () => {
    const html = await toHtml('content', { title: 'My Title' });
    expect(html).toContain('<title>My Title</title>');
  });

  it('should support dark theme', async () => {
    const html = await toHtml('content', { darkTheme: true });
    expect(html).toContain('background: #1a1a1a');
  });

  it('should return only body when fullDocument is false', async () => {
    const html = await toHtml('# Hello', { fullDocument: false });
    expect(html).not.toContain('<!DOCTYPE');
    expect(html).toContain('<h1>Hello</h1>');
  });
});

describe('toJson', () => {
  it('should convert skill to JSON', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const json = toJson(skill);
    const parsed = JSON.parse(json);

    expect(parsed.skill.name).toBe('Test Skill');
    expect(parsed.skill.version).toBe('1.0.0');
    expect(parsed.sections).toBeDefined();
    expect(parsed.sections.length).toBeGreaterThan(0);
  });

  it('should include metadata when enabled', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const json = toJson(skill, { includeMetadata: true });
    const parsed = JSON.parse(json);

    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.generatedAt).toBeDefined();
  });

  it('should include raw content when enabled', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const json = toJson(skill, { includeRaw: true });
    const parsed = JSON.parse(json);

    expect(parsed.raw).toBeDefined();
    expect(parsed.raw).toContain('---');
  });

  it('should support compact output', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const json = toJson(skill, { prettyPrint: false });

    expect(json).not.toContain('\n');
  });
});

describe('writeOutput', () => {
  beforeEach(async () => {
    await mkdir(TEMP_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEMP_DIR, { recursive: true, force: true });
  });

  it('should write content to file', async () => {
    const outputPath = join(TEMP_DIR, 'output.md');
    const result = await writeOutput({
      outputPath,
      content: '# Test',
    });

    expect(result.success).toBe(true);
    expect(result.path).toBe(outputPath);
    expect(result.size).toBeGreaterThan(0);

    const content = await readFile(outputPath, 'utf-8');
    expect(content).toBe('# Test');
  });

  it('should create directories', async () => {
    const outputPath = join(TEMP_DIR, 'nested/dir/output.md');
    const result = await writeOutput({
      outputPath,
      content: 'content',
      createDirs: true,
    });

    expect(result.success).toBe(true);
    const content = await readFile(outputPath, 'utf-8');
    expect(content).toBe('content');
  });
});

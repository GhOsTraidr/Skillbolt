import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { parseSkillFile } from '@skillbolt/core';
import { generateReadme } from '../../src/generator/readme.js';
import { generateApiDocs } from '../../src/generator/api.js';
import { generateExamples } from '../../src/generator/examples.js';
import { generateToc, tocToMarkdown } from '../../src/generator/toc.js';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures');

describe('generateReadme', () => {
  it('should generate README from SKILL.md', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const result = await generateReadme({ skill });

    expect(result.content).toContain('# Test Skill');
    expect(result.content).toContain('A test skill for documentation generation');
    expect(result.format).toBe('markdown');
    expect(result.metadata.templateUsed).toBe('readme.hbs');
  });

  it('should include table of contents when enabled', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const result = await generateReadme({ skill, includeToc: true });

    expect(result.content).toContain('Table of Contents');
  });

  it('should generate HTML format', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const result = await generateReadme({ skill, format: 'html' });

    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('<title>Test Skill</title>');
    expect(result.format).toBe('html');
  });
});

describe('generateApiDocs', () => {
  it('should generate API documentation', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const result = await generateApiDocs({ skill });

    expect(result.content).toContain('API Reference');
    expect(result.content).toContain('Parameters');
    expect(result.format).toBe('markdown');
  });
});

describe('generateExamples', () => {
  it('should generate examples documentation', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const result = await generateExamples({ skill });

    expect(result.content).toContain('Examples');
    expect(result.format).toBe('markdown');
  });
});

describe('generateToc', () => {
  it('should generate table of contents', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const toc = generateToc(skill);

    expect(toc.length).toBeGreaterThan(0);
    expect(toc[0]?.title).toBe('Overview');
    expect(toc[0]?.anchor).toBe('#overview');
    expect(toc[0]?.level).toBe(2);
  });

  it('should extract subheadings', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const toc = generateToc(skill);

    const workflowSection = toc.find((t) => t.title === 'Workflow');
    expect(workflowSection?.children).toBeDefined();
    expect(workflowSection?.children?.length).toBeGreaterThan(0);
  });
});

describe('tocToMarkdown', () => {
  it('should convert TOC to markdown', () => {
    const toc = [
      { title: 'Overview', anchor: '#overview', level: 2 },
      { title: 'Workflow', anchor: '#workflow', level: 2 },
    ];

    const md = tocToMarkdown(toc);
    expect(md).toContain('- [Overview](#overview)');
    expect(md).toContain('- [Workflow](#workflow)');
  });

  it('should handle nested items', () => {
    const toc = [
      {
        title: 'Workflow',
        anchor: '#workflow',
        level: 2,
        children: [{ title: 'Sub-workflow', anchor: '#sub-workflow', level: 3 }],
      },
    ];

    const md = tocToMarkdown(toc);
    expect(md).toContain('- [Workflow](#workflow)');
    expect(md).toContain('  - [Sub-workflow](#sub-workflow)');
  });
});

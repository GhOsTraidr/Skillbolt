import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { parseSkillFile } from '@skillbolt/core';
import { createTemplateContext } from '../../src/types/template.js';
import { TemplateEngine, loadBuiltInTemplate } from '../../src/templates/engine.js';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures');

describe('createTemplateContext', () => {
  it('should create context from skill file', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const context = createTemplateContext(skill);

    expect(context.skill.name).toBe('Test Skill');
    expect(context.skill.description).toBe('A test skill for documentation generation');
    expect(context.skill.version).toBe('1.0.0');
    expect(context.skill.triggers).toContain('test');
    expect(context.skill.platforms).toContain('claude-code');
  });

  it('should extract sections', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const context = createTemplateContext(skill);

    expect(context.sections.overview).toBeDefined();
    expect(context.sections.workflow).toBeDefined();
    expect(context.sections.parameters).toBeDefined();
  });

  it('should include config options', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const context = createTemplateContext(skill, {
      format: 'html',
      includeToc: false,
      includeTimestamp: true,
    });

    expect(context.config.format).toBe('html');
    expect(context.config.includeTableOfContents).toBe(false);
    expect(context.config.includeTimestamp).toBe(true);
  });
});

describe('TemplateEngine', () => {
  it('should render simple template', () => {
    const engine = new TemplateEngine();
    const template = '# {{skill.name}}\n\n{{skill.description}}';
    const context = {
      skill: {
        name: 'Test',
        description: 'A test',
        version: '1.0.0',
        triggers: [],
        platforms: [],
        tags: [],
        sourcePath: '',
      },
      sections: { all: [], custom: [] },
      config: {
        format: 'markdown' as const,
        includeTableOfContents: false,
        includeTimestamp: false,
        timestamp: '',
      },
      variables: {},
    };

    const result = engine.render(template, context);
    expect(result).toBe('# Test\n\nA test');
  });

  it('should use helpers', () => {
    const engine = new TemplateEngine();
    const template = '{{slugify skill.name}}';
    const context = {
      skill: {
        name: 'Test Skill',
        description: '',
        version: '1.0.0',
        triggers: [],
        platforms: [],
        tags: [],
        sourcePath: '',
      },
      sections: { all: [], custom: [] },
      config: {
        format: 'markdown' as const,
        includeTableOfContents: false,
        includeTimestamp: false,
        timestamp: '',
      },
      variables: {},
    };

    const result = engine.render(template, context);
    expect(result).toBe('test-skill');
  });
});

describe('loadBuiltInTemplate', () => {
  it('should load readme template', async () => {
    const template = await loadBuiltInTemplate('readme');
    expect(template).toContain('{{skill.name}}');
    expect(template).toContain('{{skill.description}}');
  });

  it('should load api template', async () => {
    const template = await loadBuiltInTemplate('api');
    expect(template).toContain('API Reference');
  });

  it('should load examples template', async () => {
    const template = await loadBuiltInTemplate('examples');
    expect(template).toContain('Examples');
  });
});

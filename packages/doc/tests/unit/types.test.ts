import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { parseSkillFile } from '@skillbolt/core';
import { createTemplateContext } from '../../src/types/index.js';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures');

describe('createTemplateContext', () => {
  it('should use default values', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'minimal-skill/SKILL.md'));
    const context = createTemplateContext(skill);

    expect(context.config.format).toBe('markdown');
    expect(context.config.includeTableOfContents).toBe(true);
    expect(context.config.includeTimestamp).toBe(false);
    expect(context.skill.version).toBe('1.0.0');
    expect(context.variables).toEqual({});
  });

  it('should handle skill without optional fields', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'minimal-skill/SKILL.md'));
    const context = createTemplateContext(skill);

    expect(context.skill.triggers).toEqual([]);
    expect(context.skill.platforms).toEqual([]);
    expect(context.skill.tags).toEqual([]);
    expect(context.skill.author).toBeUndefined();
  });

  it('should pass custom variables', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'minimal-skill/SKILL.md'));
    const context = createTemplateContext(skill, {
      variables: { customVar: 'value' },
    });

    expect(context.variables).toEqual({ customVar: 'value' });
  });

  it('should pass TOC', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'minimal-skill/SKILL.md'));
    const toc = [{ title: 'Test', anchor: '#test', level: 2 }];
    const context = createTemplateContext(skill, { toc });

    expect(context.toc).toBe(toc);
  });

  it('should include all section types', async () => {
    const skill = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));
    const context = createTemplateContext(skill);

    expect(context.sections.overview).toBeDefined();
    expect(context.sections.workflow).toBeDefined();
    expect(context.sections.parameters).toBeDefined();
    expect(context.sections.examples).toBeDefined();
    expect(context.sections.errorHandling).toBeDefined();
    expect(context.sections.all.length).toBeGreaterThan(0);
  });
});

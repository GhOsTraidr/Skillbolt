import { describe, it, expect } from 'vitest';
import {
  renderTemplate,
  createTemplateContext,
  renderTemplateFile,
} from '../../src/templates/renderer.js';
import type { TemplateContext } from '../../src/types.js';

describe('renderer', () => {
  const context: TemplateContext = {
    name: 'Test Skill',
    description: 'This is a test skill',
    triggers: ['test something', 'run test'],
    platform: 'claude-code',
    version: '1.0.0',
    year: 2026,
    date: '2026-01-21',
    kebabName: 'test-skill',
  };

  describe('renderTemplate', () => {
    it('should replace basic variables', () => {
      const template = '# {{name}}\n\n{{description}}';
      const result = renderTemplate(template, context);
      expect(result).toBe('# Test Skill\n\nThis is a test skill');
    });

    it('should iterate over triggers', () => {
      const template = `{{#each triggers}}
- {{this}}
{{/each}}`;
      const result = renderTemplate(template, context);
      expect(result).toContain('- test something');
      expect(result).toContain('- run test');
    });

    it('should handle conditional checks with if', () => {
      const template = `{{#if triggers.length}}Has triggers{{else}}No triggers{{/if}}`;
      const result = renderTemplate(template, context);
      expect(result).toBe('Has triggers');
    });

    it('should handle empty triggers', () => {
      const emptyContext = { ...context, triggers: [] };
      const template = '{{#if triggers.length}}Has{{else}}Empty{{/if}}';
      const result = renderTemplate(template, emptyContext);
      expect(result).toBe('Empty');
    });

    it('should access first array element', () => {
      const template = 'First: {{triggers.[0]}}';
      const result = renderTemplate(template, context);
      expect(result).toBe('First: test something');
    });

    it('should handle eq helper', () => {
      const template = `{{#if (eq platform "claude-code")}}Claude{{else}}Other{{/if}}`;
      const result = renderTemplate(template, context);
      expect(result).toBe('Claude');
    });

    it('should preserve special characters', () => {
      const specialContext = { ...context, description: 'Test with "quotes" and <tags>' };
      const template = '{{description}}';
      const result = renderTemplate(template, specialContext);
      expect(result).toBe('Test with "quotes" and <tags>');
    });
  });

  describe('createTemplateContext', () => {
    it('should create context with all fields', () => {
      const result = createTemplateContext(
        'My Awesome Skill',
        'Does something useful',
        ['do something'],
        'all',
        '1.0.0',
        'Test Author'
      );

      expect(result.name).toBe('My Awesome Skill');
      expect(result.description).toBe('Does something useful');
      expect(result.triggers).toEqual(['do something']);
      expect(result.platform).toBe('all');
      expect(result.version).toBe('1.0.0');
      expect(result.author).toBe('Test Author');
      expect(result.kebabName).toBe('my-awesome-skill');
      expect(result.year).toBe(new Date().getFullYear());
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should generate kebab-case name', () => {
      const result = createTemplateContext('My Awesome Skill 123', 'desc', [], 'all', '1.0.0');
      expect(result.kebabName).toBe('my-awesome-skill-123');
    });

    it('should handle special characters in name for kebab case', () => {
      const result = createTemplateContext('Test! @Skill# $Name%', 'desc', [], 'all', '1.0.0');
      expect(result.kebabName).toBe('test-skill-name');
    });

    it('should handle author being undefined', () => {
      const result = createTemplateContext('Test', 'desc', [], 'all', '1.0.0');
      expect(result.author).toBeUndefined();
    });
  });

  describe('renderTemplateFile', () => {
    it('should render both path and content', () => {
      const file = {
        path: 'SKILL.md',
        content: '# {{name}}',
      };
      const result = renderTemplateFile(file, context);
      expect(result.path).toBe('SKILL.md');
      expect(result.content).toBe('# Test Skill');
    });

    it('should handle dynamic paths', () => {
      const file = {
        path: '{{kebabName}}/README.md',
        content: '# {{name}}',
      };
      const result = renderTemplateFile(file, context);
      expect(result.path).toBe('test-skill/README.md');
    });
  });
});

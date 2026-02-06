import { describe, it, expect } from 'vitest';
import { SkillGenerator } from '../../../src/generators/skill-generator.js';
import { FrontmatterBuilder } from '../../../src/generators/frontmatter-builder.js';
import { MarkdownRenderer } from '../../../src/generators/markdown-renderer.js';
import { TemplateValidator } from '../../../src/generators/template-validator.js';
import { createMockSkill } from '../../fixtures/skills.js';

describe('SkillGenerator', () => {
  const generator = new SkillGenerator();

  describe('renderSkill', () => {
    it('should render a complete skill', () => {
      const skill = createMockSkill();
      const rendered = generator.renderSkill(skill);

      expect(rendered).toContain('---');
      expect(rendered).toContain('name: Create React Component');
      expect(rendered).toContain('## Overview');
      expect(rendered).toContain('## When This Skill Applies');
      expect(rendered).toContain('## Core Workflow');
    });

    it('should include all sections', () => {
      const skill = createMockSkill();
      const rendered = generator.renderSkill(skill);

      expect(rendered).toContain('## Prerequisites');
      expect(rendered).toContain('## Parameters');
      expect(rendered).toContain('## Error Handling');
      expect(rendered).toContain('## Example Usage');
      expect(rendered).toContain('## Notes');
    });
  });
});

describe('FrontmatterBuilder', () => {
  const builder = new FrontmatterBuilder();

  describe('build', () => {
    it('should create valid YAML frontmatter', () => {
      const metadata = {
        name: 'Test Skill',
        description: 'This skill does things',
        version: '1.0.0',
      };

      const result = builder.build(metadata);

      expect(result).toMatch(/^---\n/);
      expect(result).toMatch(/\n---$/);
      expect(result).toContain('name: Test Skill');
      expect(result).toContain('version: 1.0.0');
    });

    it('should include license if provided', () => {
      const metadata = {
        name: 'Test',
        description: 'Desc',
        version: '1.0.0',
        license: 'MIT',
      };

      const result = builder.build(metadata);

      expect(result).toContain('license: MIT');
    });
  });

  describe('validateDescription', () => {
    it('should validate proper descriptions', () => {
      const valid = 'This skill should be used when the user asks to "do something".';
      const invalid = 'Use this skill to do something.';

      expect(builder.validateDescription(valid)).toBe(true);
      expect(builder.validateDescription(invalid)).toBe(false);
    });
  });
});

describe('MarkdownRenderer', () => {
  const renderer = new MarkdownRenderer();

  describe('renderSteps', () => {
    it('should render steps with substeps', () => {
      const steps = [
        {
          title: 'First Step',
          description: 'Do the first thing',
          substeps: ['Sub 1', 'Sub 2'],
        },
        {
          title: 'Second Step',
          description: 'Do the second thing',
        },
      ];

      const result = renderer.renderSteps(steps);

      expect(result).toContain('### Step 1: First Step');
      expect(result).toContain('### Step 2: Second Step');
      expect(result).toContain('1. Sub 1');
      expect(result).toContain('2. Sub 2');
    });
  });

  describe('renderParameters', () => {
    it('should render parameters as a table', () => {
      const params = [
        {
          name: 'param1',
          type: 'string' as const,
          description: 'First param',
          default: 'default',
          required: false,
        },
      ];

      const result = renderer.renderParameters(params);

      expect(result).toContain('| Parameter | Type | Default | Description |');
      expect(result).toContain('`param1`');
      expect(result).toContain('`default`');
    });
  });
});

describe('TemplateValidator', () => {
  const validator = new TemplateValidator();

  describe('validate', () => {
    it('should validate a complete skill', () => {
      const skill = createMockSkill();
      const generator = new SkillGenerator();
      const content = generator.renderSkill(skill);

      const result = validator.validate(content, skill);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing frontmatter', () => {
      const skill = createMockSkill();
      const content = '# No frontmatter\n\nSome content';

      const result = validator.validate(content, skill);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'frontmatter')).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  questions,
  validateName,
  validateDescription,
  filterTriggers,
  isValidTemplate,
  isValidPlatform,
  createQuestions,
} from '../../src/prompts/questions.js';

describe('questions', () => {
  describe('validateName', () => {
    it('should reject empty name', () => {
      expect(validateName('')).toBe('Name is required');
    });

    it('should reject whitespace-only name', () => {
      expect(validateName('   ')).toBe('Name is required');
    });

    it('should accept valid name', () => {
      expect(validateName('My Skill')).toBe(true);
    });

    it('should reject name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(validateName(longName)).toBe('Name must be less than 100 characters');
    });
  });

  describe('validateDescription', () => {
    it('should reject empty description', () => {
      expect(validateDescription('')).toBe('Description is required');
    });

    it('should reject whitespace-only description', () => {
      expect(validateDescription('   ')).toBe('Description is required');
    });

    it('should accept valid description', () => {
      expect(validateDescription('A useful skill')).toBe(true);
    });

    it('should reject description longer than 500 characters', () => {
      const longDesc = 'a'.repeat(501);
      expect(validateDescription(longDesc)).toBe('Description must be less than 500 characters');
    });
  });

  describe('filterTriggers', () => {
    it('should split comma-separated triggers', () => {
      const result = filterTriggers('create component, add component, new component');
      expect(result).toEqual(['create component', 'add component', 'new component']);
    });

    it('should handle empty triggers', () => {
      expect(filterTriggers('')).toEqual([]);
    });

    it('should trim whitespace', () => {
      expect(filterTriggers('  foo  ,  bar  ')).toEqual(['foo', 'bar']);
    });

    it('should filter out empty strings after split', () => {
      expect(filterTriggers('foo,,bar,,')).toEqual(['foo', 'bar']);
    });
  });

  describe('isValidTemplate', () => {
    it('should accept valid templates', () => {
      expect(isValidTemplate('minimal')).toBe(true);
      expect(isValidTemplate('standard')).toBe(true);
      expect(isValidTemplate('complete')).toBe(true);
    });

    it('should reject invalid templates', () => {
      expect(isValidTemplate('invalid')).toBe(false);
      expect(isValidTemplate('')).toBe(false);
    });
  });

  describe('isValidPlatform', () => {
    it('should accept valid platforms', () => {
      expect(isValidPlatform('claude-code')).toBe(true);
      expect(isValidPlatform('codex')).toBe(true);
      expect(isValidPlatform('cursor')).toBe(true);
      expect(isValidPlatform('all')).toBe(true);
    });

    it('should reject invalid platforms', () => {
      expect(isValidPlatform('invalid')).toBe(false);
      expect(isValidPlatform('')).toBe(false);
    });
  });

  describe('questions configuration', () => {
    it('should have name question', () => {
      const nameQ = questions.find((q) => q.name === 'name');
      expect(nameQ).toBeDefined();
      expect(nameQ?.type).toBe('input');
    });

    it('should have description question', () => {
      const descQ = questions.find((q) => q.name === 'description');
      expect(descQ).toBeDefined();
      expect(descQ?.type).toBe('input');
    });

    it('should have triggers question', () => {
      const triggersQ = questions.find((q) => q.name === 'triggers');
      expect(triggersQ).toBeDefined();
      expect(triggersQ?.type).toBe('input');
    });

    it('should have template question with choices', () => {
      const templateQ = questions.find((q) => q.name === 'template');
      expect(templateQ).toBeDefined();
      expect(templateQ?.type).toBe('select');
      expect(templateQ?.choices).toHaveLength(3);
    });

    it('should have platform question with choices', () => {
      const platformQ = questions.find((q) => q.name === 'platform');
      expect(platformQ).toBeDefined();
      expect(platformQ?.type).toBe('select');
      expect(platformQ?.choices).toHaveLength(4);
    });
  });

  describe('createQuestions', () => {
    it('should return all questions when no defaults provided', () => {
      const result = createQuestions();
      expect(result).toHaveLength(questions.length);
    });

    it('should filter out questions with defaults', () => {
      const result = createQuestions({
        name: 'Pre-set Name',
        template: 'minimal',
      });
      expect(result.find((q) => q.name === 'name')).toBeUndefined();
      expect(result.find((q) => q.name === 'template')).toBeUndefined();
      expect(result.find((q) => q.name === 'description')).toBeDefined();
    });

    it('should not filter questions with empty string defaults', () => {
      const result = createQuestions({
        name: '',
      });
      expect(result.find((q) => q.name === 'name')).toBeDefined();
    });
  });
});

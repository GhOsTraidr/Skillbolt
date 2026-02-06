import { describe, it, expect } from 'vitest';
import {
  validateInitOptions,
  validateTemplate,
  validatePlatform,
} from '../../src/validators/input.js';
import type { InitOptions } from '../../src/types.js';

describe('validators', () => {
  describe('validateInitOptions', () => {
    it('should pass for valid interactive options', () => {
      const options: InitOptions = {
        directory: './my-skill',
        interactive: true,
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for empty directory', () => {
      const options: InitOptions = {
        directory: '',
        interactive: true,
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Directory is required');
    });

    it('should fail for non-interactive without name', () => {
      const options: InitOptions = {
        directory: './my-skill',
        interactive: false,
        description: 'test',
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required in non-interactive mode');
    });

    it('should fail for non-interactive without description', () => {
      const options: InitOptions = {
        directory: './my-skill',
        interactive: false,
        name: 'test',
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description is required in non-interactive mode');
    });

    it('should fail for invalid template', () => {
      const options: InitOptions = {
        directory: './my-skill',
        template: 'invalid' as any,
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid template');
    });

    it('should fail for invalid platform', () => {
      const options: InitOptions = {
        directory: './my-skill',
        platform: 'invalid' as any,
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid platform');
    });

    it('should fail for name too long', () => {
      const options: InitOptions = {
        directory: './my-skill',
        name: 'a'.repeat(101),
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name must be less than 100 characters');
    });

    it('should fail for description too long', () => {
      const options: InitOptions = {
        directory: './my-skill',
        description: 'a'.repeat(501),
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description must be less than 500 characters');
    });

    it('should pass for valid non-interactive options', () => {
      const options: InitOptions = {
        directory: './my-skill',
        name: 'Test Skill',
        description: 'A test skill',
        triggers: ['test'],
        template: 'minimal',
        platform: 'all',
        interactive: false,
      };
      const result = validateInitOptions(options);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTemplate', () => {
    it('should return true for valid templates', () => {
      expect(validateTemplate('minimal')).toBe(true);
      expect(validateTemplate('standard')).toBe(true);
      expect(validateTemplate('complete')).toBe(true);
    });

    it('should return false for invalid templates', () => {
      expect(validateTemplate('invalid')).toBe(false);
    });
  });

  describe('validatePlatform', () => {
    it('should return true for valid platforms', () => {
      expect(validatePlatform('claude-code')).toBe(true);
      expect(validatePlatform('codex')).toBe(true);
      expect(validatePlatform('cursor')).toBe(true);
      expect(validatePlatform('all')).toBe(true);
    });

    it('should return false for invalid platforms', () => {
      expect(validatePlatform('invalid')).toBe(false);
    });
  });
});

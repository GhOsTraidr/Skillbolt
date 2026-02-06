import { describe, it, expect } from 'vitest';
import {
  slugify,
  formatDate,
  capitalize,
  truncate,
  joinArray,
  indent,
  codeBlock,
  anchor,
} from '../../src/templates/helpers.js';

describe('helpers', () => {
  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test Skill')).toBe('test-skill');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello & World!')).toBe('hello-world');
      expect(slugify('Test (1)')).toBe('test-1');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('hello   world')).toBe('hello-world');
    });
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2026-01-21T12:00:00Z');
      expect(formatDate(date)).toBe('2026-01-21');
    });

    it('should format date string', () => {
      expect(formatDate('2026-01-21T12:00:00Z')).toBe('2026-01-21');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });
  });

  describe('joinArray', () => {
    it('should join array with separator', () => {
      expect(joinArray(['a', 'b', 'c'])).toBe('a, b, c');
      expect(joinArray(['a', 'b'], ' | ')).toBe('a | b');
    });

    it('should filter falsy values', () => {
      expect(joinArray(['a', null, 'b', undefined, 'c'])).toBe('a, b, c');
    });
  });

  describe('indent', () => {
    it('should indent text', () => {
      expect(indent('line1\nline2', 2)).toBe('  line1\n  line2');
    });

    it('should use custom indent size', () => {
      expect(indent('line1', 4)).toBe('    line1');
    });
  });

  describe('codeBlock', () => {
    it('should wrap code in markdown code block', () => {
      expect(codeBlock('const x = 1;', 'javascript')).toBe('```javascript\nconst x = 1;\n```');
    });

    it('should handle no language', () => {
      expect(codeBlock('code')).toBe('```\ncode\n```');
    });
  });

  describe('anchor', () => {
    it('should create anchor link', () => {
      expect(anchor('Hello World')).toBe('#hello-world');
    });
  });
});

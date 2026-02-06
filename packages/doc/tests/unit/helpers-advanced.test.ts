import { describe, it, expect } from 'vitest';
import { ifEquals, ifNotEmpty, times, json, defaultHelpers } from '../../src/templates/helpers.js';

describe('advanced helpers', () => {
  describe('ifEquals', () => {
    it('should call fn when values are equal', () => {
      const options = {
        fn: () => 'yes',
        inverse: () => 'no',
      };

      expect(ifEquals(1, 1, options)).toBe('yes');
      expect(ifEquals('a', 'a', options)).toBe('yes');
    });

    it('should call inverse when values are not equal', () => {
      const options = {
        fn: () => 'yes',
        inverse: () => 'no',
      };

      expect(ifEquals(1, 2, options)).toBe('no');
      expect(ifEquals('a', 'b', options)).toBe('no');
    });
  });

  describe('ifNotEmpty', () => {
    it('should call fn for non-empty values', () => {
      const options = {
        fn: () => 'has value',
        inverse: () => 'empty',
      };

      expect(ifNotEmpty('text', options)).toBe('has value');
      expect(ifNotEmpty(['a'], options)).toBe('has value');
      expect(ifNotEmpty(0, options)).toBe('has value');
    });

    it('should call inverse for empty values', () => {
      const options = {
        fn: () => 'has value',
        inverse: () => 'empty',
      };

      expect(ifNotEmpty(null, options)).toBe('empty');
      expect(ifNotEmpty(undefined, options)).toBe('empty');
      expect(ifNotEmpty('', options)).toBe('empty');
      expect(ifNotEmpty([], options)).toBe('empty');
    });
  });

  describe('times', () => {
    it('should iterate n times', () => {
      const results: number[] = [];
      const options = {
        fn: (data: { index: number }) => {
          results.push(data.index);
          return String(data.index);
        },
      };

      const result = times(3, options);
      expect(results).toEqual([0, 1, 2]);
      expect(result).toBe('012');
    });

    it('should pass first and last flags', () => {
      const flags: { first: boolean; last: boolean }[] = [];
      const options = {
        fn: (data: { first: boolean; last: boolean }) => {
          flags.push({ first: data.first, last: data.last });
          return '';
        },
      };

      times(3, options);
      expect(flags[0]).toEqual({ first: true, last: false });
      expect(flags[1]).toEqual({ first: false, last: false });
      expect(flags[2]).toEqual({ first: false, last: true });
    });
  });

  describe('json', () => {
    it('should convert to JSON string', () => {
      expect(json({ a: 1 })).toBe('{\n  "a": 1\n}');
      expect(json([1, 2])).toBe('[\n  1,\n  2\n]');
    });
  });

  describe('defaultHelpers', () => {
    it('should return all helpers', () => {
      const helpers = defaultHelpers();

      expect(helpers['slugify']).toBeDefined();
      expect(helpers['formatDate']).toBeDefined();
      expect(helpers['capitalize']).toBeDefined();
      expect(helpers['truncate']).toBeDefined();
      expect(helpers['join']).toBeDefined();
      expect(helpers['indent']).toBeDefined();
      expect(helpers['codeBlock']).toBeDefined();
      expect(helpers['anchor']).toBeDefined();
      expect(helpers['json']).toBeDefined();
      expect(helpers['eq']).toBeDefined();
      expect(helpers['notEmpty']).toBeDefined();
      expect(helpers['times']).toBeDefined();
    });

    it('should work with default parameters', () => {
      const helpers = defaultHelpers();

      expect(helpers['truncate']?.('hello', undefined)).toBe('hello');
      expect(helpers['indent']?.('text', undefined)).toBe('  text');
      expect(helpers['codeBlock']?.('code', undefined)).toBe('```\ncode\n```');
      expect(helpers['join']?.(['a', 'b'], undefined)).toBe('a, b');
    });
  });
});

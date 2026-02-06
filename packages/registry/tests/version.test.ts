import { describe, it, expect } from 'vitest';

import {
  isValidVersion,
  isValidRange,
  satisfies,
  getMaxSatisfying,
  compareVersions,
  isGreaterThan,
  isLessThan,
  getUpdateType,
  coerceVersion,
  parseVersion,
  normalizeVersion,
} from '../src/utils/version.js';

describe('version utilities', () => {
  describe('isValidVersion', () => {
    it('returns true for valid versions', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('0.0.1')).toBe(true);
      expect(isValidVersion('10.20.30')).toBe(true);
      expect(isValidVersion('1.0.0-alpha')).toBe(true);
      expect(isValidVersion('1.0.0-beta.1')).toBe(true);
    });

    it('returns false for invalid versions', () => {
      expect(isValidVersion('invalid')).toBe(false);
      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('')).toBe(false);
    });
  });

  describe('isValidRange', () => {
    it('returns true for valid ranges', () => {
      expect(isValidRange('^1.0.0')).toBe(true);
      expect(isValidRange('~1.0.0')).toBe(true);
      expect(isValidRange('>=1.0.0')).toBe(true);
      expect(isValidRange('1.x')).toBe(true);
      expect(isValidRange('*')).toBe(true);
    });

    it('returns false for invalid ranges', () => {
      expect(isValidRange('invalid')).toBe(false);
    });
  });

  describe('satisfies', () => {
    it('checks if version satisfies range', () => {
      expect(satisfies('1.2.3', '^1.0.0')).toBe(true);
      expect(satisfies('1.2.3', '~1.2.0')).toBe(true);
      expect(satisfies('2.0.0', '^1.0.0')).toBe(false);
      expect(satisfies('1.3.0', '~1.2.0')).toBe(false);
    });
  });

  describe('getMaxSatisfying', () => {
    const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '2.1.0'];

    it('finds max satisfying version', () => {
      expect(getMaxSatisfying(versions, '^1.0.0')).toBe('1.2.0');
      expect(getMaxSatisfying(versions, '~2.0.0')).toBe('2.0.0');
      expect(getMaxSatisfying(versions, '>=2.0.0')).toBe('2.1.0');
    });

    it('returns null when no version satisfies', () => {
      expect(getMaxSatisfying(versions, '^3.0.0')).toBe(null);
    });
  });

  describe('compareVersions', () => {
    it('compares versions correctly', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
      expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    });
  });

  describe('isGreaterThan', () => {
    it('checks if first version is greater', () => {
      expect(isGreaterThan('2.0.0', '1.0.0')).toBe(true);
      expect(isGreaterThan('1.0.0', '2.0.0')).toBe(false);
      expect(isGreaterThan('1.0.0', '1.0.0')).toBe(false);
    });
  });

  describe('isLessThan', () => {
    it('checks if first version is less', () => {
      expect(isLessThan('1.0.0', '2.0.0')).toBe(true);
      expect(isLessThan('2.0.0', '1.0.0')).toBe(false);
      expect(isLessThan('1.0.0', '1.0.0')).toBe(false);
    });
  });

  describe('getUpdateType', () => {
    it('detects major updates', () => {
      expect(getUpdateType('1.0.0', '2.0.0')).toBe('major');
    });

    it('detects minor updates', () => {
      expect(getUpdateType('1.0.0', '1.1.0')).toBe('minor');
    });

    it('detects patch updates', () => {
      expect(getUpdateType('1.0.0', '1.0.1')).toBe('patch');
    });

    it('returns null for invalid versions', () => {
      expect(getUpdateType('invalid', '1.0.0')).toBe(null);
    });
  });

  describe('coerceVersion', () => {
    it('coerces version strings', () => {
      expect(coerceVersion('v1.0.0')).toBe('1.0.0');
      expect(coerceVersion('1')).toBe('1.0.0');
      expect(coerceVersion('1.2')).toBe('1.2.0');
    });

    it('returns null for non-coercible strings', () => {
      expect(coerceVersion('invalid')).toBe(null);
    });
  });

  describe('parseVersion', () => {
    it('parses version components', () => {
      const result = parseVersion('1.2.3');
      expect(result).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('returns null for invalid versions', () => {
      expect(parseVersion('invalid')).toBe(null);
    });
  });

  describe('normalizeVersion', () => {
    it('normalizes valid versions', () => {
      expect(normalizeVersion('1.0.0')).toBe('1.0.0');
      expect(normalizeVersion('v1.0.0')).toBe('1.0.0');
    });

    it('returns 0.0.0 for undefined or invalid', () => {
      expect(normalizeVersion(undefined)).toBe('0.0.0');
      expect(normalizeVersion('invalid')).toBe('0.0.0');
    });
  });
});

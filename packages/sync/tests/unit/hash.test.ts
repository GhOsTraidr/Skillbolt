import { describe, it, expect } from 'vitest';
import { computeHashFromString, hashesMatch } from '../../src/utils/hash.js';

describe('hash utilities', () => {
  describe('computeHashFromString', () => {
    it('should compute SHA-256 hash of string', () => {
      const content = 'Hello, World!';
      const hash = computeHashFromString(content);

      expect(hash).toBe('dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f');
    });

    it('should return different hashes for different content', () => {
      const hash1 = computeHashFromString('content1');
      const hash2 = computeHashFromString('content2');

      expect(hash1).not.toBe(hash2);
    });

    it('should return same hash for same content', () => {
      const content = 'same content';
      const hash1 = computeHashFromString(content);
      const hash2 = computeHashFromString(content);

      expect(hash1).toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = computeHashFromString('');
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should handle unicode content', () => {
      const hash = computeHashFromString('');
      expect(hash).toHaveLength(64);
    });
  });

  describe('hashesMatch', () => {
    it('should return true for matching hashes', () => {
      const hash = 'abc123';
      expect(hashesMatch(hash, hash)).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(hashesMatch('ABC123', 'abc123')).toBe(true);
      expect(hashesMatch('AbC123', 'aBc123')).toBe(true);
    });

    it('should return false for non-matching hashes', () => {
      expect(hashesMatch('abc123', 'def456')).toBe(false);
    });
  });
});

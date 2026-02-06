import { describe, it, expect } from 'vitest';
import { suggestCommand, formatSuggestions } from '../src/utils/suggest.js';

describe('suggest', () => {
  describe('suggestCommand', () => {
    it('suggests lint for lnt', () => {
      const suggestions = suggestCommand('lnt');
      expect(suggestions).toContain('lint');
    });

    it('suggests init for inir', () => {
      const suggestions = suggestCommand('inir');
      expect(suggestions).toContain('init');
    });

    it('suggests install for instal', () => {
      const suggestions = suggestCommand('instal');
      expect(suggestions).toContain('install');
    });

    it('returns empty for completely unrelated input', () => {
      const suggestions = suggestCommand('xyzabc123');
      expect(suggestions.length).toBe(0);
    });

    it('respects maxSuggestions', () => {
      const suggestions = suggestCommand('t', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('formatSuggestions', () => {
    it('formats single suggestion', () => {
      const result = formatSuggestions(['lint']);
      expect(result).toBe('Did you mean "lint"?');
    });

    it('formats multiple suggestions', () => {
      const result = formatSuggestions(['lint', 'list']);
      expect(result).toBe('Did you mean one of: "lint", "list"?');
    });

    it('returns empty string for no suggestions', () => {
      const result = formatSuggestions([]);
      expect(result).toBe('');
    });
  });
});

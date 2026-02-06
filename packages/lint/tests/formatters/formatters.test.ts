import { describe, it, expect } from 'vitest';
import type { LintResult } from '../../src/types/index.js';
import { stylishFormatter, jsonFormatter, githubFormatter } from '../../src/formatters/index.js';

const mockResults: LintResult[] = [
  {
    filePath: '/path/to/SKILL.md',
    messages: [
      {
        ruleId: 'frontmatter-required',
        severity: 2,
        message: 'Missing frontmatter',
        line: 1,
        column: 1,
      },
      {
        ruleId: 'description-format',
        severity: 1,
        message: 'Description should use third-person voice',
        line: 2,
        column: 1,
      },
    ],
    errorCount: 1,
    warningCount: 1,
    fixableErrorCount: 0,
    fixableWarningCount: 1,
  },
];

describe('Formatters', () => {
  describe('stylish', () => {
    it('should format results with file path', () => {
      const output = stylishFormatter(mockResults);

      expect(output).toContain('SKILL.md');
    });

    it('should include rule IDs', () => {
      const output = stylishFormatter(mockResults);

      expect(output).toContain('frontmatter-required');
      expect(output).toContain('description-format');
    });

    it('should include line numbers', () => {
      const output = stylishFormatter(mockResults);

      expect(output).toContain('1:1');
      expect(output).toContain('2:1');
    });

    it('should return empty string for no results', () => {
      const output = stylishFormatter([]);

      expect(output).toBe('');
    });
  });

  describe('json', () => {
    it('should output valid JSON', () => {
      const output = jsonFormatter(mockResults);

      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should contain all result data', () => {
      const output = jsonFormatter(mockResults);
      const parsed = JSON.parse(output);

      expect(parsed[0].filePath).toBe('/path/to/SKILL.md');
      expect(parsed[0].messages).toHaveLength(2);
    });
  });

  describe('github', () => {
    it('should output GitHub Actions annotations', () => {
      const output = githubFormatter(mockResults);

      expect(output).toContain('::error');
      expect(output).toContain('::warning');
    });

    it('should include file path', () => {
      const output = githubFormatter(mockResults);

      expect(output).toContain('file=/path/to/SKILL.md');
    });

    it('should include line numbers', () => {
      const output = githubFormatter(mockResults);

      expect(output).toContain('line=1');
      expect(output).toContain('line=2');
    });

    it('should include rule IDs in message', () => {
      const output = githubFormatter(mockResults);

      expect(output).toContain('frontmatter-required:');
      expect(output).toContain('description-format:');
    });
  });
});

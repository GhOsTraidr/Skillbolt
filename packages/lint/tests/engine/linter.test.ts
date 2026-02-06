import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { Linter } from '../../src/engine/linter.js';
import { getResolvedConfig } from '../../src/config/index.js';

const fixturesDir = resolve(import.meta.dirname, '../fixtures');

describe('Linter', () => {
  it('should lint valid SKILL.md without errors', async () => {
    const linter = new Linter();
    const result = await linter.lint(resolve(fixturesDir, 'valid-skill/SKILL.md'));

    expect(result.errorCount).toBe(0);
  });

  it('should report errors for missing frontmatter', async () => {
    const linter = new Linter();
    const result = await linter.lint(resolve(fixturesDir, 'no-frontmatter/SKILL.md'));

    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.messages.some((m) => m.ruleId === 'frontmatter-required')).toBe(true);
  });

  it('should report errors for missing fields', async () => {
    const linter = new Linter();
    const result = await linter.lint(resolve(fixturesDir, 'missing-fields/SKILL.md'));

    expect(result.messages.some((m) => m.ruleId === 'frontmatter-fields')).toBe(true);
  });

  it('should lint multiple files', async () => {
    const linter = new Linter({ cwd: fixturesDir });
    const results = await linter.lintFiles(['**/SKILL.md']);

    expect(results.length).toBeGreaterThan(1);
  });

  it('should respect rule configuration', async () => {
    const linter = new Linter({
      config: getResolvedConfig({
        rules: {
          'frontmatter-required': 'off',
        },
      }),
    });

    const result = await linter.lint(resolve(fixturesDir, 'no-frontmatter/SKILL.md'));
    const frontmatterErrors = result.messages.filter((m) => m.ruleId === 'frontmatter-required');

    expect(frontmatterErrors).toHaveLength(0);
  });

  it('should apply fixes', async () => {
    const linter = new Linter();
    const content = `---
name: Test
description: Help with testing
---

## Overview

Content.

## Workflow

Steps.

\`\`\`bash
echo "test"
\`\`\`
`;

    const result = await linter.fixContent(content, 'test.md');

    expect(result.fixed).toBe(true);
    expect(result.output).toContain('This skill should be used when');
  });
});

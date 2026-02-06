import { describe, it, expect } from 'vitest';
import { Linter } from '../../src/engine/linter.js';
import { getResolvedConfig } from '../../src/config/index.js';
import type { RulesConfig } from '../../src/types/index.js';

const createLinter = (rules: RulesConfig) => {
  return new Linter({
    config: getResolvedConfig({ rules }),
  });
};

describe('Reference Rules', () => {
  describe('no-broken-links', () => {
    it('should pass for valid internal links', async () => {
      const linter = createLinter({ 'no-broken-links': 'error' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

See [Workflow](#workflow) section.

## Workflow

Steps here.
`;
      const result = await linter.lintContent(content, 'test.md');
      const linkErrors = result.messages.filter((m) => m.ruleId === 'no-broken-links');
      expect(linkErrors).toHaveLength(0);
    });

    it('should report broken internal links', async () => {
      const linter = createLinter({ 'no-broken-links': 'error' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

See [Missing Section](#non-existent) for details.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const linkErrors = result.messages.filter((m) => m.ruleId === 'no-broken-links');
      expect(linkErrors.length).toBeGreaterThan(0);
      expect(linkErrors[0]?.message).toContain('non-existent');
    });

    it('should handle multiple broken links', async () => {
      const linter = createLinter({ 'no-broken-links': 'error' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

See [Missing](#missing-one) and [Also Missing](#missing-two).

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const linkErrors = result.messages.filter((m) => m.ruleId === 'no-broken-links');
      expect(linkErrors.length).toBe(2);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { Linter } from '../../src/engine/linter.js';
import { getResolvedConfig } from '../../src/config/index.js';
import type { RulesConfig } from '../../src/types/index.js';

const createLinter = (rules: RulesConfig) => {
  return new Linter({
    config: getResolvedConfig({ rules }),
  });
};

describe('Style Rules', () => {
  describe('description-format', () => {
    it('should pass for third-person description starting with "This skill"', async () => {
      const linter = createLinter({ 'description-format': 'warn' });
      const content = `---
name: Test
description: This skill should be used when the user needs help with testing
---

## Overview

Content.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const styleErrors = result.messages.filter((m) => m.ruleId === 'description-format');
      expect(styleErrors).toHaveLength(0);
    });

    it('should warn for first-person description starting with "I"', async () => {
      const linter = createLinter({ 'description-format': 'warn' });
      const content = `---
name: Test
description: I will help you test things
---

## Overview

Content.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const styleErrors = result.messages.filter((m) => m.ruleId === 'description-format');
      expect(styleErrors.length).toBeGreaterThan(0);
      expect(styleErrors[0]?.message).toContain('third-person');
    });

    it('should warn for description not starting with "This skill"', async () => {
      const linter = createLinter({ 'description-format': 'warn' });
      const content = `---
name: Test
description: Help with testing
---

## Overview

Content.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const styleErrors = result.messages.filter((m) => m.ruleId === 'description-format');
      expect(styleErrors.length).toBeGreaterThan(0);
    });

    it('should provide fix suggestion', async () => {
      const linter = createLinter({ 'description-format': 'warn' });
      const content = `---
name: Test
description: Help with testing
---

## Overview

Content.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const styleErrors = result.messages.filter((m) => m.ruleId === 'description-format');
      expect(styleErrors[0]?.fix).toBeDefined();
    });
  });
});

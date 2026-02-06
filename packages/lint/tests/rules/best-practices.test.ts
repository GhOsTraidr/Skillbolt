import { describe, it, expect } from 'vitest';
import { Linter } from '../../src/engine/linter.js';
import { getResolvedConfig } from '../../src/config/index.js';
import type { RulesConfig } from '../../src/types/index.js';

const createLinter = (rules: RulesConfig) => {
  return new Linter({
    config: getResolvedConfig({ rules }),
  });
};

describe('Best Practices Rules', () => {
  describe('max-length', () => {
    it('should pass for content under max length', async () => {
      const linter = createLinter({ 'max-length': ['warn', { max: 10000 }] });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

Short content.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const lengthErrors = result.messages.filter((m) => m.ruleId === 'max-length');
      expect(lengthErrors).toHaveLength(0);
    });

    it('should warn when content exceeds max length', async () => {
      const linter = createLinter({ 'max-length': ['warn', { max: 100 }] });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

${'A'.repeat(200)}

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const lengthErrors = result.messages.filter((m) => m.ruleId === 'max-length');
      expect(lengthErrors.length).toBeGreaterThan(0);
      expect(lengthErrors[0]?.message).toContain('exceeds');
    });
  });

  describe('examples-exist', () => {
    it('should pass when Examples section exists', async () => {
      const linter = createLinter({ 'examples-exist': 'warn' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

Content.

## Workflow

Steps.

## Examples

Example 1: Basic usage
`;
      const result = await linter.lintContent(content, 'test.md');
      const exampleErrors = result.messages.filter((m) => m.ruleId === 'examples-exist');
      expect(exampleErrors).toHaveLength(0);
    });

    it('should pass when code blocks exist', async () => {
      const linter = createLinter({ 'examples-exist': 'warn' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

Content.

## Workflow

\`\`\`bash
npm run test
\`\`\`
`;
      const result = await linter.lintContent(content, 'test.md');
      const exampleErrors = result.messages.filter((m) => m.ruleId === 'examples-exist');
      expect(exampleErrors).toHaveLength(0);
    });

    it('should warn when no examples found', async () => {
      const linter = createLinter({ 'examples-exist': 'warn' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

No examples here.

## Workflow

Just text.
`;
      const result = await linter.lintContent(content, 'test.md');
      const exampleErrors = result.messages.filter((m) => m.ruleId === 'examples-exist');
      expect(exampleErrors.length).toBeGreaterThan(0);
    });
  });

  describe('triggers-count', () => {
    it('should pass when triggers count is within range', async () => {
      const linter = createLinter({ 'triggers-count': ['warn', { min: 1, max: 5 }] });
      const content = `---
name: Test
description: This skill should be used when testing
triggers:
  - test something
  - run test
---

## Overview

Content.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const triggerErrors = result.messages.filter((m) => m.ruleId === 'triggers-count');
      expect(triggerErrors).toHaveLength(0);
    });

    it('should warn when no triggers defined', async () => {
      const linter = createLinter({ 'triggers-count': ['warn', { min: 1, max: 5 }] });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

Content.

## Workflow

Steps.
`;
      const result = await linter.lintContent(content, 'test.md');
      const triggerErrors = result.messages.filter((m) => m.ruleId === 'triggers-count');
      expect(triggerErrors.length).toBeGreaterThan(0);
    });
  });
});

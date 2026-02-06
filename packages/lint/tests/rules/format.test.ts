import { describe, it, expect } from 'vitest';
import { Linter } from '../../src/engine/linter.js';
import { getResolvedConfig } from '../../src/config/index.js';
import type { RulesConfig } from '../../src/types/index.js';

const createLinter = (rules: RulesConfig) => {
  return new Linter({
    config: getResolvedConfig({ rules }),
  });
};

describe('Format Rules', () => {
  describe('frontmatter-required', () => {
    it('should pass when frontmatter exists', async () => {
      const linter = createLinter({ 'frontmatter-required': 'error' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

Content here.
`;
      const result = await linter.lintContent(content, 'test.md');
      const frontmatterErrors = result.messages.filter((m) => m.ruleId === 'frontmatter-required');
      expect(frontmatterErrors).toHaveLength(0);
    });

    it('should report error when frontmatter is missing', async () => {
      const linter = createLinter({ 'frontmatter-required': 'error' });
      const content = `# No Frontmatter

## Overview

Content here.
`;
      const result = await linter.lintContent(content, 'test.md');
      const frontmatterErrors = result.messages.filter((m) => m.ruleId === 'frontmatter-required');
      expect(frontmatterErrors.length).toBeGreaterThan(0);
      expect(frontmatterErrors[0]?.message).toContain('Missing frontmatter');
    });
  });

  describe('frontmatter-fields', () => {
    it('should pass when all required fields exist', async () => {
      const linter = createLinter({ 'frontmatter-fields': 'error' });
      const content = `---
name: Test Skill
description: This skill should be used when testing
---

## Overview

Content.
`;
      const result = await linter.lintContent(content, 'test.md');
      const fieldErrors = result.messages.filter((m) => m.ruleId === 'frontmatter-fields');
      expect(fieldErrors).toHaveLength(0);
    });

    it('should report error for missing name field', async () => {
      const linter = createLinter({ 'frontmatter-fields': 'error' });
      const content = `---
description: This skill should be used when testing
---

## Overview

Content.
`;
      const result = await linter.lintContent(content, 'test.md');
      const fieldErrors = result.messages.filter((m) => m.ruleId === 'frontmatter-fields');
      expect(fieldErrors.some((e) => e.message.includes('name'))).toBe(true);
    });

    it('should report error for missing description field', async () => {
      const linter = createLinter({ 'frontmatter-fields': 'error' });
      const content = `---
name: Test Skill
---

## Overview

Content.
`;
      const result = await linter.lintContent(content, 'test.md');
      const fieldErrors = result.messages.filter((m) => m.ruleId === 'frontmatter-fields');
      expect(fieldErrors.some((e) => e.message.includes('description'))).toBe(true);
    });

    it('should report error for invalid semver version', async () => {
      const linter = createLinter({ 'frontmatter-fields': 'error' });
      const content = `---
name: Test
description: This skill should be used when testing
version: invalid
---

## Overview

Content.
`;
      const result = await linter.lintContent(content, 'test.md');
      const fieldErrors = result.messages.filter((m) => m.ruleId === 'frontmatter-fields');
      expect(fieldErrors.some((e) => e.message.includes('version'))).toBe(true);
    });
  });

  describe('sections-required', () => {
    it('should pass when all required sections exist', async () => {
      const linter = createLinter({ 'sections-required': 'error' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

Content here.

## Workflow

Steps here.
`;
      const result = await linter.lintContent(content, 'test.md');
      const sectionErrors = result.messages.filter((m) => m.ruleId === 'sections-required');
      expect(sectionErrors).toHaveLength(0);
    });

    it('should report error for missing Workflow section', async () => {
      const linter = createLinter({ 'sections-required': 'error' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

Content here.
`;
      const result = await linter.lintContent(content, 'test.md');
      const sectionErrors = result.messages.filter((m) => m.ruleId === 'sections-required');
      expect(sectionErrors.some((e) => e.message.includes('workflow'))).toBe(true);
    });
  });

  describe('section-not-empty', () => {
    it('should pass when sections have content', async () => {
      const linter = createLinter({ 'section-not-empty': 'warn' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

This is some content.

## Workflow

1. Step one
2. Step two
`;
      const result = await linter.lintContent(content, 'test.md');
      const emptyErrors = result.messages.filter((m) => m.ruleId === 'section-not-empty');
      expect(emptyErrors).toHaveLength(0);
    });

    it('should warn when section is empty', async () => {
      const linter = createLinter({ 'section-not-empty': 'warn' });
      const content = `---
name: Test
description: This skill should be used when testing
---

## Overview

## Workflow

Steps here.
`;
      const result = await linter.lintContent(content, 'test.md');
      const emptyErrors = result.messages.filter((m) => m.ruleId === 'section-not-empty');
      expect(emptyErrors.length).toBeGreaterThan(0);
    });
  });
});

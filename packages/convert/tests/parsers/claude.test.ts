import { describe, it, expect } from 'vitest';
import { parseClaudeSkill } from '../../src/parsers/claude.js';

describe('parseClaudeSkill', () => {
  it('should parse valid SKILL.md with frontmatter', () => {
    const content = `---
name: Test Skill
description: This skill should be used when testing
version: 1.0.0
triggers:
  - test something
---

# Test Skill

## Overview

This is the overview.

## Core Workflow

### Step 1
Do something.
`;

    const result = parseClaudeSkill(content);

    expect(result.metadata.name).toBe('Test Skill');
    expect(result.metadata.description).toContain('This skill should be used');
    expect(result.metadata.version).toBe('1.0.0');
    expect(result.metadata.triggers).toEqual(['test something']);
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]?.name).toBe('Overview');
    expect(result.sections[1]?.name).toBe('Core Workflow');
  });

  it('should handle missing frontmatter', () => {
    const content = `# Test Skill

## Overview
Content here.
`;

    const result = parseClaudeSkill(content);

    expect(result.metadata.name).toBe('');
    expect(result.metadata.description).toBe('');
    expect(result.sections).toHaveLength(1);
  });

  it('should handle empty file', () => {
    const result = parseClaudeSkill('');

    expect(result.metadata.name).toBe('');
    expect(result.sections).toHaveLength(0);
  });

  it('should preserve raw content', () => {
    const content = `---
name: Test
description: Test description
---

# Content`;

    const result = parseClaudeSkill(content);

    expect(result.rawContent).toBe(content);
  });
});

import { describe, it, expect } from 'vitest';
import { parseCodexSkill } from '../../src/parsers/codex.js';

describe('parseCodexSkill', () => {
  it('should parse valid Codex agent file', () => {
    const content = `---
name: my-skill
description: This skill should be used when...
model: o4-mini
---

# Agent Instructions

Do the following tasks.

## Capabilities

- Capability 1
- Capability 2

## Workflow

1. Step one
2. Step two
`;

    const result = parseCodexSkill(content);

    expect(result.metadata.name).toBe('my-skill');
    expect(result.metadata.model).toBe('o4-mini');
    expect(result.sections).toHaveLength(2);
  });

  it('should handle missing model field', () => {
    const content = `---
name: my-skill
description: Test
---

# Instructions`;

    const result = parseCodexSkill(content);

    expect(result.metadata.model).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { parseCursorSkill } from '../../src/parsers/cursor.js';

describe('parseCursorSkill', () => {
  it('should parse .cursorrules file', () => {
    const content = `# My Project Rules

## Overview

This project follows specific guidelines.

## Workflow Rules

### Step 1
Always do X first.

## Constraints

- Never do Y
- Always check Z
`;

    const result = parseCursorSkill(content);

    expect(result.metadata.name).toBe('My Project Rules');
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0]?.name).toBe('Overview');
    expect(result.sections[1]?.name).toBe('Workflow Rules');
    expect(result.sections[2]?.name).toBe('Constraints');
  });

  it('should extract name from h1 title', () => {
    const content = `# Custom Rule Set

## Rules
...`;

    const result = parseCursorSkill(content);

    expect(result.metadata.name).toBe('Custom Rule Set');
  });
});

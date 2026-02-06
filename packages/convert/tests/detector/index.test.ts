import { describe, it, expect } from 'vitest';
import { detectFormat } from '../../src/detector/index.js';

describe('detectFormat', () => {
  it('should detect Claude Code format', () => {
    const content = `---
name: Test Skill
description: This skill should be used when testing
version: 1.0.0
---

# Test Skill

## Overview
...`;

    const result = detectFormat(content);

    expect(result.format).toBe('claude');
    expect(result.confidence).toBeGreaterThan(50);
    expect(result.indicators).toContain('YAML frontmatter with name/description');
  });

  it('should detect Codex format', () => {
    const content = `---
name: my-skill
description: Do something
model: o4-mini
---

# Agent Instructions`;

    const result = detectFormat(content);

    expect(result.format).toBe('codex');
    expect(result.confidence).toBeGreaterThan(40);
    expect(result.indicators).toContain('model field in frontmatter');
  });

  it('should detect Cursor format', () => {
    const content = `# Project Rules

## Workflow Rules

### Step 1
...

## Constraints
...`;

    const result = detectFormat(content);

    expect(result.format).toBe('cursor');
    expect(result.indicators).toContain('No frontmatter');
  });

  it('should detect Continue format', () => {
    const content = JSON.stringify({
      customCommands: [{ name: 'test', prompt: '...' }],
    });

    const result = detectFormat(content);

    expect(result.format).toBe('continue');
    expect(result.indicators).toContain('JSON with customCommands array');
  });

  it('should return low confidence for ambiguous content', () => {
    const content = `# Just a Title

Some content without clear indicators.`;

    const result = detectFormat(content);

    expect(result.confidence).toBeLessThan(50);
  });
});

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  parseFrontmatter,
  parseManifest,
  parseSections,
  parseSkillFile,
  parseSkillString,
  hasRequiredSections,
} from '../../src/parser/index.js';
import { ParseError } from '../../src/errors/index.js';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures');

describe('parseFrontmatter', () => {
  it('should parse valid frontmatter', () => {
    const content = `---
name: Test Skill
description: This skill should be used when testing
version: 1.0.0
---
# Content`;

    const result = parseFrontmatter(content);

    expect(result.data.name).toBe('Test Skill');
    expect(result.data.description).toContain('This skill should be used');
    expect(result.data.version).toBe('1.0.0');
    expect(result.isEmpty).toBe(false);
  });

  it('should return empty for missing frontmatter', () => {
    const content = '# No frontmatter';
    const result = parseFrontmatter(content);
    expect(result.isEmpty).toBe(true);
  });
});

describe('parseManifest', () => {
  it('should parse and validate manifest', () => {
    const content = `---
name: Test Skill
description: Test description
version: 1.0.0
---`;

    const manifest = parseManifest(content);

    expect(manifest.name).toBe('Test Skill');
    expect(manifest.description).toBe('Test description');
    expect(manifest.version).toBe('1.0.0');
  });

  it('should throw for missing name', () => {
    const content = `---
description: Test description
---`;

    expect(() => parseManifest(content)).toThrow(ParseError);
  });

  it('should throw for missing description', () => {
    const content = `---
name: Test Skill
---`;

    expect(() => parseManifest(content)).toThrow(ParseError);
  });

  it('should throw for empty frontmatter', () => {
    const content = '# No frontmatter';

    expect(() => parseManifest(content)).toThrow(ParseError);
  });
});

describe('parseSections', () => {
  it('should extract all h2 sections', () => {
    const content = `
## Overview
Content 1

## Workflow
Content 2

## Parameters
Content 3
`;
    const sections = parseSections(content);

    expect(sections).toHaveLength(3);
    expect(sections[0]?.title).toBe('Overview');
    expect(sections[1]?.title).toBe('Workflow');
    expect(sections[2]?.title).toBe('Parameters');
  });

  it('should infer section types', () => {
    const content = `
## Overview
Overview content

## Core Workflow
Workflow content

## Error Handling
Error content
`;
    const sections = parseSections(content);

    expect(sections[0]?.type).toBe('overview');
    expect(sections[1]?.type).toBe('workflow');
    expect(sections[2]?.type).toBe('errors');
  });

  it('should record correct line numbers', () => {
    const content = `## Section 1
Line 2
Line 3

## Section 2
Line 6`;

    const sections = parseSections(content);

    expect(sections[0]?.lineStart).toBe(1);
    expect(sections[0]?.lineEnd).toBe(4);
    expect(sections[1]?.lineStart).toBe(5);
  });

  it('should handle empty content', () => {
    const sections = parseSections('');
    expect(sections).toHaveLength(0);
  });
});

describe('parseSkillFile', () => {
  it('should parse complete SKILL.md file', async () => {
    const result = await parseSkillFile(join(FIXTURES_DIR, 'valid-skill/SKILL.md'));

    expect(result.manifest.name).toBe('Test Skill');
    expect(result.manifest.version).toBe('1.0.0');
    expect(result.sections.length).toBeGreaterThan(0);
  });

  it('should parse minimal SKILL.md file', async () => {
    const result = await parseSkillFile(join(FIXTURES_DIR, 'minimal-skill/SKILL.md'));

    expect(result.manifest.name).toBe('Minimal Skill');
    expect(result.manifest.description).toBeDefined();
  });

  it('should parse string content', async () => {
    const content = `---
name: Inline Skill
description: An inline skill
---

## Overview

Inline content
`;

    const result = await parseSkillFile(content);

    expect(result.manifest.name).toBe('Inline Skill');
    expect(result.path).toBe('inline');
  });
});

describe('parseSkillString', () => {
  it('should parse skill content from string', () => {
    const content = `---
name: String Skill
description: A skill parsed from string
---

## Overview

Some overview content

## Workflow

Do the work
`;

    const result = parseSkillString(content);

    expect(result.manifest.name).toBe('String Skill');
    expect(result.sections).toHaveLength(2);
    expect(result.path).toBe('inline');
  });
});

describe('hasRequiredSections', () => {
  it('should return true when all required sections present', () => {
    const sections = [
      { type: 'overview' as const, title: 'Overview', content: '', lineStart: 1, lineEnd: 5 },
      { type: 'workflow' as const, title: 'Workflow', content: '', lineStart: 6, lineEnd: 10 },
    ];

    expect(hasRequiredSections(sections)).toBe(true);
  });

  it('should return false when overview missing', () => {
    const sections = [
      { type: 'workflow' as const, title: 'Workflow', content: '', lineStart: 1, lineEnd: 5 },
    ];

    expect(hasRequiredSections(sections)).toBe(false);
  });

  it('should return false when workflow missing', () => {
    const sections = [
      { type: 'overview' as const, title: 'Overview', content: '', lineStart: 1, lineEnd: 5 },
    ];

    expect(hasRequiredSections(sections)).toBe(false);
  });
});

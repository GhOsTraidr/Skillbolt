import { describe, it, expect } from 'vitest';
import { parseClaudeSkill } from '../../src/parsers/claude.js';
import { parseCodexSkill } from '../../src/parsers/codex.js';
import { parseCursorSkill } from '../../src/parsers/cursor.js';
import { ClaudeToCodexConverter } from '../../src/converters/claude-to-codex.js';
import { ClaudeToCursorConverter } from '../../src/converters/claude-to-cursor.js';
import { CodexToClaudeConverter } from '../../src/converters/codex-to-claude.js';
import { CursorToClaudeConverter } from '../../src/converters/cursor-to-claude.js';
import type { ParsedSkill } from '../../src/types.js';

describe('Round-trip conversion', () => {
  it('should preserve core metadata: Claude -> Codex -> Claude', () => {
    const original: ParsedSkill = {
      metadata: {
        name: 'Test Skill',
        description: 'This skill should be used when testing',
      },
      sections: [
        { name: 'Overview', content: 'Overview text', level: 2 },
        { name: 'Core Workflow', content: 'Workflow text', level: 2 },
      ],
      rawContent: '',
    };

    const toCodex = new ClaudeToCodexConverter();
    const toClaude = new CodexToClaudeConverter();

    const codexContent = toCodex.convert(original);
    const codexParsed = parseCodexSkill(codexContent);
    const backToClaude = toClaude.convert(codexParsed);
    const finalParsed = parseClaudeSkill(backToClaude);

    expect(finalParsed.metadata.name).toBe('Test Skill');
    expect(finalParsed.metadata.description).toBe(original.metadata.description);
  });

  it('should preserve core metadata: Claude -> Cursor -> Claude', () => {
    const original: ParsedSkill = {
      metadata: {
        name: 'Test Skill',
        description: 'This skill should be used when testing',
      },
      sections: [{ name: 'Overview', content: 'Overview text', level: 2 }],
      rawContent: '',
    };

    const toCursor = new ClaudeToCursorConverter();
    const toClaude = new CursorToClaudeConverter();

    const cursorContent = toCursor.convert(original);
    const cursorParsed = parseCursorSkill(cursorContent);
    const backToClaude = toClaude.convert(cursorParsed);
    const finalParsed = parseClaudeSkill(backToClaude);

    expect(finalParsed.metadata.name).toBe('Test Skill');
  });

  it('should warn about lossy conversion fields', () => {
    const original: ParsedSkill = {
      metadata: {
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        triggers: ['trigger 1'],
      },
      sections: [],
      rawContent: '',
    };

    const converter = new ClaudeToCodexConverter();
    const { warnings } = converter.convertWithWarnings(original);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes('version'))).toBe(true);
    expect(warnings.some((w) => w.includes('triggers'))).toBe(true);
  });
});

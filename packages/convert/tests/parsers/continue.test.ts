import { describe, it, expect } from 'vitest';
import { parseContinueSkill } from '../../src/parsers/continue.js';

describe('parseContinueSkill', () => {
  it('should parse config.json customCommands', () => {
    const content = JSON.stringify({
      customCommands: [
        {
          name: 'my-skill',
          description: 'This skill should be used when...',
          prompt: '# Instructions\n\nDo the following...',
        },
      ],
    });

    const result = parseContinueSkill(content, 'my-skill');

    expect(result.metadata.name).toBe('my-skill');
    expect(result.metadata.description).toContain('This skill should be used');
    expect(result.rawContent).toContain('# Instructions');
  });

  it('should throw for invalid JSON', () => {
    expect(() => parseContinueSkill('invalid json', 'test')).toThrow();
  });

  it('should throw for missing command', () => {
    const content = JSON.stringify({ customCommands: [] });

    expect(() => parseContinueSkill(content, 'non-existent')).toThrow();
  });
});

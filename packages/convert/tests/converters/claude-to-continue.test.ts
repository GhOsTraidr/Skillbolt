import { describe, it, expect } from 'vitest';
import { ClaudeToContinueConverter } from '../../src/converters/claude-to-continue.js';
import type { ParsedSkill } from '../../src/types.js';

describe('ClaudeToContinueConverter', () => {
  const converter = new ClaudeToContinueConverter();

  it('should output valid JSON', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test Skill', description: 'Test description' },
      sections: [{ name: 'Overview', content: 'Content', level: 2 }],
      rawContent: '',
    };

    const result = converter.convert(skill);

    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('should create customCommands array', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test Skill', description: 'Test' },
      sections: [],
      rawContent: '# Full content',
    };

    const result = JSON.parse(converter.convert(skill));

    expect(result.customCommands).toHaveLength(1);
    expect(result.customCommands[0].name).toBe('test-skill');
    expect(result.customCommands[0].description).toBe('Test');
  });

  it('should include full content in prompt field', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test', description: 'Test' },
      sections: [
        { name: 'Overview', content: 'Overview content', level: 2 },
        { name: 'Workflow', content: 'Workflow content', level: 2 },
      ],
      rawContent: '',
    };

    const result = JSON.parse(converter.convert(skill));

    expect(result.customCommands[0].prompt).toContain('Overview content');
    expect(result.customCommands[0].prompt).toContain('Workflow content');
  });
});

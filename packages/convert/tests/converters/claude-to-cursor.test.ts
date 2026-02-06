import { describe, it, expect } from 'vitest';
import { ClaudeToCursorConverter } from '../../src/converters/claude-to-cursor.js';
import type { ParsedSkill } from '../../src/types.js';

describe('ClaudeToCursorConverter', () => {
  const converter = new ClaudeToCursorConverter();

  it('should remove frontmatter', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test Skill', description: 'Test', version: '1.0.0' },
      sections: [{ name: 'Overview', content: 'Content', level: 2 }],
      rawContent: '',
    };

    const result = converter.convert(skill);

    expect(result).not.toContain('---');
    expect(result).not.toContain('name:');
    expect(result.trim()).toMatch(/^# Test Skill/);
  });

  it('should rename Core Workflow to Workflow Rules', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test', description: 'Test' },
      sections: [{ name: 'Core Workflow', content: 'Steps', level: 2 }],
      rawContent: '',
    };

    const result = converter.convert(skill);

    expect(result).toContain('## Workflow Rules');
  });

  it('should rename Prerequisites to Constraints', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test', description: 'Test' },
      sections: [{ name: 'Prerequisites', content: 'Requirements', level: 2 }],
      rawContent: '',
    };

    const result = converter.convert(skill);

    expect(result).toContain('## Constraints');
  });
});

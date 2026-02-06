import { describe, it, expect } from 'vitest';
import { ClaudeToCodexConverter } from '../../src/converters/claude-to-codex.js';
import type { ParsedSkill } from '../../src/types.js';

describe('ClaudeToCodexConverter', () => {
  const converter = new ClaudeToCodexConverter();

  it('should convert name to kebab-case', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'My Test Skill', description: 'Test' },
      sections: [],
      rawContent: '',
    };

    const result = converter.convert(skill);

    expect(result).toContain('name: my-test-skill');
  });

  it('should add default model field', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test', description: 'Test' },
      sections: [],
      rawContent: '',
    };

    const result = converter.convert(skill);

    expect(result).toContain('model: o4-mini');
  });

  it('should rename Core Workflow to Workflow', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test', description: 'Test' },
      sections: [{ name: 'Core Workflow', content: 'Steps here', level: 2 }],
      rawContent: '',
    };

    const result = converter.convert(skill);

    expect(result).toContain('## Workflow');
    expect(result).not.toContain('## Core Workflow');
  });

  it('should remove version field with warning', () => {
    const skill: ParsedSkill = {
      metadata: { name: 'Test', description: 'Test', version: '1.0.0' },
      sections: [],
      rawContent: '',
    };

    const { content, warnings } = converter.convertWithWarnings(skill);

    expect(content).not.toContain('version:');
    expect(warnings).toContain('version field removed (not supported by Codex)');
  });

  it('should remove triggers field with warning', () => {
    const skill: ParsedSkill = {
      metadata: {
        name: 'Test',
        description: 'Test',
        triggers: ['trigger 1', 'trigger 2'],
      },
      sections: [],
      rawContent: '',
    };

    const { warnings } = converter.convertWithWarnings(skill);

    expect(warnings).toContain('triggers field removed (not supported by Codex)');
  });
});

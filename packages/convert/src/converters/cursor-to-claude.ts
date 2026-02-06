import type { ConversionOutput, ParsedSkill } from '../types.js';
import { BaseConverter } from './base.js';

const SECTION_MAPPING: Record<string, string> = {
  'Workflow Rules': 'Core Workflow',
  'workflow rules': 'Core Workflow',
  Constraints: 'Prerequisites',
  constraints: 'Prerequisites',
};

export class CursorToClaudeConverter extends BaseConverter {
  readonly sourceFormat = 'cursor' as const;
  readonly targetFormat = 'claude' as const;

  convert(skill: ParsedSkill): string {
    const { content } = this.convertWithWarnings(skill);
    return content;
  }

  override convertWithWarnings(skill: ParsedSkill): ConversionOutput {
    const warnings: string[] = [];
    const { metadata, sections } = skill;

    warnings.push('description generated from skill name (Cursor has no description field)');

    const name = metadata.name || 'Unnamed Skill';
    const description = `This skill should be used when working with ${name}.`;

    const frontmatter = this.buildFrontmatter({
      name,
      description,
    });

    const mappedSections = sections.map((s) => ({
      ...s,
      name: SECTION_MAPPING[s.name] ?? s.name,
    }));

    const body = this.buildMarkdownBody(mappedSections);

    return {
      content: `${frontmatter}\n\n# ${name}\n\n${body}\n`,
      warnings,
    };
  }
}

export const cursorToClaudeConverter = new CursorToClaudeConverter();

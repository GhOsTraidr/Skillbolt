import type { ConversionOutput, ParsedSkill } from '../types.js';
import { BaseConverter } from './base.js';

const SECTION_MAPPING: Record<string, string> = {
  'Core Workflow': 'Workflow Rules',
  'core workflow': 'Workflow Rules',
  Prerequisites: 'Constraints',
  prerequisites: 'Constraints',
};

export class ClaudeToCursorConverter extends BaseConverter {
  readonly sourceFormat = 'claude' as const;
  readonly targetFormat = 'cursor' as const;

  convert(skill: ParsedSkill): string {
    const { content } = this.convertWithWarnings(skill);
    return content;
  }

  override convertWithWarnings(skill: ParsedSkill): ConversionOutput {
    const warnings: string[] = [];
    const { metadata, sections } = skill;

    if (metadata.version) {
      warnings.push('version field removed (Cursor has no frontmatter)');
    }
    if (metadata.triggers && metadata.triggers.length > 0) {
      warnings.push('triggers field removed (Cursor has no frontmatter)');
    }
    if (metadata.description) {
      warnings.push('description field removed (Cursor has no frontmatter)');
    }

    const title = `# ${metadata.name}\n`;

    const mappedSections = sections.map((s) => ({
      ...s,
      name: SECTION_MAPPING[s.name] ?? s.name,
    }));

    const body = this.buildMarkdownBody(mappedSections);

    return {
      content: `${title}\n${body}\n`,
      warnings,
    };
  }
}

export const claudeToCursorConverter = new ClaudeToCursorConverter();

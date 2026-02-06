import type { ConversionOutput, ParsedSkill } from '../types.js';
import { BaseConverter } from './base.js';

function titleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export class ContinueToClaudeConverter extends BaseConverter {
  readonly sourceFormat = 'continue' as const;
  readonly targetFormat = 'claude' as const;

  convert(skill: ParsedSkill): string {
    const { content } = this.convertWithWarnings(skill);
    return content;
  }

  override convertWithWarnings(skill: ParsedSkill): ConversionOutput {
    const warnings: string[] = [];
    const { metadata, sections } = skill;

    const name = titleCase(metadata.name);
    const description =
      metadata.description || `This skill should be used when working with ${name}.`;

    const frontmatter = this.buildFrontmatter({
      name,
      description,
    });

    const body = sections.length > 0 ? this.buildMarkdownBody(sections) : skill.rawContent;

    return {
      content: `${frontmatter}\n\n# ${name}\n\n${body}\n`,
      warnings,
    };
  }
}

export const continueToClaudeConverter = new ContinueToClaudeConverter();

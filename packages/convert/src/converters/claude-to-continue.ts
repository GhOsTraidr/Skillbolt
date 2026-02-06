import type { ConversionOutput, ParsedSkill } from '../types.js';
import { BaseConverter } from './base.js';

export class ClaudeToContinueConverter extends BaseConverter {
  readonly sourceFormat = 'claude' as const;
  readonly targetFormat = 'continue' as const;

  convert(skill: ParsedSkill): string {
    const { content } = this.convertWithWarnings(skill);
    return content;
  }

  override convertWithWarnings(skill: ParsedSkill): ConversionOutput {
    const warnings: string[] = [];
    const { metadata, sections } = skill;

    if (metadata.version) {
      warnings.push('version field removed (Continue uses JSON format)');
    }
    if (metadata.triggers && metadata.triggers.length > 0) {
      warnings.push('triggers field removed (Continue does not support triggers)');
    }

    const prompt = this.buildMarkdownBody(sections);

    const config = {
      customCommands: [
        {
          name: this.toKebabCase(metadata.name),
          description: metadata.description,
          prompt,
        },
      ],
    };

    return {
      content: JSON.stringify(config, null, 2),
      warnings,
    };
  }
}

export const claudeToContinueConverter = new ClaudeToContinueConverter();

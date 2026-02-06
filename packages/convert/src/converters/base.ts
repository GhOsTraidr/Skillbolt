import { kebabCase } from '@skillbolt/core';
import type { Converter, ConversionOutput, Format, ParsedSkill } from '../types.js';

export abstract class BaseConverter implements Converter {
  abstract readonly sourceFormat: Format;
  abstract readonly targetFormat: Format;

  abstract convert(skill: ParsedSkill): string;

  convertWithWarnings(skill: ParsedSkill): ConversionOutput {
    return {
      content: this.convert(skill),
      warnings: [],
    };
  }

  protected toKebabCase(name: string): string {
    return kebabCase(name);
  }

  protected buildFrontmatter(fields: Record<string, unknown>): string {
    const lines = ['---'];
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
    lines.push('---');
    return lines.join('\n');
  }

  protected buildMarkdownBody(
    sections: { name: string; content: string; level: number }[]
  ): string {
    return sections
      .map((s) => {
        const heading = '#'.repeat(s.level) + ' ' + s.name;
        return `${heading}\n\n${s.content}`;
      })
      .join('\n\n');
  }

  protected findSection(
    skill: ParsedSkill,
    name: string
  ): { name: string; content: string } | undefined {
    const normalized = name.toLowerCase();
    return skill.sections.find((s) => s.name.toLowerCase().includes(normalized));
  }
}

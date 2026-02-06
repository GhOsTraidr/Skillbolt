import type { ConversionOutput, ParsedSkill } from '../types.js';
import { BaseConverter } from './base.js';

const SECTION_MAPPING: Record<string, string> = {
  'Core Workflow': 'Workflow',
  'core workflow': 'Workflow',
};

export class ClaudeToCodexConverter extends BaseConverter {
  readonly sourceFormat = 'claude' as const;
  readonly targetFormat = 'codex' as const;

  convert(skill: ParsedSkill): string {
    const { content } = this.convertWithWarnings(skill);
    return content;
  }

  override convertWithWarnings(skill: ParsedSkill): ConversionOutput {
    const warnings: string[] = [];
    const { metadata, sections } = skill;

    if (metadata.version) {
      warnings.push('version field removed (not supported by Codex)');
    }
    if (metadata.triggers && metadata.triggers.length > 0) {
      warnings.push('triggers field removed (not supported by Codex)');
    }

    const frontmatter = this.buildFrontmatter({
      name: this.toKebabCase(metadata.name),
      description: metadata.description,
      model: metadata.model ?? 'o4-mini',
    });

    const mappedSections = sections.map((s) => ({
      ...s,
      name: SECTION_MAPPING[s.name] ?? s.name,
    }));

    const body = this.buildMarkdownBody(mappedSections);

    return {
      content: `${frontmatter}\n\n${body}\n`,
      warnings,
    };
  }
}

export const claudeToCodexConverter = new ClaudeToCodexConverter();

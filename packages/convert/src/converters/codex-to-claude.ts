import type { ConversionOutput, ParsedSkill } from '../types.js';
import { BaseConverter } from './base.js';

const SECTION_MAPPING: Record<string, string> = {
  Workflow: 'Core Workflow',
  workflow: 'Core Workflow',
  Capabilities: 'Overview',
  capabilities: 'Overview',
};

function titleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export class CodexToClaudeConverter extends BaseConverter {
  readonly sourceFormat = 'codex' as const;
  readonly targetFormat = 'claude' as const;

  convert(skill: ParsedSkill): string {
    const { content } = this.convertWithWarnings(skill);
    return content;
  }

  override convertWithWarnings(skill: ParsedSkill): ConversionOutput {
    const warnings: string[] = [];
    const { metadata, sections } = skill;

    if (metadata.model) {
      warnings.push('model field removed (not supported by Claude Code)');
    }

    const name = titleCase(metadata.name);

    const frontmatter = this.buildFrontmatter({
      name,
      description: metadata.description || `This skill should be used when working with ${name}.`,
    });

    const mappedSections = sections.map((s) => ({
      ...s,
      name: SECTION_MAPPING[s.name] ?? s.name,
    }));

    if (!mappedSections.some((s) => s.name.toLowerCase().includes('overview'))) {
      const capabilitiesSection = mappedSections.find(
        (s) => s.name.toLowerCase() === 'capabilities'
      );
      if (capabilitiesSection) {
        capabilitiesSection.name = 'Overview';
      }
    }

    const body = this.buildMarkdownBody(mappedSections);

    return {
      content: `${frontmatter}\n\n# ${name}\n\n${body}\n`,
      warnings,
    };
  }
}

export const codexToClaudeConverter = new CodexToClaudeConverter();

import { parseFrontmatter } from '@skillbolt/core';
import type { ParsedSkill, ParsedSection, Parser } from '../types.js';

function extractSections(content: string): ParsedSection[] {
  const lines = content.split('\n');
  const sections: ParsedSection[] = [];
  let currentSection: { name: string; content: string[]; level: number } | null = null;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h2Match?.[1]) {
      if (currentSection) {
        sections.push({
          name: currentSection.name,
          content: currentSection.content.join('\n').trim(),
          level: currentSection.level,
        });
      }
      currentSection = { name: h2Match[1].trim(), content: [], level: 2 };
    } else if (h3Match?.[1] && currentSection) {
      currentSection.content.push(line);
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  if (currentSection) {
    sections.push({
      name: currentSection.name,
      content: currentSection.content.join('\n').trim(),
      level: currentSection.level,
    });
  }

  return sections;
}

function extractTitle(content: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  return h1Match?.[1]?.trim() ?? '';
}

export function parseCursorSkill(content: string): ParsedSkill {
  const title = extractTitle(content);
  const sections = extractSections(content);

  return {
    metadata: {
      name: title,
      description: '',
    },
    sections,
    rawContent: content,
  };
}

export const cursorParser: Parser = {
  format: 'cursor',

  parse(content: string): ParsedSkill {
    return parseCursorSkill(content);
  },

  canParse(content: string): boolean {
    const { isEmpty } = parseFrontmatter(content);
    if (!isEmpty) return false;

    const hasWorkflowRules = /##\s+Workflow\s+Rules/i.test(content);
    const hasConstraints = /##\s+Constraints/i.test(content);
    const hasH1Title = /^#\s+.+$/m.test(content);

    return hasH1Title && (hasWorkflowRules || hasConstraints);
  },
};

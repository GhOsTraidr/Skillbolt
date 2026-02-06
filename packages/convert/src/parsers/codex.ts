import { parseFrontmatter, parseSections } from '@skillbolt/core';
import type { ParsedSkill, ParsedSection, Parser } from '../types.js';

function convertSections(sections: { title: string; content: string }[]): ParsedSection[] {
  return sections.map((s) => ({
    name: s.title,
    content: s.content,
    level: 2,
  }));
}

export function parseCodexSkill(content: string): ParsedSkill {
  const { data, content: bodyContent, isEmpty } = parseFrontmatter(content);
  const coreSections = parseSections(bodyContent);
  const rawData = data as Record<string, unknown>;

  return {
    metadata: {
      name: isEmpty ? '' : ((rawData['name'] as string) ?? ''),
      description: isEmpty ? '' : ((rawData['description'] as string) ?? ''),
      model: rawData['model'] as string | undefined,
    },
    sections: convertSections(coreSections),
    rawContent: content,
  };
}

export const codexParser: Parser = {
  format: 'codex',

  parse(content: string): ParsedSkill {
    return parseCodexSkill(content);
  },

  canParse(content: string): boolean {
    const hasFrontmatter = content.trimStart().startsWith('---');
    if (!hasFrontmatter) return false;

    const { data } = parseFrontmatter(content);
    const rawData = data as Record<string, unknown>;
    const hasModel = typeof rawData['model'] === 'string';
    const hasName = typeof rawData['name'] === 'string';

    return hasModel || (hasName && /^[a-z0-9-]+$/.test(rawData['name'] as string));
  },
};

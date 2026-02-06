import { parseFrontmatter, parseSections } from '@skillbolt/core';
import type { ParsedSkill, ParsedSection, Parser } from '../types.js';

function convertSections(sections: { title: string; content: string }[]): ParsedSection[] {
  return sections.map((s) => ({
    name: s.title,
    content: s.content,
    level: 2,
  }));
}

export function parseClaudeSkill(content: string): ParsedSkill {
  const { data, content: bodyContent, isEmpty } = parseFrontmatter(content);
  const coreSections = parseSections(bodyContent);

  return {
    metadata: {
      name: isEmpty ? '' : ((data.name as string) ?? ''),
      description: isEmpty ? '' : ((data.description as string) ?? ''),
      version: data.version as string | undefined,
      triggers: data.triggers as string[] | undefined,
      author: data.author as string | undefined,
    },
    sections: convertSections(coreSections),
    rawContent: content,
  };
}

export const claudeParser: Parser = {
  format: 'claude',

  parse(content: string): ParsedSkill {
    return parseClaudeSkill(content);
  },

  canParse(content: string): boolean {
    const hasFrontmatter = content.trimStart().startsWith('---');
    if (!hasFrontmatter) return false;

    const { data } = parseFrontmatter(content);
    const hasNameAndDescription =
      typeof data.name === 'string' && typeof data.description === 'string';
    const hasNoModel = !('model' in data);

    return hasNameAndDescription && hasNoModel;
  },
};

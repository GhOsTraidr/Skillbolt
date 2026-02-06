import type { SkillFile } from '@skillbolt/core';
import type { TocItem } from '../types/index.js';
import { slugify } from '../templates/helpers.js';

export function generateToc(skill: SkillFile): TocItem[] {
  const toc: TocItem[] = [];

  for (const section of skill.sections) {
    toc.push({
      title: section.title,
      anchor: '#' + slugify(section.title),
      level: 2,
    });

    const subheadings = extractSubheadings(section.content);
    if (subheadings.length > 0) {
      const parent = toc[toc.length - 1];
      if (parent) {
        parent.children = subheadings;
      }
    }
  }

  return toc;
}

function extractSubheadings(content: string): TocItem[] {
  const items: TocItem[] = [];
  const h3Regex = /^###\s+(.+)$/gm;

  let match;
  while ((match = h3Regex.exec(content)) !== null) {
    const title = match[1];
    if (title) {
      items.push({
        title: title.trim(),
        anchor: '#' + slugify(title),
        level: 3,
      });
    }
  }

  return items;
}

export function tocToMarkdown(toc: TocItem[], indent = 0): string {
  const lines: string[] = [];
  const prefix = '  '.repeat(indent);

  for (const item of toc) {
    lines.push(`${prefix}- [${item.title}](${item.anchor})`);
    if (item.children && item.children.length > 0) {
      lines.push(tocToMarkdown(item.children, indent + 1));
    }
  }

  return lines.join('\n');
}

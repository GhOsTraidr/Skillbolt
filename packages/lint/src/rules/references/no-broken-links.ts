import type { Rule } from '../../types/index.js';

const INTERNAL_LINK_PATTERN = /\[([^\]]+)\]\(#([^)]+)\)/g;
const HEADING_PATTERN = /^#{1,6}\s+(.+)$/gm;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const noBrokenLinks: Rule = {
  meta: {
    id: 'no-broken-links',
    description: 'Ensure internal links point to existing sections',
    category: 'references',
    severity: 'error',
    fixable: false,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    return {
      Content(content) {
        const headings = new Set<string>();
        let match: RegExpExecArray | null;

        while ((match = HEADING_PATTERN.exec(content)) !== null) {
          const heading = match[1];
          if (heading) {
            headings.add(slugify(heading));
          }
        }

        HEADING_PATTERN.lastIndex = 0;

        const lines = content.split('\n');
        let charOffset = 0;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex] ?? '';
          INTERNAL_LINK_PATTERN.lastIndex = 0;

          while ((match = INTERNAL_LINK_PATTERN.exec(line)) !== null) {
            const anchor = match[2];
            if (anchor && !headings.has(anchor)) {
              context.report({
                message: `Broken internal link: "#${anchor}" does not match any heading`,
                line: lineIndex + 1,
                column: match.index + 1,
              });
            }
          }

          charOffset += line.length + 1;
        }
      },
    };
  },
};

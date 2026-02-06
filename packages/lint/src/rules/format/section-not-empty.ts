import type { Rule } from '../../types/index.js';

export const sectionNotEmpty: Rule = {
  meta: {
    id: 'section-not-empty',
    description: 'Ensure sections have content',
    category: 'format',
    severity: 'warn',
    fixable: false,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    return {
      Section(section) {
        const content = section.content.trim();
        if (content.length === 0) {
          context.report({
            message: `Section "${section.title}" is empty`,
            line: section.lineStart,
            column: 1,
          });
        }
      },
    };
  },
};

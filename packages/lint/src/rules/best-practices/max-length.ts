import type { Rule } from '../../types/index.js';

interface MaxLengthOptions {
  max?: number;
}

const DEFAULT_MAX_LENGTH = 10000;

export const maxLength: Rule = {
  meta: {
    id: 'max-length',
    description: 'Ensure SKILL.md does not exceed maximum length',
    category: 'best-practices',
    severity: 'warn',
    fixable: false,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    const options = (context.options[0] as MaxLengthOptions) ?? {};
    const maxLen = options.max ?? DEFAULT_MAX_LENGTH;

    return {
      Content(content) {
        if (content.length > maxLen) {
          context.report({
            message: `SKILL.md length (${content.length} characters) exceeds maximum (${maxLen} characters)`,
            line: 1,
            column: 1,
          });
        }
      },
    };
  },
};

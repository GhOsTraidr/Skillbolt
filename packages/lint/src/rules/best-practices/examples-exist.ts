import type { Rule } from '../../types/index.js';

const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;

export const examplesExist: Rule = {
  meta: {
    id: 'examples-exist',
    description: 'Ensure SKILL.md contains examples',
    category: 'best-practices',
    severity: 'warn',
    fixable: false,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    return {
      SkillFile(skillFile) {
        const hasExamplesSection = skillFile.sections.some(
          (s: { type: string }) => s.type.toLowerCase() === 'examples'
        );

        if (hasExamplesSection) {
          return;
        }

        const hasCodeBlocks = CODE_BLOCK_PATTERN.test(skillFile.content);

        if (!hasCodeBlocks) {
          context.report({
            message:
              'SKILL.md should contain examples (either an "Examples" section or code blocks)',
            line: 1,
            column: 1,
          });
        }
      },
    };
  },
};

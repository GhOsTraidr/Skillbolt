import type { Rule } from '../../types/index.js';

export const frontmatterRequired: Rule = {
  meta: {
    id: 'frontmatter-required',
    description: 'Ensure SKILL.md has frontmatter',
    category: 'format',
    severity: 'error',
    fixable: false,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    return {
      SkillFile(skillFile) {
        const hasFrontmatter =
          skillFile.content.trimStart().startsWith('---') &&
          skillFile.content.indexOf('---', 3) > 3;

        if (!hasFrontmatter) {
          context.report({
            message: 'Missing frontmatter. SKILL.md must start with YAML frontmatter (---).',
            line: 1,
            column: 1,
          });
        }
      },
    };
  },
};

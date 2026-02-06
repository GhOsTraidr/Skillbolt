import type { Rule } from '../../types/index.js';

const THIRD_PERSON_PATTERN =
  /^This skill (should be used when|helps|provides|enables|allows|is designed to|can be used to)/i;
const FIRST_PERSON_PATTERNS = [/^I /i, /^We /i, /^You /i];

export const descriptionFormat: Rule = {
  meta: {
    id: 'description-format',
    description: 'Ensure description uses third-person voice and proper format',
    category: 'style',
    severity: 'warn',
    fixable: true,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    return {
      Manifest(manifest) {
        const desc = manifest.description;
        if (!desc) return;

        for (const pattern of FIRST_PERSON_PATTERNS) {
          if (pattern.test(desc)) {
            context.report({
              message: 'Description should use third-person voice. Avoid "I", "We", or "You".',
              line: 2,
              column: 1,
            });
            return;
          }
        }

        if (!THIRD_PERSON_PATTERN.test(desc)) {
          const descInContent = context.content.indexOf(`description: ${desc}`);
          const descInContentQuoted = context.content.indexOf(`description: "${desc}"`);
          const descStart = descInContent !== -1 ? descInContent : descInContentQuoted;

          context.report({
            message:
              'Description should start with "This skill should be used when..." or similar third-person phrase.',
            line: 2,
            column: 1,
            fix(fixer) {
              if (descStart === -1) return null;
              const prefix = 'This skill should be used when ';
              const newDesc = prefix + desc.charAt(0).toLowerCase() + desc.slice(1);

              const quoteMatch = context.content.match(/description:\s*["']?/);
              if (quoteMatch && descStart !== -1) {
                const fullMatch = context.content.slice(descStart, descStart + desc.length + 30);
                const hasQuotes =
                  fullMatch.includes(`"${desc}"`) || fullMatch.includes(`'${desc}'`);

                if (hasQuotes) {
                  return fixer.replaceText(`"${desc}"`, `"${newDesc}"`);
                }
                return fixer.replaceText(desc, newDesc);
              }
              return null;
            },
          });
        }
      },
    };
  },
};

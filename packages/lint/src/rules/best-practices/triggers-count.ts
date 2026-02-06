import type { Rule } from '../../types/index.js';

interface TriggersCountOptions {
  min?: number;
  max?: number;
}

export const triggersCount: Rule = {
  meta: {
    id: 'triggers-count',
    description: 'Ensure triggers count is within reasonable range',
    category: 'best-practices',
    severity: 'warn',
    fixable: false,
    docs: {
      recommended: false,
    },
  },
  create(context) {
    const options = (context.options[0] as TriggersCountOptions) ?? {};
    const minCount = options.min ?? 1;
    const maxCount = options.max ?? 10;

    return {
      Manifest(manifest) {
        const triggers = manifest.triggers;

        if (!triggers || !Array.isArray(triggers)) {
          if (minCount > 0) {
            context.report({
              message: `SKILL.md should have at least ${minCount} trigger(s)`,
              line: 1,
              column: 1,
            });
          }
          return;
        }

        if (triggers.length < minCount) {
          context.report({
            message: `SKILL.md has ${triggers.length} trigger(s), but should have at least ${minCount}`,
            line: 1,
            column: 1,
          });
        }

        if (triggers.length > maxCount) {
          context.report({
            message: `SKILL.md has ${triggers.length} trigger(s), but should have at most ${maxCount}`,
            line: 1,
            column: 1,
          });
        }
      },
    };
  },
};

import type { Rule } from '../../types/index.js';

interface SectionsRequiredOptions {
  required?: string[];
}

const DEFAULT_REQUIRED = ['overview', 'workflow'];

export const sectionsRequired: Rule = {
  meta: {
    id: 'sections-required',
    description: 'Ensure required sections exist',
    category: 'format',
    severity: 'error',
    fixable: false,
    docs: {
      recommended: true,
    },
  },
  create(context) {
    const options = (context.options[0] as SectionsRequiredOptions) ?? {};
    const requiredSections = options.required ?? DEFAULT_REQUIRED;

    return {
      SkillFile(skillFile) {
        const existingSections = new Set(
          skillFile.sections.map((s: { type: string }) => s.type.toLowerCase())
        );

        for (const required of requiredSections) {
          if (!existingSections.has(required.toLowerCase())) {
            context.report({
              message: `Missing required section: "${required}"`,
              line: 1,
              column: 1,
            });
          }
        }
      },
    };
  },
};

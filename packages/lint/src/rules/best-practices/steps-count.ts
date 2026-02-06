import type { Rule } from '../../types/index.js';

interface StepsCountOptions {
  max?: number;
}

export const stepsCount: Rule = {
  meta: {
    id: 'steps-count',
    description: 'Ensure workflow does not have too many steps',
    category: 'best-practices',
    severity: 'warn',
    fixable: false,
    docs: {
      recommended: false,
    },
  },
  create(context) {
    const options = (context.options[0] as StepsCountOptions) ?? {};
    const maxSteps = options.max ?? 20;

    return {
      SkillFile(skillFile) {
        const workflowSection = skillFile.sections.find(
          (s: { type: string }) => s.type.toLowerCase() === 'workflow'
        );

        if (!workflowSection) {
          return;
        }

        const content = workflowSection.content;
        const stepMatches = content.match(/^###\s+/gm);
        const stepCount = stepMatches?.length ?? 0;

        if (stepCount > maxSteps) {
          context.report({
            message: `Workflow has ${stepCount} steps, which exceeds the recommended maximum of ${maxSteps}`,
            line: workflowSection.lineStart,
            column: 1,
          });
        }
      },
    };
  },
};

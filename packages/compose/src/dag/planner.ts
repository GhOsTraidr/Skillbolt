import type { LLMAdapter } from '@skillbolt/core';
import { extractJSON } from '@skillbolt/core';

import { buildPlannerPrompt } from './prompts.js';
import { SkillType } from './types.js';

export interface PlannerResult {
  plans: Array<{ name: string; description: string; nodes: Record<string, unknown>[] }>;
  error?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const formatSkillsInfo = (
  skills: Array<{ name: string; description: string; content: string }>
): string =>
  skills
    .map((skill) => {
      const description = skill.description || 'No description provided.';
      const content = skill.content ? `\n\nSKILL.md:\n${skill.content}` : '';
      return `### ${skill.name}\nDescription: ${description}${content}`;
    })
    .join('\n\n');

const buildSingleNodePlan = (task: string, nodeName: string): PlannerResult => ({
  plans: [
    {
      name: 'Single Node Plan',
      description: 'Direct execution with a single node.',
      nodes: [
        {
          id: nodeName,
          name: nodeName,
          type: SkillType.PRIMARY,
          depends_on: [],
          purpose: task,
          outputs_summary: 'Produce the required task outputs.',
          downstream_hint: 'Final outputs should satisfy the task requirements.',
          usage_hints: {},
        },
      ],
    },
  ],
});

export async function generatePlans(options: {
  task: string;
  skills: Array<{ name: string; description: string; content: string }>;
  llm: LLMAdapter;
  context?: string;
}): Promise<PlannerResult> {
  const { task, skills, llm, context } = options;

  if (skills.length === 0) {
    return buildSingleNodePlan(task, 'ClaudeDirect');
  }

  if (skills.length === 1) {
    const skill = skills[0];
    if (!skill) {
      return buildSingleNodePlan(task, 'ClaudeDirect');
    }
    return buildSingleNodePlan(task, skill.name);
  }

  const skillsInfo = formatSkillsInfo(skills);
  const prompt = buildPlannerPrompt(task, skillsInfo, context);

  let response: string;
  try {
    response = await llm.complete([{ role: 'user', content: prompt }]);
  } catch (error) {
    return {
      plans: [],
      error: `Planner request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = extractJSON(response);
  } catch (error) {
    return {
      plans: [],
      error: `Failed to parse planner response JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.plans)) {
    return { plans: [], error: 'Planner response missing "plans" array' };
  }

  const plans = parsed.plans
    .filter((plan): plan is Record<string, unknown> => isRecord(plan))
    .map((plan, index) => {
      const name = typeof plan.name === 'string' ? plan.name : `Plan ${index + 1}`;
      const description = typeof plan.description === 'string' ? plan.description : '';
      const nodes = Array.isArray(plan.nodes)
        ? plan.nodes.filter((node): node is Record<string, unknown> => isRecord(node))
        : [];
      return { name, description, nodes };
    });

  return { plans };
}

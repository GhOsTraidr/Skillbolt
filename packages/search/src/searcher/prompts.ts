import type { LLMMessage } from '@skillbolt/core';

const MAX_SKILL_DESCRIPTION = 150;
const MAX_CONTENT_PREVIEW = 5000;

function truncateText(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  }
  if (limit <= 3) {
    return text.slice(0, limit);
  }
  return `${text.slice(0, limit - 3)}...`;
}

export function buildNodeSelectionPrompt(
  query: string,
  children: Array<{ id: string; name: string; description: string; skillCount: number }>
): LLMMessage[] {
  const options = children
    .map(
      (child) => `- ${child.id}: ${child.name} (${child.skillCount} skills)\n  ${child.description}`
    )
    .join('\n');

  const exampleIds = children.slice(0, 2).map((child) => child.id);
  const example = JSON.stringify(exampleIds);

  const content = `User task: ${query}

Select the relevant categories for this task from the options below:

${options}

## Selection Principles
- Select all categories that might be needed for the task
- Consider what the user ultimately wants to achieve
- If uncertain, select more rather than fewer

Output format (JSON array of selected IDs only):
${example}`;

  return [{ role: 'user', content }];
}

export function buildSkillSelectionPrompt(
  query: string,
  skills: Array<{ id: string; description: string }>
): LLMMessage[] {
  const options = skills
    .map((skill) => `- ${skill.id}: ${truncateText(skill.description, MAX_SKILL_DESCRIPTION)}`)
    .join('\n');

  const content = `User task: ${query}

Select the skills needed to complete this task:

${options}

## Selection Principles
- Select all skills that could help complete the task
- Consider skill combinations for complex tasks
- Prefer skills that directly address the user's intent

Output format (JSON array of skill IDs only):
["skill_id_1", "skill_id_2"]`;

  return [{ role: 'user', content }];
}

export function buildSkillPrunePrompt(
  query: string,
  skills: Array<{ id: string; name: string; description: string; content: string }>
): LLMMessage[] {
  const skillList = skills
    .map((skill) => {
      const preview = truncateText(skill.content, MAX_CONTENT_PREVIEW);
      return `- ${skill.id}: ${skill.name}\n  Description: ${skill.description}\n  Content Preview: ${preview}`;
    })
    .join('\n');

  const content = `User task: ${query}

## Skills to Evaluate
${skillList}

## Your Task
Filter, deduplicate, and RANK skills by relevance for the user's task.

## Rules
1. **Deduplicate**: If multiple skills have overlapping functionality, keep only the BEST one
2. **Keep generously**: Retain skills that could potentially help with ANY aspect of the task
   - Keep skills that create useful assets or materials (images, documents, presentations, etc.)
   - Keep skills that support the workflow: preparation → creation → delivery
   - Only remove skills that are CLEARLY unrelated and would confuse the user
3. Each skill ID can only appear ONCE
4. **CRITICAL: Order selected_skills by relevance (most relevant FIRST)**

## Output Format (JSON only)
{
  "selected_skills": [
    {"id": "most_relevant_skill", "reason": "Why this skill is most relevant"},
    {"id": "second_most_relevant", "reason": "Why this skill helps"}
  ],
  "eliminated": [
    {"id": "skill_x", "reason": "Duplicate of X / Clearly unrelated"}
  ]
}`;

  return [{ role: 'user', content }];
}

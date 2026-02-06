import type { LLMMessage } from '@skillbolt/core';
import type { RootCategory } from '../types.js';

type PromptSkill = { id: string; name: string; description: string };

const SYSTEM_PROMPT = 'You are a skill taxonomy expert.';

function formatSkills(skills: PromptSkill[]): string {
  return skills
    .map((skill, index) => `${index + 1}. ${skill.id}: ${skill.name} - ${skill.description}`)
    .join('\n');
}

function formatCategories(categories: RootCategory[]): string {
  return categories
    .map((category) => `- ${category.id}: ${category.name}\n  ${category.description}`)
    .join('\n');
}

export function buildCategoryAssignmentPrompt(
  skills: PromptSkill[],
  categories: RootCategory[]
): LLMMessage[] {
  const skillsList = formatSkills(skills);
  const categoriesList = formatCategories(categories);
  const userPrompt = `You are assigning ${skills.length} skills to predefined categories.

## Fixed Categories
${categoriesList}

## Skills to Assign
${skillsList}

## Assignment Rules
1. CRITICAL: Every skill MUST be assigned to exactly one category
2. DO NOT create new categories
3. Choose the category that best matches each skill's primary capability domain
4. For each category that has assigned skills, write a description (2-3 sentences)

## Output Format (JSON only)
{
  "assignments": {
    "category-id": {
      "skill_ids": ["skill_id_1", "skill_id_2"],
      "description": "2-3 sentences describing this category"
    }
  }
}`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
}

export function buildRecursiveSplitPrompt(
  skills: PromptSkill[],
  context: { parentName: string; parentDescription: string; depth: number },
  minGroups: number,
  maxGroups: number
): LLMMessage[] {
  const skillsList = formatSkills(skills);
  const contextSection = `## Context
Parent: ${context.parentName}
Description: ${context.parentDescription}
Depth: ${context.depth}`;
  const userPrompt = `You are organizing ${skills.length} skills into sub-categories.

${contextSection}

## Skills to Organize
${skillsList}

## Grouping Rules
1. Group by capability domain, not technical implementation
2. CRITICAL: Every skill MUST be assigned to exactly one group
3. Each group should have at least 2 skills
4. Use lowercase-with-hyphens for group IDs
5. Write detailed descriptions

## Number of Groups
Target: ${minGroups}-${maxGroups} groups.

## Output Format (JSON only)
{
  "groups": {
    "group-id": {
      "name": "Group Name",
      "description": "2-3 sentences",
      "skill_ids": ["skill1", "skill2"]
    }
  }
}`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
}

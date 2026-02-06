import { extractJSON, TreeBuildError } from '@skillbolt/core';
import type { LLMAdapter, LLMOptions } from '@skillbolt/core';
import type { RootCategory, TreeConfig, TreeSkill } from '../types.js';
import { buildCategoryAssignmentPrompt, buildRecursiveSplitPrompt } from './prompts.js';

type AssignmentEntry = { skill_ids?: unknown; description?: unknown };
type AssignmentMap = Record<string, AssignmentEntry>;
type GroupEntry = { name?: unknown; description?: unknown; skill_ids?: unknown };
type GroupMap = Record<string, GroupEntry>;

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeAssignments(raw: unknown): AssignmentMap {
  const value = typeof raw === 'string' ? extractJSON<unknown>(raw) : raw;
  const record = toRecord(value);
  const assignments = record ? toRecord(record.assignments) : null;
  return (assignments ?? {}) as AssignmentMap;
}

function normalizeGroups(raw: unknown): GroupMap {
  const value = typeof raw === 'string' ? extractJSON<unknown>(raw) : raw;
  const record = toRecord(value);
  const groups = record ? toRecord(record.groups) : null;
  return (groups ?? {}) as GroupMap;
}

function selectLargestGroupId(groups: Array<{ id: string; skills: TreeSkill[] }>): string | null {
  if (groups.length === 0) return null;
  return groups.reduce((largest, group) =>
    group.skills.length > largest.skills.length ? group : largest
  ).id;
}

function selectLargestCategoryId(categories: Map<string, { skills: TreeSkill[] }>): string | null {
  let selected: string | null = null;
  let maxSize = -1;
  for (const [id, entry] of categories) {
    if (entry.skills.length > maxSize) {
      selected = id;
      maxSize = entry.skills.length;
    }
  }
  return selected;
}

export async function assignToRootCategories(
  skills: TreeSkill[],
  categories: RootCategory[],
  llm: LLMAdapter,
  options?: LLMOptions
): Promise<Map<string, { skills: TreeSkill[]; description: string }>> {
  const messages = buildCategoryAssignmentPrompt(skills, categories);
  let response: unknown;

  try {
    response = await llm.completeJSON<unknown>(messages, options);
  } catch (error) {
    throw new TreeBuildError(`Failed to assign skills to root categories: ${error}`, undefined, {
      cause: error,
    });
  }

  const assignments = normalizeAssignments(response);
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
  const assignedIds = new Set<string>();
  const results = new Map<string, { skills: TreeSkill[]; description: string }>();

  for (const category of categories) {
    const entry = assignments[category.id];
    const skillIds = toStringArray(entry?.skill_ids);
    const categorySkills = skillIds
      .map((id) => skillsById.get(id))
      .filter((skill): skill is TreeSkill => Boolean(skill));

    if (categorySkills.length === 0) continue;

    for (const skill of categorySkills) {
      assignedIds.add(skill.id);
    }

    const description =
      typeof entry?.description === 'string' && entry.description.trim().length > 0
        ? entry.description
        : category.description;

    results.set(category.id, { skills: categorySkills, description });
  }

  const unassigned = skills.filter((skill) => !assignedIds.has(skill.id));
  if (unassigned.length > 0) {
    let targetId = selectLargestCategoryId(results);
    if (!targetId && categories.length > 0) {
      targetId = categories[0].id;
      if (!results.has(targetId)) {
        results.set(targetId, {
          skills: [],
          description: categories[0].description,
        });
      }
    }

    if (targetId) {
      const entry = results.get(targetId);
      if (entry) entry.skills.push(...unassigned);
    }
  }

  return results;
}

export async function splitNodeIntoGroups(
  skills: TreeSkill[],
  context: { parentName: string; parentDescription: string; depth: number },
  config: TreeConfig,
  llm: LLMAdapter,
  options?: LLMOptions
): Promise<Array<{ id: string; name: string; description: string; skills: TreeSkill[] }>> {
  const minGroups = 2;
  const maxGroups = config.branchingFactor;
  const messages = buildRecursiveSplitPrompt(skills, context, minGroups, maxGroups);
  let response: unknown;

  try {
    response = await llm.completeJSON<unknown>(messages, options);
  } catch {
    return [
      {
        id: 'all-skills',
        name: context.parentName,
        description: context.parentDescription,
        skills: [...skills],
      },
    ];
  }

  const groupsRecord = normalizeGroups(response);
  const groupEntries = Object.entries(groupsRecord);
  if (groupEntries.length === 0) {
    return [
      {
        id: 'all-skills',
        name: context.parentName,
        description: context.parentDescription,
        skills: [...skills],
      },
    ];
  }

  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
  const assignedIds = new Set<string>();
  const groups = groupEntries.map(([groupId, entry]) => {
    const skillIds = toStringArray(entry?.skill_ids);
    const groupSkills: TreeSkill[] = [];
    for (const id of skillIds) {
      const skill = skillsById.get(id);
      if (!skill || assignedIds.has(skill.id)) continue;
      assignedIds.add(skill.id);
      groupSkills.push(skill);
    }

    const name = typeof entry?.name === 'string' ? entry.name : groupId;
    const description = typeof entry?.description === 'string' ? entry.description : '';

    return { id: groupId, name, description, skills: groupSkills };
  });

  const unassigned = skills.filter((skill) => !assignedIds.has(skill.id));
  if (unassigned.length > 0) {
    const targetId = selectLargestGroupId(groups);
    if (targetId) {
      const target = groups.find((group) => group.id === targetId);
      if (target) target.skills.push(...unassigned);
    }
  }

  return groups;
}

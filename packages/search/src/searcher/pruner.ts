import type { LLMAdapter } from '@skillbolt/core';
import type { TreeSkill } from '@skillbolt/tree';
import type { SearchConfig, SelectedSkill } from '../types.js';
import { buildSkillPrunePrompt } from './prompts.js';
import { parsePruneResponse } from './parser.js';

function toSelectedSkill(skill: TreeSkill, reason: string): SelectedSkill {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    path: skill.path,
    skillPath: skill.skillPath,
    reason,
    githubUrl: skill.githubUrl,
    stars: skill.stars,
    isOfficial: skill.isOfficial,
    author: skill.author,
  };
}

export async function pruneSkills(
  query: string,
  skills: TreeSkill[],
  llm: LLMAdapter,
  config?: SearchConfig
): Promise<SelectedSkill[]> {
  const prompt = buildSkillPrunePrompt(
    query,
    skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      content: skill.content,
    }))
  );

  const response = await llm.complete(prompt, {
    model: config?.model,
    temperature: config?.temperature,
    timeout: config ? config.timeout * 1000 : undefined,
    caching: config?.caching,
  });

  const validIds = skills.map((skill) => skill.id);
  const parsed = parsePruneResponse(response, validIds);

  if (parsed.selected.length === 0 && parsed.eliminated.length === 0) {
    return skills.map((skill) => toSelectedSkill(skill, 'Included (pruning failed)'));
  }

  const skillMap = new Map<string, TreeSkill>();
  for (const skill of skills) {
    skillMap.set(skill.id, skill);
  }

  const selected: SelectedSkill[] = [];
  for (const item of parsed.selected) {
    const skill = skillMap.get(item.id);
    if (!skill) {
      continue;
    }
    selected.push(toSelectedSkill(skill, item.reason || 'Selected by pruning'));
  }

  return selected;
}

import type { ListOptions, InstalledSkill } from '../types/registry.js';
import { MetadataManager } from '../storage/metadata.js';

export interface ListResult {
  skills: InstalledSkill[];
  total: number;
}

export async function listSkills(options: ListOptions = {}): Promise<ListResult> {
  const { format: _format = 'table', filter } = options;

  const metadata = new MetadataManager();
  let skills = await metadata.listSkills();

  if (filter) {
    const pattern = new RegExp(filter, 'i');
    skills = skills.filter((skill) => pattern.test(skill.name));
  }

  return {
    skills,
    total: skills.length,
  };
}

export function formatSkillList(
  skills: InstalledSkill[],
  format: 'table' | 'json' = 'table'
): string {
  if (format === 'json') {
    return JSON.stringify(skills, null, 2);
  }

  if (skills.length === 0) {
    return 'No skills installed.';
  }

  const lines: string[] = [];
  const header = 'NAME                                     VERSION   SOURCE              MODE';
  const separator = '-'.repeat(header.length);

  lines.push(header);
  lines.push(separator);

  for (const skill of skills) {
    const name = skill.name.padEnd(40);
    const version = skill.version.padEnd(9);
    const source = formatSource(skill).padEnd(19);
    const mode = skill.mode;

    lines.push(`${name} ${version} ${source} ${mode}`);
  }

  return lines.join('\n');
}

function formatSource(skill: InstalledSkill): string {
  switch (skill.source.type) {
    case 'local':
      return 'local';
    case 'github':
      return `github:${skill.source.repo}`.slice(0, 19);
    case 'registry':
      return 'registry';
  }
}

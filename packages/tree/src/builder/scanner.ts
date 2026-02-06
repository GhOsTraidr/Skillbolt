import { parseSkillString, slugify } from '@skillbolt/core';
import type { TreeSkill } from '../types.js';
import fs from 'node:fs/promises';
import path from 'node:path';

async function findSkillFile(skillDir: string): Promise<string | null> {
  const files = await fs.readdir(skillDir);
  const match = files.find((file) => file.toLowerCase() === 'skill.md');
  return match ? path.resolve(skillDir, match) : null;
}

export async function scanSkillDirectory(dir: string): Promise<TreeSkill[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const skills: TreeSkill[] = [];

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const skillDir = path.join(dir, entry.name);
        const skillFile = await findSkillFile(skillDir);
        if (!skillFile) return;

        const content = await fs.readFile(skillFile, 'utf8');
        const parsed = parseSkillString(content);
        const manifest = parsed.manifest ?? {};
        const name = typeof manifest.name === 'string' ? manifest.name : entry.name;
        const description = typeof manifest.description === 'string' ? manifest.description : '';

        skills.push({
          id: slugify(entry.name),
          name,
          description,
          path: '',
          skillPath: skillFile,
          content: content.slice(0, 5000),
        });
      })
  );

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

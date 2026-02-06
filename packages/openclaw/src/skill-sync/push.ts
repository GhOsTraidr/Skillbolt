import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expandTilde } from '@skillbolt/core';
import { skillKitToOpenClaw } from '../converter/parser.js';
import { resolveOpenClawConfig } from '../config.js';

export interface PushOptions {
  skills?: string[];
  sourceDir?: string;
  targetDir?: string;
  convert?: boolean;
  overwrite?: boolean;
  dryRun?: boolean;
}

export interface PushResult {
  pushed: string[];
  skipped: string[];
  converted: string[];
  errors: Array<{ skill: string; error: string }>;
}

export async function pushSkills(options: PushOptions = {}): Promise<PushResult> {
  const config = resolveOpenClawConfig();
  const sourceDir = options.sourceDir ?? '.claude/skills';
  const targetDir = expandTilde(options.targetDir ?? config.skillsDir);
  const convert = options.convert ?? true;
  const overwrite = options.overwrite ?? false;
  const dryRun = options.dryRun ?? false;

  const result: PushResult = { pushed: [], skipped: [], converted: [], errors: [] };

  if (!existsSync(sourceDir)) {
    result.errors.push({ skill: '*', error: `Source directory not found: ${sourceDir}` });
    return result;
  }

  const entries = readdirSync(sourceDir, { withFileTypes: true });
  const skillDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const skillFilter = options.skills && options.skills.length > 0 ? options.skills : null;

  for (const skillName of skillDirs) {
    if (skillFilter && !skillFilter.includes(skillName)) continue;

    try {
      const skillMdPath = join(sourceDir, skillName, 'SKILL.md');
      if (!existsSync(skillMdPath)) {
        result.errors.push({ skill: skillName, error: 'No SKILL.md found' });
        continue;
      }

      const targetSkillDir = join(targetDir, skillName);
      const targetSkillMd = join(targetSkillDir, 'SKILL.md');

      if (existsSync(targetSkillMd) && !overwrite) {
        result.skipped.push(skillName);
        continue;
      }

      if (!dryRun) {
        if (!existsSync(targetSkillDir)) {
          mkdirSync(targetSkillDir, { recursive: true });
        }

        const content = readFileSync(skillMdPath, 'utf8');

        if (convert) {
          const converted = skillKitToOpenClaw({
            path: skillMdPath,
            manifest: { name: skillName, description: '' },
            content,
            sections: [],
          });
          writeFileSync(targetSkillMd, converted, 'utf8');
          result.converted.push(skillName);
        } else {
          writeFileSync(targetSkillMd, content, 'utf8');
        }
      }

      result.pushed.push(skillName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push({ skill: skillName, error: message });
    }
  }

  return result;
}

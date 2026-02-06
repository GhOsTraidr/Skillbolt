import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expandTilde } from '@skillbolt/core';
import { openclawToSkillbolt } from '../converter/parser.js';
import { resolveOpenClawConfig } from '../config.js';

export interface PullOptions {
  skills?: string[];
  sourceDir?: string;
  targetDir?: string;
  convert?: boolean;
  overwrite?: boolean;
  dryRun?: boolean;
}

export interface PullResult {
  pulled: string[];
  skipped: string[];
  converted: string[];
  errors: Array<{ skill: string; error: string }>;
}

export async function pullSkills(options: PullOptions = {}): Promise<PullResult> {
  const config = resolveOpenClawConfig();
  const sourceDir = expandTilde(options.sourceDir ?? config.skillsDir);
  const targetDir = options.targetDir ?? '.claude/skills';
  const convert = options.convert ?? true;
  const overwrite = options.overwrite ?? false;
  const dryRun = options.dryRun ?? false;

  const result: PullResult = { pulled: [], skipped: [], converted: [], errors: [] };

  if (!existsSync(sourceDir)) {
    result.errors.push({ skill: '*', error: `OpenClaw skills directory not found: ${sourceDir}` });
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
          const skillFile = openclawToSkillbolt(content, skillMdPath);
          writeFileSync(targetSkillMd, skillFile.content, 'utf8');
          result.converted.push(skillName);
        } else {
          writeFileSync(targetSkillMd, content, 'utf8');
        }
      }

      result.pulled.push(skillName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push({ skill: skillName, error: message });
    }
  }

  return result;
}

import { join } from 'node:path';
import { readdir } from 'node:fs/promises';
import { parseSkillFile, exists, isDirectory } from '@skillbolt/core';
import type { SkillManifest } from '@skillbolt/core';

export interface ValidationResult {
  valid: boolean;
  skillPath: string | null;
  manifest: SkillManifest | null;
  error?: string;
}

const SKILL_FILE_NAMES = ['SKILL.md', 'skill.md', 'Skill.md'];

export async function validateSkillDirectory(dirPath: string): Promise<ValidationResult> {
  if (!(await exists(dirPath))) {
    return {
      valid: false,
      skillPath: null,
      manifest: null,
      error: `Directory does not exist: ${dirPath}`,
    };
  }

  if (!(await isDirectory(dirPath))) {
    return {
      valid: false,
      skillPath: null,
      manifest: null,
      error: `Path is not a directory: ${dirPath}`,
    };
  }

  const skillPath = await findSkillFile(dirPath);
  if (!skillPath) {
    return {
      valid: false,
      skillPath: null,
      manifest: null,
      error: `No SKILL.md found in: ${dirPath}`,
    };
  }

  try {
    const skillFile = await parseSkillFile(skillPath, { validateManifest: true });
    return {
      valid: true,
      skillPath,
      manifest: skillFile.manifest,
    };
  } catch (error) {
    return {
      valid: false,
      skillPath,
      manifest: null,
      error: `Invalid SKILL.md: ${(error as Error).message}`,
    };
  }
}

async function findSkillFile(dirPath: string): Promise<string | null> {
  const entries = await readdir(dirPath);

  for (const name of SKILL_FILE_NAMES) {
    if (entries.includes(name)) {
      return join(dirPath, name);
    }
  }

  return null;
}

export async function getSkillName(dirPath: string): Promise<string | null> {
  const result = await validateSkillDirectory(dirPath);
  if (!result.valid || !result.manifest) {
    return null;
  }
  return result.manifest.name;
}

export async function getSkillManifest(dirPath: string): Promise<SkillManifest | null> {
  const result = await validateSkillDirectory(dirPath);
  if (!result.valid || !result.manifest) {
    return null;
  }
  return result.manifest;
}

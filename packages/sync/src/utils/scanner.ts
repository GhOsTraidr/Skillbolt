import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { expandTilde, exists } from '@skillbolt/core';
import micromatch from 'micromatch';

import type { LocalSkill } from '../types/sync.js';
import { computeHashFromString } from './hash.js';

export interface ScanOptions {
  include?: string[];
  exclude?: string[];
}

const DEFAULT_INCLUDE = ['**/*.md'];
const DEFAULT_EXCLUDE = ['**/node_modules/**', '**/.git/**', '**/.*'];

export async function scanLocalSkills(
  skillsDir: string,
  options: ScanOptions = {}
): Promise<LocalSkill[]> {
  const resolvedDir = expandTilde(skillsDir);

  if (!(await exists(resolvedDir))) {
    return [];
  }

  const includePatterns = options.include ?? DEFAULT_INCLUDE;
  const excludePatterns = options.exclude ?? DEFAULT_EXCLUDE;

  const files = await walkDirectory(resolvedDir);
  const skills: LocalSkill[] = [];

  for (const fullPath of files) {
    const relativePath = relative(resolvedDir, fullPath);

    const included = micromatch.isMatch(relativePath, includePatterns);
    const excluded = micromatch.isMatch(relativePath, excludePatterns);

    if (included && !excluded) {
      const content = await readFile(fullPath, 'utf8');
      const stats = await stat(fullPath);
      const name = extractSkillName(relativePath, content);

      skills.push({
        name,
        relativePath,
        fullPath,
        content,
        hash: computeHashFromString(content),
        modifiedAt: stats.mtime,
        size: stats.size,
      });
    }
  }

  return skills;
}

async function walkDirectory(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await walkDirectory(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractSkillName(relativePath: string, content: string): string {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const nameMatch = frontmatterMatch[1]?.match(/^name:\s*["']?(.+?)["']?\s*$/m);
    if (nameMatch?.[1]) {
      return nameMatch[1];
    }
  }

  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match?.[1]) {
    return h1Match[1].trim();
  }

  return relativePath.replace(/\.md$/, '').replace(/\//g, '-');
}

export function filterSkills<T extends { name: string; relativePath: string }>(
  skills: T[],
  include?: string[],
  exclude?: string[]
): T[] {
  if (!include && !exclude) {
    return skills;
  }

  return skills.filter((skill) => {
    const matchPath = skill.relativePath;
    const matchName = skill.name;

    if (include && include.length > 0) {
      const pathMatch = micromatch.isMatch(matchPath, include);
      const nameMatch = micromatch.isMatch(matchName, include);
      if (!pathMatch && !nameMatch) {
        return false;
      }
    }

    if (exclude && exclude.length > 0) {
      const pathExcluded = micromatch.isMatch(matchPath, exclude);
      const nameExcluded = micromatch.isMatch(matchName, exclude);
      if (pathExcluded || nameExcluded) {
        return false;
      }
    }

    return true;
  });
}

import { readFile } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';

import type { SkillFile, SkillManifest, SkillSection } from '../types/skill.js';
import { ParseError, FileError } from '../errors/index.js';
import { parseFrontmatter, validateManifest } from './frontmatter.js';
import { parseSections } from './markdown.js';

export interface ParseSkillOptions {
  validateManifest?: boolean;
}

export async function parseSkillFile(
  pathOrContent: string,
  options: ParseSkillOptions = {}
): Promise<SkillFile> {
  const { validateManifest: shouldValidate = true } = options;

  let raw: string;
  let filePath: string;

  const isFilePath =
    pathOrContent.includes('\n') === false &&
    (pathOrContent.endsWith('.md') || pathOrContent.includes('/'));

  if (isFilePath) {
    filePath = isAbsolute(pathOrContent) ? pathOrContent : resolve(process.cwd(), pathOrContent);
    try {
      raw = await readFile(filePath, 'utf-8');
    } catch (error) {
      throw new FileError(`Failed to read file: ${filePath}`, {
        file: filePath,
        cause: error as Error,
      });
    }
  } else {
    raw = pathOrContent;
    filePath = 'inline';
  }

  const { data, content, isEmpty } = parseFrontmatter(raw);

  let manifest: SkillManifest;
  if (shouldValidate) {
    if (isEmpty) {
      throw new ParseError('SKILL.md must have a frontmatter section', { file: filePath });
    }
    manifest = validateManifest(data);
  } else {
    manifest = {
      name: data.name ?? 'Unnamed Skill',
      description: data.description ?? '',
      ...data,
    };
  }

  const sections = parseSections(content);

  return {
    path: filePath,
    manifest,
    content: raw,
    sections,
  };
}

export function parseSkillString(content: string, options: ParseSkillOptions = {}): SkillFile {
  const { validateManifest: shouldValidate = true } = options;

  const { data, content: bodyContent, isEmpty } = parseFrontmatter(content);

  let manifest: SkillManifest;
  if (shouldValidate) {
    if (isEmpty) {
      throw new ParseError('SKILL.md must have a frontmatter section');
    }
    manifest = validateManifest(data);
  } else {
    manifest = {
      name: data.name ?? 'Unnamed Skill',
      description: data.description ?? '',
      ...data,
    };
  }

  const sections = parseSections(bodyContent);

  return {
    path: 'inline',
    manifest,
    content,
    sections,
  };
}

export function findSection(sections: SkillSection[], type: string): SkillSection | undefined {
  return sections.find((s) => s.type === type);
}

export function hasRequiredSections(sections: SkillSection[]): boolean {
  const hasOverview = sections.some((s) => s.type === 'overview');
  const hasWorkflow = sections.some((s) => s.type === 'workflow');
  return hasOverview && hasWorkflow;
}

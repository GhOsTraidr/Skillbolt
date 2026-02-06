import matter from 'gray-matter';

import type { SkillManifest } from '../types/skill.js';
import { ParseError } from '../errors/index.js';

export interface FrontmatterResult {
  data: Partial<SkillManifest>;
  content: string;
  isEmpty: boolean;
}

export function parseFrontmatter(raw: string): FrontmatterResult {
  try {
    const result = matter(raw);
    const isEmpty = Object.keys(result.data).length === 0;
    return {
      data: result.data as Partial<SkillManifest>,
      content: result.content,
      isEmpty,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ParseError(`Failed to parse frontmatter: ${message}`);
  }
}

export function validateManifest(data: Partial<SkillManifest>): SkillManifest {
  if (!data.name || typeof data.name !== 'string') {
    throw new ParseError('Manifest must have a "name" field');
  }

  if (!data.description || typeof data.description !== 'string') {
    throw new ParseError('Manifest must have a "description" field');
  }

  return {
    name: data.name,
    description: data.description,
    version: data.version,
    author: data.author,
    triggers: data.triggers,
    platform: data.platform,
    tags: data.tags,
    repository: data.repository,
  };
}

export function parseManifest(raw: string): SkillManifest {
  const { data, isEmpty } = parseFrontmatter(raw);

  if (isEmpty) {
    throw new ParseError('SKILL.md must have a frontmatter section');
  }

  return validateManifest(data);
}

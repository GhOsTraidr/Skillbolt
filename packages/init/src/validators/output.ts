import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { TemplateType } from '../types.js';
import { getTemplateFiles } from '../templates/loader.js';

export interface OutputValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function validateSkillMdContent(
  skillMdPath: string
): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const content = await readFile(skillMdPath, 'utf-8');

    if (!content.startsWith('---')) {
      errors.push('SKILL.md must start with frontmatter (---)');
      return { errors, warnings };
    }

    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      errors.push('SKILL.md frontmatter is not properly closed');
      return { errors, warnings };
    }

    const frontmatter = content.slice(3, frontmatterEnd);

    if (!frontmatter.includes('name:')) {
      errors.push('SKILL.md frontmatter is missing required field: name');
    }

    if (!frontmatter.includes('description:')) {
      errors.push('SKILL.md frontmatter is missing required field: description');
    }

    const bodyContent = content.slice(frontmatterEnd + 3).trim();
    if (!bodyContent.startsWith('#')) {
      warnings.push('SKILL.md should have a main heading (# Title) after frontmatter');
    }

    if (!content.includes('## ')) {
      warnings.push('SKILL.md should have section headings (## Section)');
    }
  } catch (err) {
    errors.push(`Failed to read SKILL.md: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return { errors, warnings };
}

export async function validateOutput(
  targetDir: string,
  template: TemplateType
): Promise<OutputValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const expectedFiles = getTemplateFiles(template);

  for (const file of expectedFiles) {
    const fullPath = join(targetDir, file);
    const exists = await fileExists(fullPath);
    if (!exists) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  const skillMdPath = join(targetDir, 'SKILL.md');
  if (await fileExists(skillMdPath)) {
    const skillValidation = await validateSkillMdContent(skillMdPath);
    errors.push(...skillValidation.errors);
    warnings.push(...skillValidation.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

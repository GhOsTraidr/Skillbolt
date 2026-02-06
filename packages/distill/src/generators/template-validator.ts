import type { Skill } from '../types/skill.js';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class TemplateValidator {
  validate(content: string, skill: Skill): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    this.validateFrontmatter(content, skill, errors, warnings);
    this.validateRequiredSections(content, errors);
    this.validateWritingStyle(content, warnings);
    this.validateLength(content, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateFrontmatter(
    content: string,
    skill: Skill,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!content.startsWith('---')) {
      errors.push({
        field: 'frontmatter',
        message: 'Missing YAML frontmatter',
        severity: 'error',
      });
      return;
    }

    if (!skill.metadata.description.toLowerCase().includes('this skill')) {
      warnings.push({
        field: 'description',
        message: 'Description should start with "This skill should be used when..."',
        severity: 'warning',
      });
    }

    if (!skill.metadata.description.includes('"')) {
      warnings.push({
        field: 'description',
        message: 'Description should include specific trigger phrases in quotes',
        severity: 'warning',
      });
    }
  }

  private validateRequiredSections(content: string, errors: ValidationError[]): void {
    const requiredSections = [
      { pattern: /^## Overview/m, name: 'Overview' },
      { pattern: /^## (When This Skill Applies|Triggers)/m, name: 'Triggers' },
      { pattern: /^## (Core Workflow|Steps)/m, name: 'Steps' },
    ];

    for (const section of requiredSections) {
      if (!section.pattern.test(content)) {
        errors.push({
          field: section.name,
          message: `Missing required section: ${section.name}`,
          severity: 'error',
        });
      }
    }
  }

  private validateWritingStyle(content: string, warnings: ValidationError[]): void {
    const secondPersonPatterns = [
      /\bYou should\b/gi,
      /\bYou need to\b/gi,
      /\bYou can\b/gi,
      /\bYou must\b/gi,
    ];

    for (const pattern of secondPersonPatterns) {
      if (pattern.test(content)) {
        warnings.push({
          field: 'style',
          message: `Avoid second person ("${pattern.source}"). Use imperative form instead.`,
          severity: 'warning',
        });
      }
    }
  }

  private validateLength(content: string, warnings: ValidationError[]): void {
    const wordCount = content.split(/\s+/).length;

    if (wordCount > 5000) {
      warnings.push({
        field: 'length',
        message: `SKILL.md is too long (${wordCount} words). Consider moving content to references/`,
        severity: 'warning',
      });
    }

    if (wordCount < 200) {
      warnings.push({
        field: 'length',
        message: `SKILL.md is very short (${wordCount} words). Consider adding more detail.`,
        severity: 'warning',
      });
    }
  }
}

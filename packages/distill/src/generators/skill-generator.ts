import { promises as fs } from 'fs';
import { join } from 'path';
import type { Skill } from '../types/skill.js';
import { FrontmatterBuilder } from './frontmatter-builder.js';
import { MarkdownRenderer } from './markdown-renderer.js';
import { DirectoryBuilder } from './directory-builder.js';
import { TemplateValidator, type ValidationResult } from './template-validator.js';

export interface GenerateOptions {
  outputDir: string;
  overwrite?: boolean;
  includeReferences?: boolean;
  includeExamples?: boolean;
}

export interface GenerateResult {
  skillPath: string;
  files: string[];
  validation: ValidationResult;
}

export class SkillGenerator {
  private frontmatterBuilder: FrontmatterBuilder;
  private markdownRenderer: MarkdownRenderer;
  private directoryBuilder: DirectoryBuilder;
  private validator: TemplateValidator;

  constructor() {
    this.frontmatterBuilder = new FrontmatterBuilder();
    this.markdownRenderer = new MarkdownRenderer();
    this.directoryBuilder = new DirectoryBuilder();
    this.validator = new TemplateValidator();
  }

  async generate(skill: Skill, options: GenerateOptions): Promise<GenerateResult> {
    const { outputDir, overwrite = false, includeReferences = true } = options;

    const skillDirName = this.toKebabCase(skill.metadata.name);
    const skillDir = join(outputDir, skillDirName);

    if (!overwrite && (await this.exists(skillDir))) {
      throw new Error(`Skill directory already exists: ${skillDir}`);
    }

    await this.directoryBuilder.create(skillDir, {
      includeReferences,
      includeExamples: options.includeExamples ?? false,
    });

    const content = this.renderSkill(skill);
    const validation = this.validator.validate(content, skill);

    const skillPath = join(skillDir, 'SKILL.md');
    await fs.writeFile(skillPath, content, 'utf-8');

    const files = [skillPath];

    if (includeReferences && skill.references?.length) {
      const refPath = await this.generateReferences(skillDir, skill);
      files.push(refPath);
    }

    return {
      skillPath,
      files,
      validation,
    };
  }

  renderSkill(skill: Skill): string {
    const parts: string[] = [];

    parts.push(this.frontmatterBuilder.build(skill.metadata));
    parts.push(this.markdownRenderer.renderTitle(skill.metadata.name));
    parts.push(this.markdownRenderer.renderOverview(skill.overview));
    parts.push(this.markdownRenderer.renderTriggers(skill.triggers));

    if (skill.prerequisites.length) {
      parts.push(this.markdownRenderer.renderPrerequisites(skill.prerequisites));
    }

    parts.push(this.markdownRenderer.renderSteps(skill.steps));

    if (skill.parameters.length) {
      parts.push(this.markdownRenderer.renderParameters(skill.parameters));
    }

    if (Object.keys(skill.errorHandling).length) {
      parts.push(this.markdownRenderer.renderErrorHandling(skill.errorHandling));
    }

    if (skill.examples.length) {
      parts.push(this.markdownRenderer.renderExamples(skill.examples));
    }

    if (skill.references?.length) {
      parts.push(this.markdownRenderer.renderReferences(skill.references));
    }

    if (skill.notes?.length) {
      parts.push(this.markdownRenderer.renderNotes(skill.notes));
    }

    return parts.join('\n\n');
  }

  private async generateReferences(skillDir: string, skill: Skill): Promise<string> {
    const refDir = join(skillDir, 'references');
    await fs.mkdir(refDir, { recursive: true });

    const patternsPath = join(refDir, 'patterns.md');
    const patternsContent = `# Patterns and Best Practices

This file contains detailed patterns extracted from the original conversation.

## Common Patterns

${skill.notes?.map((n) => `- ${n}`).join('\n') || 'No additional patterns documented.'}
`;

    await fs.writeFile(patternsPath, patternsContent, 'utf-8');
    return patternsPath;
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  private async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

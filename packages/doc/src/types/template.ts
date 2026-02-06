import type { SkillFile } from '@skillbolt/core';
import type { OutputFormat } from './output.js';
import type { TocItem } from './generator.js';

export interface TemplateContext {
  skill: TemplateSkillContext;
  sections: TemplateSectionsContext;
  config: TemplateConfigContext;
  variables: Record<string, unknown>;
  toc?: TocItem[];
}

export interface TemplateSkillContext {
  name: string;
  description: string;
  version: string;
  author?: string;
  triggers: string[];
  platforms: string[];
  tags: string[];
  repository?: string;
  sourcePath: string;
}

export interface TemplateSectionsContext {
  overview?: string;
  workflow?: string;
  parameters?: string;
  examples?: string;
  errorHandling?: string;
  all: TemplateSection[];
  custom: TemplateSection[];
}

export interface TemplateSection {
  type: string;
  title: string;
  content: string;
}

export interface TemplateConfigContext {
  format: OutputFormat;
  includeTableOfContents: boolean;
  includeTimestamp: boolean;
  timestamp: string;
}

export interface TemplateOptions {
  template: string;
  context: TemplateContext;
  helpers?: Record<string, HelperFunction>;
  partials?: Record<string, string>;
}

export type HelperFunction = (...args: unknown[]) => string;

export type CompiledTemplate = (context: TemplateContext) => string;

export interface TemplateLoaderOptions {
  templateDir?: string;
  useBuiltIn?: boolean;
  extension?: string;
}

export function createTemplateContext(
  skill: SkillFile,
  options: {
    format?: OutputFormat;
    includeToc?: boolean;
    includeTimestamp?: boolean;
    variables?: Record<string, unknown>;
    toc?: TocItem[];
  } = {}
): TemplateContext {
  const {
    format = 'markdown',
    includeToc = true,
    includeTimestamp = false,
    variables = {},
    toc,
  } = options;

  const manifest = skill.manifest;
  const sections = skill.sections;

  const sectionMap: Record<string, string> = {};
  const allSections: TemplateSection[] = [];
  const customSections: TemplateSection[] = [];

  for (const section of sections) {
    allSections.push({
      type: section.type,
      title: section.title,
      content: section.content,
    });

    if (section.type === 'overview') {
      sectionMap['overview'] = section.content;
    } else if (section.type === 'workflow') {
      sectionMap['workflow'] = section.content;
    } else if (section.type === 'parameters') {
      sectionMap['parameters'] = section.content;
    } else if (section.type === 'examples') {
      sectionMap['examples'] = section.content;
    } else if (section.type === 'errors') {
      sectionMap['errorHandling'] = section.content;
    } else if (section.type === 'custom') {
      customSections.push({
        type: section.type,
        title: section.title,
        content: section.content,
      });
    }
  }

  return {
    skill: {
      name: manifest.name,
      description: manifest.description,
      version: manifest.version ?? '1.0.0',
      author: manifest.author,
      triggers: manifest.triggers ?? [],
      platforms: manifest.platform ?? [],
      tags: manifest.tags ?? [],
      repository: manifest.repository,
      sourcePath: skill.path,
    },
    sections: {
      overview: sectionMap['overview'],
      workflow: sectionMap['workflow'],
      parameters: sectionMap['parameters'],
      examples: sectionMap['examples'],
      errorHandling: sectionMap['errorHandling'],
      all: allSections,
      custom: customSections,
    },
    config: {
      format,
      includeTableOfContents: includeToc,
      includeTimestamp,
      timestamp: new Date().toISOString(),
    },
    variables,
    toc,
  };
}

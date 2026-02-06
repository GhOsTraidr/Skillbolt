import type { SkillFile } from '@skillbolt/core';
import type { JsonOutputOptions, GeneratorMetadata } from '../types/index.js';

export interface JsonDocOutput {
  skill: {
    name: string;
    description: string;
    version: string;
    author?: string;
    triggers: string[];
    platforms: string[];
    tags: string[];
    repository?: string;
  };
  sections: {
    type: string;
    title: string;
    content: string;
  }[];
  metadata?: GeneratorMetadata;
  raw?: string;
}

export function toJson(skill: SkillFile, options: Partial<JsonOutputOptions> = {}): string {
  const {
    prettyPrint = true,
    indentSize = 2,
    includeRaw = false,
    includeMetadata = true,
  } = options;

  const output: JsonDocOutput = {
    skill: {
      name: skill.manifest.name,
      description: skill.manifest.description,
      version: skill.manifest.version ?? '1.0.0',
      author: skill.manifest.author,
      triggers: skill.manifest.triggers ?? [],
      platforms: skill.manifest.platform ?? [],
      tags: skill.manifest.tags ?? [],
      repository: skill.manifest.repository,
    },
    sections: skill.sections.map((s) => ({
      type: s.type,
      title: s.title,
      content: s.content,
    })),
  };

  if (includeMetadata) {
    output.metadata = {
      generatedAt: new Date(),
      sourceFile: skill.path,
      templateUsed: 'json',
      generatorVersion: '1.0.0',
    };
  }

  if (includeRaw) {
    output.raw = skill.content;
  }

  return prettyPrint ? JSON.stringify(output, null, indentSize) : JSON.stringify(output);
}

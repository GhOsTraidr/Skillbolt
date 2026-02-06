import { stringify } from 'yaml';
import type { SkillMetadata } from '../types/skill.js';

export class FrontmatterBuilder {
  build(metadata: SkillMetadata): string {
    const frontmatter: Record<string, string> = {
      name: metadata.name,
      description: metadata.description,
      version: metadata.version,
    };

    if (metadata.license) {
      frontmatter['license'] = metadata.license;
    }

    const yaml = stringify(frontmatter, {
      lineWidth: 0,
      defaultStringType: 'PLAIN',
    });

    return `---\n${yaml}---`;
  }

  validateDescription(description: string): boolean {
    const thirdPersonStart = description.toLowerCase().startsWith('this skill');
    const hasTriggerPhrases = description.includes('"') || description.includes("'");

    return thirdPersonStart && hasTriggerPhrases;
  }
}

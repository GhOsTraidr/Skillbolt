export interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  license?: string;
}

export interface SkillStep {
  title: string;
  description: string;
  substeps?: string[];
}

export interface SkillParameter {
  name: string;
  type: 'string' | 'boolean' | 'number';
  default?: unknown;
  description: string;
  required: boolean;
}

export interface Skill {
  metadata: SkillMetadata;
  overview: string;
  triggers: string[];
  prerequisites: string[];
  steps: SkillStep[];
  parameters: SkillParameter[];
  errorHandling: Record<string, string>;
  examples: string[];
  notes?: string[];
  references?: string[];
}

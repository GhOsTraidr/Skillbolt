export type TemplateType = 'minimal' | 'standard' | 'complete';

export type PlatformType = 'claude-code' | 'codex' | 'cursor' | 'all';

export interface InitOptions {
  directory: string;
  name?: string;
  description?: string;
  triggers?: string[];
  template?: TemplateType;
  platform?: PlatformType;
  interactive?: boolean;
  force?: boolean;
  author?: string;
}

export interface SkillMetadata {
  name: string;
  description: string;
  triggers: string[];
  template: TemplateType;
  platform: PlatformType;
  version: string;
  author?: string;
}

export interface GeneratedResult {
  directory: string;
  files: string[];
  metadata: SkillMetadata;
}

export interface TemplateContext {
  name: string;
  description: string;
  triggers: string[];
  platform: PlatformType;
  version: string;
  year: number;
  date: string;
  author?: string;
  kebabName: string;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export interface TemplateDefinition {
  type: TemplateType;
  description: string;
  directories: string[];
  files: TemplateFile[];
}

export const TEMPLATE_CHOICES = [
  { name: 'minimal  - Only SKILL.md', value: 'minimal' as const },
  { name: 'standard - SKILL.md + references/ (recommended)', value: 'standard' as const },
  { name: 'complete - Full structure with examples/, scripts/', value: 'complete' as const },
] as const;

export const PLATFORM_CHOICES = [
  { name: 'Claude Code', value: 'claude-code' as const },
  { name: 'Codex CLI', value: 'codex' as const },
  { name: 'Cursor', value: 'cursor' as const },
  { name: 'All (Universal)', value: 'all' as const },
] as const;

export const DEFAULTS = {
  template: 'standard' as TemplateType,
  platform: 'all' as PlatformType,
  version: '1.0.0',
  interactive: true,
  force: false,
} as const;

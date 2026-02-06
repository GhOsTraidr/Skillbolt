export type SkillPlatform =
  | 'claude-code'
  | 'codex'
  | 'cursor'
  | 'continue'
  | 'openclaw'
  | 'custom';

export type SkillSectionType =
  | 'overview'
  | 'workflow'
  | 'parameters'
  | 'examples'
  | 'errors'
  | 'custom';

export interface SkillManifest {
  name: string;
  description: string;
  version?: string;
  author?: string;
  triggers?: string[];
  platform?: SkillPlatform[];
  tags?: string[];
  repository?: string;
  /** GitHub repository URL */
  githubUrl?: string;
  /** GitHub star count */
  stars?: number;
  /** Official/verified skill flag */
  isOfficial?: boolean;
  /** Category in capability tree */
  category?: string;
  /** SKILL.md body content (truncated to 5000 chars for tree/search) */
  content?: string;
  /** Allowed tools from frontmatter */
  allowedTools?: string[];
}

export interface SkillSection {
  type: SkillSectionType;
  title: string;
  content: string;
  lineStart: number;
  lineEnd: number;
}

export interface SkillFile {
  path: string;
  manifest: SkillManifest;
  content: string;
  sections: SkillSection[];
}

export interface ParsedSkillResult {
  file: SkillFile;
  raw: string;
}

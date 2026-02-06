import type { LLMAdapter } from '@skillbolt/core';

export interface TreeConfig {
  /** Core parameter (5-12 recommended). Default: 8 */
  branchingFactor: number;

  /** Maximum tree depth. Default: 6 */
  maxDepth: number;

  /** Max skills before splitting a node. ~1.5x branchingFactor */
  readonly maxSkillsPerNode: number;

  /** Children <= this: expand all during search, else LLM select. ~0.7x branchingFactor */
  readonly expandThreshold: number;

  /** If only 1 child selected and skills <= this, stop recursion. ~1.7x branchingFactor */
  readonly earlyStopSkillCount: number;

  /** Immediate split if skills > this. ~1.3x maxSkillsPerNode */
  readonly lazySplitThreshold: number;

  /** Skills per batch in scalable build. ~6x branchingFactor */
  readonly classificationBatchSize: number;

  /** Sample size for structure discovery. ~12x branchingFactor */
  readonly structureSampleSize: number;
}

export interface TreeSkill {
  id: string;
  name: string;
  description: string;
  /** Path in tree, e.g., "content-creation/visual/design" */
  path: string;
  /** File system path to SKILL.md */
  skillPath: string;
  /** Body content of SKILL.md (truncated) */
  content: string;
  /** Reason this skill was selected (set during search) */
  selectionReason?: string;
  githubUrl?: string;
  stars?: number;
  isOfficial?: boolean;
  author?: string;
}

export interface TreeNodeData {
  id: string;
  name: string;
  description: string;
  depth: number;
  parentId: string | null;
  children: TreeNodeData[];
  skills: TreeSkill[];
}

export interface RootCategory {
  id: string;
  name: string;
  description: string;
}

export const DEFAULT_ROOT_CATEGORIES: RootCategory[] = [
  {
    id: 'content-creation',
    name: 'Content Creation',
    description:
      'Content authoring tools including documents, images, presentations, and copywriting.',
  },
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Data analysis, visualization, and transformation tools.',
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Developer tools including code generation, testing, and APIs.',
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Browser automation, workflows, and integrations.',
  },
  {
    id: 'domain-specific',
    name: 'Domain Specific',
    description:
      'Vertical domain tools for healthcare, finance, research, and other specialized fields.',
  },
];

export type TreeBuildPhase = 'scanning' | 'classifying' | 'splitting' | 'writing' | 'visualizing';

export interface TreeBuildProgress {
  phase: TreeBuildPhase;
  totalSkills: number;
  processedSkills: number;
  llmCalls: number;
  pendingNodes: number;
  currentNodeId?: string;
}

export interface TreeBuildResult {
  tree: TreeNodeData;
  totalSkills: number;
  totalNodes: number;
  maxDepth: number;
  llmCalls: number;
  duration: number;
  outputPath: string;
  htmlPath?: string;
}

export interface TreeBuilderOptions {
  skillsDir: string;
  outputPath: string;
  config?: TreeConfig;
  llm?: LLMAdapter;
  maxWorkers?: number;
  onProgress?: (progress: TreeBuildProgress) => void;
}

export interface TreeBuildOptions {
  verbose?: boolean;
  generateHtml?: boolean;
  groupName?: string;
}

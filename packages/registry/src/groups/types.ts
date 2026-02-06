export interface SkillGroup {
  id: string;
  name: string;
  description: string;
  skillsDir: string;
  treePath: string;
  isDefault?: boolean;
}

export const DEFAULT_SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'curated',
    name: 'Curated (Recommended)',
    description: 'Carefully curated skill set (~50 skills)',
    skillsDir: 'data/skill_seeds',
    treePath: 'data/trees/tree_curated.yaml',
    isDefault: true,
  },
  {
    id: 'top500',
    name: 'Top 500',
    description: 'Top 500 skills from the registry',
    skillsDir: 'data/skill_top500',
    treePath: 'data/trees/tree_top500.yaml',
  },
  {
    id: 'top1000',
    name: 'Top 1000',
    description: 'Top 1000 skills from the registry',
    skillsDir: 'data/skill_top1000',
    treePath: 'data/trees/tree_top1000.yaml',
  },
];

export const SKILL_GROUP_ALIASES: Record<string, string> = {
  default: 'curated',
};

import type { TreeConfig } from './types.js';

const DEFAULT_BRANCHING_FACTOR = 8;
const DEFAULT_MAX_DEPTH = 6;

export function createTreeConfig(overrides: Partial<TreeConfig> = {}): TreeConfig {
  const branchingFactor = overrides.branchingFactor ?? DEFAULT_BRANCHING_FACTOR;
  const maxDepth = overrides.maxDepth ?? DEFAULT_MAX_DEPTH;

  const maxSkillsPerNode = Math.round(branchingFactor * 1.5);
  const expandThreshold = Math.round(branchingFactor * 0.7);
  const earlyStopSkillCount = Math.round(branchingFactor * 1.7);
  const lazySplitThreshold = Math.round(branchingFactor * 1.5 * 1.3);
  const classificationBatchSize = Math.round(branchingFactor * 6);
  const structureSampleSize = Math.round(branchingFactor * 12);

  return {
    branchingFactor,
    maxDepth,
    maxSkillsPerNode,
    expandThreshold,
    earlyStopSkillCount,
    lazySplitThreshold,
    classificationBatchSize,
    structureSampleSize,
  };
}

export const DEFAULT_TREE_CONFIG = createTreeConfig();

import { describe, it, expect } from 'vitest';

import { createTreeConfig } from '../src/config.js';

describe('createTreeConfig', () => {
  it('uses default values', () => {
    const config = createTreeConfig();

    expect(config.branchingFactor).toBe(8);
    expect(config.maxDepth).toBe(6);
  });

  it('computes derived properties from defaults', () => {
    const config = createTreeConfig();

    expect(config.maxSkillsPerNode).toBe(Math.round(8 * 1.5));
    expect(config.expandThreshold).toBe(Math.round(8 * 0.7));
    expect(config.earlyStopSkillCount).toBe(Math.round(8 * 1.7));
    expect(config.lazySplitThreshold).toBe(Math.round(8 * 1.5 * 1.3));
    expect(config.classificationBatchSize).toBe(Math.round(8 * 6));
    expect(config.structureSampleSize).toBe(Math.round(8 * 12));
  });

  it('updates derived values when branchingFactor is overridden', () => {
    const config = createTreeConfig({ branchingFactor: 10 });

    expect(config.branchingFactor).toBe(10);
    expect(config.maxSkillsPerNode).toBe(Math.round(10 * 1.5));
    expect(config.expandThreshold).toBe(Math.round(10 * 0.7));
    expect(config.earlyStopSkillCount).toBe(Math.round(10 * 1.7));
    expect(config.lazySplitThreshold).toBe(Math.round(10 * 1.5 * 1.3));
    expect(config.classificationBatchSize).toBe(Math.round(10 * 6));
    expect(config.structureSampleSize).toBe(Math.round(10 * 12));
  });

  it('allows maxDepth override', () => {
    const config = createTreeConfig({ maxDepth: 9 });

    expect(config.maxDepth).toBe(9);
    expect(config.branchingFactor).toBe(8);
  });

  it('merges partial overrides with defaults', () => {
    const config = createTreeConfig({ branchingFactor: 12 });

    expect(config.branchingFactor).toBe(12);
    expect(config.maxDepth).toBe(6);
  });
});

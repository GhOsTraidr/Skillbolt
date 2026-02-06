import { describe, it, expect } from 'vitest';
import {
  buildIsolatedExecutorPrompt,
  buildDirectExecutorPrompt,
  buildArtifactsContext,
  EXECUTOR_PROMPT,
  DIRECT_EXECUTOR_PROMPT,
} from '../src/orchestrator/prompts.js';
import { createSkillNode, NodeStatus } from '@skillbolt/compose';

describe('prompts', () => {
  describe('EXECUTOR_PROMPT', () => {
    it('is a non-empty string', () => {
      expect(typeof EXECUTOR_PROMPT).toBe('string');
      expect(EXECUTOR_PROMPT.length).toBeGreaterThan(0);
    });

    it('contains reference to Skill tool', () => {
      expect(EXECUTOR_PROMPT).toContain('Skill tool');
    });
  });

  describe('buildIsolatedExecutorPrompt', () => {
    it('includes all required sections', () => {
      const prompt = buildIsolatedExecutorPrompt({
        overallTask: 'Build a feature',
        workingDir: '/work',
        skillName: 'test-skill',
        nodePurpose: 'Do something',
        outputDir: '/output',
        outputsSummary: 'Files created',
        downstreamHint: 'Use for next step',
        artifactsContext: 'Some artifacts',
      });

      expect(prompt).toContain('Overall Task');
      expect(prompt).toContain('Working Directory');
      expect(prompt).toContain('Current Step');
      expect(prompt).toContain('Output Directory');
      expect(prompt).toContain('Expected Outputs');
      expect(prompt).toContain('Downstream Usage');
      expect(prompt).toContain('<execution_summary>');
      expect(prompt).toContain('</execution_summary>');
    });

    it('includes skill name in output', () => {
      const skillName = 'my-special-skill';
      const prompt = buildIsolatedExecutorPrompt({
        overallTask: 'Build a feature',
        workingDir: '/work',
        skillName,
        nodePurpose: 'Do something',
        outputDir: '/output',
        outputsSummary: 'Files created',
        downstreamHint: 'Use for next step',
        artifactsContext: 'Some artifacts',
      });

      expect(prompt).toContain(skillName);
    });
  });

  describe('buildDirectExecutorPrompt', () => {
    it('replaces task placeholder', () => {
      const task = 'My custom task';
      const prompt = buildDirectExecutorPrompt({
        task,
        workingDir: '/work',
        outputDir: '/output',
      });

      expect(prompt).toContain(task);
      expect(prompt).not.toContain('{task}');
    });

    it('replaces workingDir placeholder', () => {
      const workingDir = '/custom/work/dir';
      const prompt = buildDirectExecutorPrompt({
        task: 'Some task',
        workingDir,
        outputDir: '/output',
      });

      expect(prompt).toContain(workingDir);
      expect(prompt).not.toContain('{workingDir}');
    });

    it('replaces outputDir placeholder', () => {
      const outputDir = '/custom/output/dir';
      const prompt = buildDirectExecutorPrompt({
        task: 'Some task',
        workingDir: '/work',
        outputDir,
      });

      expect(prompt).toContain(outputDir);
      expect(prompt).not.toContain('{outputDir}');
    });
  });

  describe('buildArtifactsContext', () => {
    it('returns "None" message when node has no dependencies', () => {
      const nodes = new Map();
      const nodeA = createSkillNode({
        id: 'a',
        name: 'skill-a',
        status: NodeStatus.COMPLETED,
        outputPath: '/out/a',
        usageHints: {},
      });
      nodes.set('a', nodeA);

      const result = buildArtifactsContext({ nodes, nodeId: 'a' });
      expect(result).toBe('None (this is the first node)');
    });

    it('returns formatted artifact for completed dependency', () => {
      const nodes = new Map();
      const nodeA = createSkillNode({
        id: 'a',
        name: 'skill-a',
        status: NodeStatus.COMPLETED,
        outputPath: '/out/a',
        usageHints: { b: 'Use a output for b' },
      });
      nodes.set('a', nodeA);

      const nodeB = createSkillNode({
        id: 'b',
        name: 'skill-b',
        dependsOn: ['a'],
      });
      nodes.set('b', nodeB);

      const result = buildArtifactsContext({ nodes, nodeId: 'b' });
      expect(result).toContain('a');
      expect(result).toContain('skill-a');
      expect(result).toContain('/out/a');
      expect(result).toContain('Use a output for b');
    });

    it('skips non-completed dependencies', () => {
      const nodes = new Map();
      const nodeA = createSkillNode({
        id: 'a',
        name: 'skill-a',
        status: NodeStatus.PENDING,
        outputPath: '/out/a',
        usageHints: { b: 'Use a output' },
      });
      nodes.set('a', nodeA);

      const nodeB = createSkillNode({
        id: 'b',
        name: 'skill-b',
        dependsOn: ['a'],
      });
      nodes.set('b', nodeB);

      const result = buildArtifactsContext({ nodes, nodeId: 'b' });
      expect(result).toBe('None (this is the first node)');
    });

    it('returns "None" message when node not found', () => {
      const nodes = new Map();
      const result = buildArtifactsContext({ nodes, nodeId: 'nonexistent' });
      expect(result).toBe('None (this is the first node)');
    });

    it('handles multiple completed dependencies', () => {
      const nodes = new Map();

      const nodeA = createSkillNode({
        id: 'a',
        name: 'skill-a',
        status: NodeStatus.COMPLETED,
        outputPath: '/out/a',
        usageHints: { c: 'Use a for c' },
      });
      nodes.set('a', nodeA);

      const nodeB = createSkillNode({
        id: 'b',
        name: 'skill-b',
        status: NodeStatus.COMPLETED,
        outputPath: '/out/b',
        usageHints: { c: 'Use b for c' },
      });
      nodes.set('b', nodeB);

      const nodeC = createSkillNode({
        id: 'c',
        name: 'skill-c',
        dependsOn: ['a', 'b'],
      });
      nodes.set('c', nodeC);

      const result = buildArtifactsContext({ nodes, nodeId: 'c' });
      expect(result).toContain('skill-a');
      expect(result).toContain('skill-b');
      expect(result).toContain('/out/a');
      expect(result).toContain('/out/b');
    });
  });

  describe('DIRECT_EXECUTOR_PROMPT', () => {
    it('is a non-empty string', () => {
      expect(typeof DIRECT_EXECUTOR_PROMPT).toBe('string');
      expect(DIRECT_EXECUTOR_PROMPT.length).toBeGreaterThan(0);
    });

    it('contains placeholders for task, workingDir, and outputDir', () => {
      expect(DIRECT_EXECUTOR_PROMPT).toContain('{task}');
      expect(DIRECT_EXECUTOR_PROMPT).toContain('{workingDir}');
      expect(DIRECT_EXECUTOR_PROMPT).toContain('{outputDir}');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { calculateTriggerCoverage, createCoverageCollector } from '../src/coverage/collector.js';

describe('calculateTriggerCoverage', () => {
  it('should calculate coverage correctly', () => {
    const allTriggers = ['test something', 'run tests', 'execute test'];
    const testedTriggers = ['test something', 'run tests'];

    const coverage = calculateTriggerCoverage(allTriggers, testedTriggers);

    expect(coverage.total).toBe(3);
    expect(coverage.covered).toBe(2);
    expect(coverage.percentage).toBeCloseTo(66.67, 1);
    expect(coverage.tested).toEqual(testedTriggers);
    expect(coverage.untested).toEqual(['execute test']);
  });

  it('should handle 100% coverage', () => {
    const triggers = ['a', 'b', 'c'];
    const coverage = calculateTriggerCoverage(triggers, triggers);

    expect(coverage.percentage).toBe(100);
    expect(coverage.untested).toHaveLength(0);
  });

  it('should handle 0% coverage', () => {
    const triggers = ['a', 'b', 'c'];
    const coverage = calculateTriggerCoverage(triggers, []);

    expect(coverage.percentage).toBe(0);
    expect(coverage.covered).toBe(0);
    expect(coverage.untested).toEqual(triggers);
  });

  it('should handle empty triggers', () => {
    const coverage = calculateTriggerCoverage([], []);
    expect(coverage.percentage).toBe(100);
  });
});

describe('createCoverageCollector', () => {
  it('should register skills and track coverage', () => {
    const collector = createCoverageCollector();

    collector.registerSkill({
      path: '/test/SKILL.md',
      manifest: {
        name: 'Test Skill',
        description: 'Test',
        triggers: ['trigger1', 'trigger2'],
      },
      content: '',
      sections: [{ type: 'overview', title: 'Overview', content: '', lineStart: 1, lineEnd: 5 }],
    });

    collector.recordTriggerTest('/test/SKILL.md', 'trigger1');

    const skillCoverage = collector.getSkillCoverage('/test/SKILL.md');

    expect(skillCoverage).not.toBeNull();
    expect(skillCoverage!.triggers.total).toBe(2);
    expect(skillCoverage!.triggers.covered).toBe(1);
    expect(skillCoverage!.triggers.tested).toContain('trigger1');
    expect(skillCoverage!.triggers.untested).toContain('trigger2');
  });

  it('should generate coverage report', () => {
    const collector = createCoverageCollector();

    collector.registerSkill({
      path: '/test1/SKILL.md',
      manifest: {
        name: 'Test Skill 1',
        description: 'Test',
        triggers: ['a', 'b'],
      },
      content: '',
      sections: [],
    });

    collector.registerSkill({
      path: '/test2/SKILL.md',
      manifest: {
        name: 'Test Skill 2',
        description: 'Test',
        triggers: ['c', 'd'],
      },
      content: '',
      sections: [],
    });

    collector.recordTriggerTest('/test1/SKILL.md', 'a');
    collector.recordTriggerTest('/test2/SKILL.md', 'c');
    collector.recordTriggerTest('/test2/SKILL.md', 'd');

    const report = collector.getReport(75);

    expect(report.summary.totalSkills).toBe(2);
    expect(report.summary.totalTriggers).toBe(4);
    expect(report.summary.coveredTriggers).toBe(3);
    expect(report.summary.triggerCoverage).toBe(75);
    expect(report.thresholdMet).toBe(true);
  });

  it('should reset coverage data', () => {
    const collector = createCoverageCollector();

    collector.registerSkill({
      path: '/test/SKILL.md',
      manifest: {
        name: 'Test',
        description: 'Test',
        triggers: ['a'],
      },
      content: '',
      sections: [],
    });

    collector.recordTriggerTest('/test/SKILL.md', 'a');
    collector.reset();

    const skillCoverage = collector.getSkillCoverage('/test/SKILL.md');
    expect(skillCoverage).toBeNull();
  });
});

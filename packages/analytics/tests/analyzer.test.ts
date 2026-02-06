import { describe, it, expect } from 'vitest';
import {
  calculateSkillStats,
  calculateAggregatedStats,
  calculateTrends,
  StatisticsCalculator,
} from '../src/analyzer/statistics.js';
import {
  analyzeTriggerPatterns,
  findUnusedSkills,
  findPotentialTriggers,
  PatternAnalyzer,
} from '../src/analyzer/patterns.js';
import { generateSuggestions, SuggestionGenerator } from '../src/analyzer/suggestions.js';
import { sampleEvents, eventsWithDistribution, createTestEvent } from './fixtures/events.js';

describe('Statistics Calculator', () => {
  describe('calculateSkillStats', () => {
    it('should calculate stats for a specific skill', () => {
      const stats = calculateSkillStats(sampleEvents, 'react-patterns');

      expect(stats.skillName).toBe('react-patterns');
      expect(stats.totalTriggers).toBe(2);
      expect(stats.successCount).toBe(2);
      expect(stats.failureCount).toBe(0);
      expect(stats.successRate).toBe(1);
      expect(stats.avgDuration).toBe(175);
    });

    it('should return empty stats for unknown skill', () => {
      const stats = calculateSkillStats(sampleEvents, 'unknown-skill');

      expect(stats.totalTriggers).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('should track trigger distribution', () => {
      const stats = calculateSkillStats(sampleEvents, 'react-patterns');

      expect(stats.triggerDistribution['show react patterns']).toBe(1);
      expect(stats.triggerDistribution['react best practices']).toBe(1);
    });
  });

  describe('calculateAggregatedStats', () => {
    it('should aggregate stats across all skills', () => {
      const stats = calculateAggregatedStats(sampleEvents);

      expect(stats.totalEvents).toBe(5);
      expect(stats.uniqueSkills).toBe(3);
      expect(stats.skillStats).toHaveLength(3);
    });

    it('should calculate overall success rate', () => {
      const stats = calculateAggregatedStats(sampleEvents);

      expect(stats.overallSuccessRate).toBe(0.8);
    });

    it('should sort skills by usage', () => {
      const stats = calculateAggregatedStats(sampleEvents);

      expect(stats.skillStats[0]!.skillName).toBe('react-patterns');
      expect(stats.skillStats[0]!.totalTriggers).toBe(2);
    });
  });

  describe('calculateTrends', () => {
    it('should calculate trend changes', () => {
      const currentEvents = sampleEvents;
      const previousEvents = [
        createTestEvent({ skillName: 'test', success: true }),
        createTestEvent({ skillName: 'test', success: false }),
      ];

      const trends = calculateTrends(currentEvents, previousEvents);

      expect(trends.current.totalTriggers).toBe(5);
      expect(trends.previous.totalTriggers).toBe(2);
      expect(trends.changes.triggersChange).toBe(150);
    });
  });

  describe('StatisticsCalculator class', () => {
    it('should provide convenient methods', () => {
      const calc = new StatisticsCalculator(sampleEvents);

      const skillStats = calc.getSkillStats('git-workflow');
      expect(skillStats.totalTriggers).toBe(2);

      const topSkills = calc.getTopSkills(2);
      expect(topSkills).toHaveLength(2);

      const aggregated = calc.getAggregatedStats();
      expect(aggregated.uniqueSkills).toBe(3);
    });
  });
});

describe('Pattern Analyzer', () => {
  describe('analyzeTriggerPatterns', () => {
    it('should analyze trigger phrase patterns', () => {
      const patterns = analyzeTriggerPatterns(eventsWithDistribution);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0]!.count).toBeGreaterThanOrEqual(patterns[1]?.count ?? 0);
    });

    it('should calculate success rate per pattern', () => {
      const patterns = analyzeTriggerPatterns(sampleEvents);
      const gitHelpPattern = patterns.find((p) => p.phrase === 'git help');

      expect(gitHelpPattern?.successRate).toBe(0);
    });
  });

  describe('findUnusedSkills', () => {
    it('should find skills not used within threshold', () => {
      const allSkills = ['react-patterns', 'git-workflow', 'typescript-tips', 'unused-skill'];
      const unused = findUnusedSkills(sampleEvents, allSkills, 1);

      expect(unused.some((s) => s.skillName === 'unused-skill')).toBe(true);
    });

    it('should report never-used skills', () => {
      const unused = findUnusedSkills([], ['never-used'], 0);

      expect(unused).toHaveLength(1);
      expect(unused[0]!.daysSinceLastUse).toBe(Infinity);
      expect(unused[0]!.lifetimeTriggers).toBe(0);
    });
  });

  describe('findPotentialTriggers', () => {
    it('should find potential triggers from errors', () => {
      const events = [
        createTestEvent({ eventType: 'error', triggerPhrase: 'react help' }),
        createTestEvent({ eventType: 'error', triggerPhrase: 'react help' }),
        createTestEvent({ eventType: 'error', triggerPhrase: 'react help' }),
      ];

      const potentials = findPotentialTriggers(events, ['show react patterns']);

      expect(potentials.length).toBeGreaterThan(0);
      expect(potentials[0]!.phrase).toBe('react help');
    });
  });

  describe('PatternAnalyzer class', () => {
    it('should provide convenient methods', () => {
      const analyzer = new PatternAnalyzer(eventsWithDistribution);

      const patterns = analyzer.getTriggerPatterns();
      expect(patterns.length).toBeGreaterThan(0);

      const mostCommon = analyzer.getMostCommonTriggers(3);
      expect(mostCommon.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('Suggestion Generator', () => {
  describe('generateSuggestions', () => {
    it('should generate suggestions for unused skills', () => {
      const allSkills = ['used-skill', 'unused-skill'];
      const events = [createTestEvent({ skillName: 'used-skill' })];

      const suggestions = generateSuggestions(events, allSkills, []);

      const unusedSuggestion = suggestions.find(
        (s) => s.type === 'remove_skill' && s.skillName === 'unused-skill'
      );
      expect(unusedSuggestion).toBeDefined();
    });

    it('should respect maxSuggestions option', () => {
      const suggestions = generateSuggestions(
        eventsWithDistribution,
        ['skill-1', 'skill-2', 'skill-3'],
        [],
        { maxSuggestions: 2 }
      );

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should filter by confidence', () => {
      const suggestions = generateSuggestions(sampleEvents, [], [], { minConfidence: 0.9 });

      expect(suggestions.every((s) => s.confidence >= 0.9)).toBe(true);
    });
  });

  describe('SuggestionGenerator class', () => {
    it('should provide filtering methods', () => {
      const generator = new SuggestionGenerator(sampleEvents, [], []);

      const highPriority = generator.getHighPrioritySuggestions();
      expect(highPriority.every((s) => s.priority === 'high')).toBe(true);
    });
  });
});

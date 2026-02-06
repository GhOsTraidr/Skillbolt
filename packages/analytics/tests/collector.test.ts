import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  AnalyticsCollector,
  createCollector,
  trackEvent,
  getDefaultCollector,
} from '../src/collector/index.js';
import { applyPrivacyFilter, isCollectionEnabled } from '../src/collector/privacy.js';
import type { AnalyticsEventInput, PrivacyLevel } from '../src/types/index.js';

describe('AnalyticsCollector', () => {
  let tempDir: string;
  let collector: AnalyticsCollector;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'analytics-test-'));
  });

  afterEach(() => {
    if (collector) {
      collector.close();
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('track', () => {
    it('should track an event successfully', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
      });

      const input: AnalyticsEventInput = {
        skillName: 'test-skill',
        eventType: 'complete',
        triggerPhrase: 'test trigger',
        success: true,
        duration: 100,
      };

      const event = collector.track(input);

      expect(event).not.toBeNull();
      expect(event!.skillName).toBe('test-skill');
      expect(event!.eventType).toBe('complete');
      expect(event!.success).toBe(true);
      expect(event!.id).toMatch(/^evt_/);
    });

    it('should return null when disabled', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
        enabled: false,
      });

      const event = collector.track({
        skillName: 'test-skill',
        eventType: 'complete',
      });

      expect(event).toBeNull();
    });

    it('should return null when privacy level is off', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
        privacyLevel: 'off',
      });

      const event = collector.track({
        skillName: 'test-skill',
        eventType: 'complete',
      });

      expect(event).toBeNull();
    });
  });

  describe('query', () => {
    it('should query events by skill name', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
      });

      collector.track({ skillName: 'skill-a', eventType: 'complete' });
      collector.track({ skillName: 'skill-b', eventType: 'complete' });
      collector.track({ skillName: 'skill-a', eventType: 'complete' });

      const events = collector.query({ skillName: 'skill-a' });

      expect(events).toHaveLength(2);
      expect(events.every((e) => e.skillName === 'skill-a')).toBe(true);
    });

    it('should query events by date range', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
      });

      collector.track({ skillName: 'test', eventType: 'complete' });

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const events = collector.query({
        startDate: yesterday,
        endDate: tomorrow,
      });

      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('count', () => {
    it('should count events', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
      });

      collector.track({ skillName: 'test', eventType: 'complete' });
      collector.track({ skillName: 'test', eventType: 'complete' });
      collector.track({ skillName: 'test', eventType: 'complete' });

      const count = collector.count();

      expect(count).toBe(3);
    });
  });

  describe('clear', () => {
    it('should clear all events', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
      });

      collector.track({ skillName: 'test', eventType: 'complete' });
      collector.track({ skillName: 'test', eventType: 'complete' });

      const deleted = collector.clear();

      expect(deleted).toBe(2);
      expect(collector.count()).toBe(0);
    });

    it('should clear events by skill name', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
      });

      collector.track({ skillName: 'skill-a', eventType: 'complete' });
      collector.track({ skillName: 'skill-b', eventType: 'complete' });

      collector.clear({ skillName: 'skill-a' });

      const events = collector.query({});
      expect(events).toHaveLength(1);
      expect(events[0]!.skillName).toBe('skill-b');
    });
  });

  describe('getUniqueSkills', () => {
    it('should return unique skill names', () => {
      collector = createCollector({
        dbPath: join(tempDir, 'test.db'),
      });

      collector.track({ skillName: 'skill-a', eventType: 'complete' });
      collector.track({ skillName: 'skill-b', eventType: 'complete' });
      collector.track({ skillName: 'skill-a', eventType: 'complete' });

      const skills = collector.getUniqueSkills();

      expect(skills).toHaveLength(2);
      expect(skills).toContain('skill-a');
      expect(skills).toContain('skill-b');
    });
  });
});

describe('Privacy Filter', () => {
  const baseInput: AnalyticsEventInput = {
    skillName: 'test-skill',
    eventType: 'complete',
    triggerPhrase: 'test trigger phrase',
    parameters: { key: 'value', longText: 'a'.repeat(150) },
    duration: 100,
    success: true,
    errorCode: undefined,
  };

  it('should throw when privacy level is off', () => {
    expect(() => applyPrivacyFilter(baseInput, 'off')).toThrow();
  });

  it('should pass through all data for high privacy level', () => {
    const result = applyPrivacyFilter(baseInput, 'high');
    expect(result).toEqual(baseInput);
  });

  it('should sanitize parameters for medium privacy level', () => {
    const result = applyPrivacyFilter(baseInput, 'medium');
    expect(result.skillName).toBe(baseInput.skillName);
    expect(result.triggerPhrase).toBe(baseInput.triggerPhrase);
    expect(result.parameters).toBeDefined();
    expect(result.parameters!['longText']).toMatch(/\[\d+ chars\]/);
  });

  it('should strip sensitive data for low privacy level', () => {
    const result = applyPrivacyFilter(baseInput, 'low');
    expect(result.skillName).toBe(baseInput.skillName);
    expect(result.eventType).toBe(baseInput.eventType);
    expect(result.triggerPhrase).toBeUndefined();
    expect(result.parameters).toBeUndefined();
  });

  it('should correctly identify collection enabled state', () => {
    expect(isCollectionEnabled('off')).toBe(false);
    expect(isCollectionEnabled('low')).toBe(true);
    expect(isCollectionEnabled('medium')).toBe(true);
    expect(isCollectionEnabled('high')).toBe(true);
  });
});

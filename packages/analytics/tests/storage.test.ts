import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { AnalyticsStorage, createStorage } from '../src/storage/index.js';
import type { ResolvedAnalyticsConfig } from '../src/types/index.js';

describe('AnalyticsStorage', () => {
  let tempDir: string;
  let storage: AnalyticsStorage;
  let config: ResolvedAnalyticsConfig;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'analytics-storage-test-'));
    config = {
      enabled: true,
      privacyLevel: 'medium',
      dbPath: join(tempDir, 'test.db'),
      retentionDays: 90,
      autoCleanup: true,
    };
  });

  afterEach(() => {
    if (storage) {
      storage.close();
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('initialization', () => {
    it('should create database file', () => {
      storage = createStorage(config);
      storage.close();

      const { existsSync } = require('node:fs');
      expect(existsSync(config.dbPath)).toBe(true);
    });

    it('should initialize schema', () => {
      storage = createStorage(config);
      const stats = storage.getStats();

      expect(stats.totalEvents).toBe(0);
    });
  });

  describe('insert', () => {
    it('should insert an event', () => {
      storage = createStorage(config);

      const event = storage.insert({
        skillName: 'test-skill',
        eventType: 'complete',
        triggerPhrase: 'test',
        success: true,
        duration: 100,
      });

      expect(event.id).toMatch(/^evt_/);
      expect(event.skillName).toBe('test-skill');
      expect(event.timestamp).toBeDefined();
    });

    it('should auto-generate id and timestamp', () => {
      storage = createStorage(config);

      const event = storage.insert({
        skillName: 'test',
        eventType: 'trigger',
      });

      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeDefined();
    });
  });

  describe('query', () => {
    beforeEach(() => {
      storage = createStorage(config);

      storage.insert({ skillName: 'skill-a', eventType: 'complete', success: true });
      storage.insert({ skillName: 'skill-b', eventType: 'complete', success: true });
      storage.insert({ skillName: 'skill-a', eventType: 'error', success: false });
    });

    it('should query all events', () => {
      const events = storage.query();
      expect(events).toHaveLength(3);
    });

    it('should filter by skill name', () => {
      const events = storage.query({ skillName: 'skill-a' });
      expect(events).toHaveLength(2);
    });

    it('should filter by event type', () => {
      const events = storage.query({ eventType: 'error' });
      expect(events).toHaveLength(1);
    });

    it('should support pagination', () => {
      const page1 = storage.query({ limit: 2, offset: 0 });
      const page2 = storage.query({ limit: 2, offset: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
    });

    it('should support ordering', () => {
      const ascending = storage.query({ orderBy: 'skillName', order: 'asc' });
      const descending = storage.query({ orderBy: 'skillName', order: 'desc' });

      expect(ascending[0]!.skillName).toBe('skill-a');
      expect(descending[0]!.skillName).toBe('skill-b');
    });
  });

  describe('count', () => {
    it('should count events', () => {
      storage = createStorage(config);

      storage.insert({ skillName: 'test', eventType: 'complete' });
      storage.insert({ skillName: 'test', eventType: 'complete' });

      expect(storage.count()).toBe(2);
    });

    it('should count with filters', () => {
      storage = createStorage(config);

      storage.insert({ skillName: 'skill-a', eventType: 'complete' });
      storage.insert({ skillName: 'skill-b', eventType: 'complete' });

      expect(storage.count({ skillName: 'skill-a' })).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all events', () => {
      storage = createStorage(config);

      storage.insert({ skillName: 'test', eventType: 'complete' });
      storage.insert({ skillName: 'test', eventType: 'complete' });

      const deleted = storage.clear();

      expect(deleted).toBe(2);
      expect(storage.count()).toBe(0);
    });

    it('should clear by skill name', () => {
      storage = createStorage(config);

      storage.insert({ skillName: 'keep', eventType: 'complete' });
      storage.insert({ skillName: 'delete', eventType: 'complete' });

      storage.clear({ skillName: 'delete' });

      const events = storage.query();
      expect(events).toHaveLength(1);
      expect(events[0]!.skillName).toBe('keep');
    });
  });

  describe('getUniqueSkills', () => {
    it('should return unique skill names', () => {
      storage = createStorage(config);

      storage.insert({ skillName: 'skill-a', eventType: 'complete' });
      storage.insert({ skillName: 'skill-b', eventType: 'complete' });
      storage.insert({ skillName: 'skill-a', eventType: 'complete' });

      const skills = storage.getUniqueSkills();

      expect(skills).toHaveLength(2);
      expect(skills).toContain('skill-a');
      expect(skills).toContain('skill-b');
    });
  });

  describe('getDateRange', () => {
    it('should return date range', () => {
      storage = createStorage(config);

      storage.insert({ skillName: 'test', eventType: 'complete' });

      const range = storage.getDateRange();

      expect(range).not.toBeNull();
      expect(range!.startDate).toBeDefined();
      expect(range!.endDate).toBeDefined();
    });

    it('should return null for empty database', () => {
      storage = createStorage(config);

      const range = storage.getDateRange();

      expect(range).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return storage statistics', () => {
      storage = createStorage(config);

      storage.insert({ skillName: 'test', eventType: 'complete' });

      const stats = storage.getStats();

      expect(stats.totalEvents).toBe(1);
      expect(stats.dbSizeBytes).toBeGreaterThan(0);
      expect(stats.oldestEvent).toBeDefined();
      expect(stats.newestEvent).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should cleanup old events based on retention days', () => {
      storage = createStorage({
        ...config,
        retentionDays: 30,
        autoCleanup: true,
      });

      storage.insert({ skillName: 'test', eventType: 'complete' });

      const deleted = storage.cleanup();

      expect(deleted).toBe(0);
    });

    it('should not cleanup when disabled', () => {
      storage = createStorage({
        ...config,
        autoCleanup: false,
      });

      storage.insert({ skillName: 'test', eventType: 'complete' });

      const deleted = storage.cleanup();

      expect(deleted).toBe(0);
    });
  });
});

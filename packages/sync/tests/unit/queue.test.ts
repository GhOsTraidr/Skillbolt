import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineQueue } from '../../src/queue/offline-queue.js';
import type { LocalSkill } from '../../src/types/sync.js';

function createLocalSkill(overrides: Partial<LocalSkill> = {}): LocalSkill {
  return {
    name: 'test-skill',
    relativePath: 'test-skill.md',
    fullPath: '/path/to/test-skill.md',
    content: '# Test Skill',
    hash: 'abc123',
    modifiedAt: new Date(),
    size: 100,
    ...overrides,
  };
}

describe('OfflineQueue', () => {
  let queue: OfflineQueue;

  beforeEach(() => {
    queue = new OfflineQueue({
      persistPath: '/tmp/test-queue.json',
      maxRetries: 3,
      retryDelay: 1000,
      autoFlush: false,
    });
  });

  describe('enqueue', () => {
    it('should add operation to queue', async () => {
      const skill = createLocalSkill();
      const id = await queue.enqueue('push', skill);

      expect(id).toBeDefined();
      expect(queue.isEmpty()).toBe(false);
    });

    it('should deduplicate operations for same path and type', async () => {
      const skill = createLocalSkill();
      await queue.enqueue('push', skill);
      await queue.enqueue('push', skill);

      expect(queue.getAll()).toHaveLength(1);
    });

    it('should keep different types for same path', async () => {
      const skill = createLocalSkill();
      await queue.enqueue('push', skill);
      await queue.enqueueDelete('delete-remote', skill.relativePath, skill.name);

      expect(queue.getAll()).toHaveLength(2);
    });
  });

  describe('dequeue', () => {
    it('should remove and return first operation', async () => {
      const skill1 = createLocalSkill({ name: 'skill1', relativePath: 'skill1.md' });
      const skill2 = createLocalSkill({ name: 'skill2', relativePath: 'skill2.md' });

      await queue.enqueue('push', skill1);
      await queue.enqueue('push', skill2);

      const op = queue.dequeue();
      expect(op?.skillName).toBe('skill1');
      expect(queue.getAll()).toHaveLength(1);
    });

    it('should return undefined for empty queue', () => {
      const op = queue.dequeue();
      expect(op).toBeUndefined();
    });
  });

  describe('peek', () => {
    it('should return first operation without removing', async () => {
      const skill = createLocalSkill();
      await queue.enqueue('push', skill);

      const op = queue.peek();
      expect(op?.skillName).toBe('test-skill');
      expect(queue.getAll()).toHaveLength(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty queue', () => {
      expect(queue.isEmpty()).toBe(true);
    });

    it('should return false for non-empty queue', async () => {
      await queue.enqueue('push', createLocalSkill());
      expect(queue.isEmpty()).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return queue status', async () => {
      await queue.enqueue('push', createLocalSkill({ name: 'skill1', relativePath: 'skill1.md' }));
      await queue.enqueue('push', createLocalSkill({ name: 'skill2', relativePath: 'skill2.md' }));

      const status = queue.getStatus();

      expect(status.pending).toBe(2);
      expect(status.failed).toBe(0);
      expect(status.processing).toBe(false);
      expect(status.operations).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('should remove specific operation by id', async () => {
      const skill = createLocalSkill();
      const id = await queue.enqueue('push', skill);

      const removed = await queue.remove(id);

      expect(removed).toBe(true);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should return false for non-existent id', async () => {
      const removed = await queue.remove('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all operations', async () => {
      await queue.enqueue('push', createLocalSkill({ name: 'skill1', relativePath: 'skill1.md' }));
      await queue.enqueue('push', createLocalSkill({ name: 'skill2', relativePath: 'skill2.md' }));

      await queue.clear();

      expect(queue.isEmpty()).toBe(true);
    });
  });
});

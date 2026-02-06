import { describe, it, expect } from 'vitest';
import { DEFAULT_DEMO_TASKS } from '../../src/demos/index.js';
import type { DemoTask } from '../../src/demos/index.js';

describe('DEFAULT_DEMO_TASKS', () => {
  it('is non-empty array', () => {
    expect(Array.isArray(DEFAULT_DEMO_TASKS)).toBe(true);
    expect(DEFAULT_DEMO_TASKS.length).toBeGreaterThan(0);
  });

  it('each task has required fields', () => {
    DEFAULT_DEMO_TASKS.forEach((task) => {
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('prompt');
      expect(typeof task.id).toBe('string');
      expect(typeof task.title).toBe('string');
      expect(typeof task.description).toBe('string');
      expect(typeof task.prompt).toBe('string');
    });
  });

  it('all IDs are unique', () => {
    const ids = DEFAULT_DEMO_TASKS.map((task) => task.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('prompts are non-empty strings with reasonable length', () => {
    DEFAULT_DEMO_TASKS.forEach((task) => {
      expect(task.prompt.length).toBeGreaterThan(20);
      expect(task.prompt.trim().length).toBeGreaterThan(0);
    });
  });

  it('tasks satisfy DemoTask interface', () => {
    DEFAULT_DEMO_TASKS.forEach((task) => {
      const demoTask: DemoTask = task;
      expect(demoTask.id).toBeDefined();
      expect(demoTask.title).toBeDefined();
      expect(demoTask.description).toBeDefined();
      expect(demoTask.prompt).toBeDefined();
    });
  });
});

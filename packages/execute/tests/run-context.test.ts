import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RunContext } from '../src/context/run-context.js';
import { RunManager } from '../src/context/run-manager.js';

const TEST_DIR = join(process.cwd(), '.test-runs-' + Date.now());

afterEach(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('RunContext', () => {
  describe('create', () => {
    it('returns instance with runId containing timestamp, mode, and hash', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      expect(ctx.runId).toBeDefined();
      expect(ctx.runId).toMatch(/^\d{8}-\d{6}-dag-/);
    });

    it('includes sanitized task name in runId', () => {
      const ctx = RunContext.create('My Test Task', { baseDir: TEST_DIR, mode: 'dag' });
      expect(ctx.runId).toContain('my-test-task');
    });

    it('includes custom taskName in runId when provided', () => {
      const ctx = RunContext.create('test task', {
        baseDir: TEST_DIR,
        mode: 'dag',
        taskName: 'custom-name',
      });
      expect(ctx.runId).toContain('custom-name');
    });

    it('sets directory structure properties', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      expect(ctx.runDir).toBeDefined();
      expect(ctx.skillsDir).toBeDefined();
      expect(ctx.workspaceDir).toBeDefined();
      expect(ctx.logsDir).toBeDefined();
      expect(ctx.skillsDir).toContain('.claude/skills');
      expect(ctx.workspaceDir).toContain('workspace');
      expect(ctx.logsDir).toContain('logs');
    });
  });

  describe('setup', () => {
    it('creates directory structure', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      ctx.setup([], TEST_DIR);

      expect(existsSync(ctx.runDir)).toBe(true);
      expect(existsSync(ctx.skillsDir)).toBe(true);
      expect(existsSync(ctx.workspaceDir)).toBe(true);
      expect(existsSync(ctx.logsDir)).toBe(true);
    });
  });

  describe('saveMeta', () => {
    it('writes meta.json with correct fields', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      ctx.setup([], TEST_DIR);

      const task = 'My Task';
      const mode = 'dag';
      const skills = ['skill-a', 'skill-b'];

      ctx.saveMeta(task, mode, skills);

      const metaPath = join(ctx.runDir, 'meta.json');
      expect(existsSync(metaPath)).toBe(true);

      const content = readFileSync(metaPath, 'utf8');
      const meta = JSON.parse(content);

      expect(meta.runId).toBe(ctx.runId);
      expect(meta.task).toBe(task);
      expect(meta.mode).toBe(mode);
      expect(meta.skills).toEqual(skills);
      expect(meta.startedAt).toBeDefined();
      expect(meta.runDir).toBe(ctx.runDir);
    });
  });

  describe('updateMeta', () => {
    it('merges fields into existing meta.json', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      ctx.setup([], TEST_DIR);

      ctx.saveMeta('task', 'dag', ['skill-a']);
      ctx.updateMeta({ customField: 'custom-value', anotherField: 42 });

      const metaPath = join(ctx.runDir, 'meta.json');
      const content = readFileSync(metaPath, 'utf8');
      const meta = JSON.parse(content);

      expect(meta.task).toBe('task');
      expect(meta.customField).toBe('custom-value');
      expect(meta.anotherField).toBe(42);
    });
  });

  describe('saveResult', () => {
    it('writes result.json and updates meta with completedAt', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      ctx.setup([], TEST_DIR);
      ctx.saveMeta('task', 'dag', ['skill-a']);

      const result = { status: 'success', output: 'test output' };
      ctx.saveResult(result);

      const resultPath = join(ctx.runDir, 'result.json');
      expect(existsSync(resultPath)).toBe(true);

      const resultContent = readFileSync(resultPath, 'utf8');
      const savedResult = JSON.parse(resultContent);
      expect(savedResult).toEqual(result);

      const metaPath = join(ctx.runDir, 'meta.json');
      const metaContent = readFileSync(metaPath, 'utf8');
      const meta = JSON.parse(metaContent);
      expect(meta.completedAt).toBeDefined();
      expect(meta.result).toEqual(result);
    });
  });

  describe('savePlan', () => {
    it('writes plan.json', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      ctx.setup([], TEST_DIR);

      const plan = { nodes: ['a', 'b', 'c'], edges: [['a', 'b']] };
      ctx.savePlan(plan);

      const planPath = join(ctx.runDir, 'plan.json');
      expect(existsSync(planPath)).toBe(true);

      const content = readFileSync(planPath, 'utf8');
      const savedPlan = JSON.parse(content);
      expect(savedPlan).toEqual(plan);
    });
  });
});

describe('RunManager', () => {
  describe('listRuns', () => {
    it('lists runs from directory', () => {
      const manager = new RunManager(TEST_DIR);

      // Create first run
      const ctx1 = RunContext.create('task 1', { baseDir: TEST_DIR, mode: 'dag' });
      ctx1.setup([], TEST_DIR);
      ctx1.saveMeta('task 1', 'dag', ['skill-a']);

      // Create second run
      const ctx2 = RunContext.create('task 2', { baseDir: TEST_DIR, mode: 'dag' });
      ctx2.setup([], TEST_DIR);
      ctx2.saveMeta('task 2', 'dag', ['skill-b']);

      const runs = manager.listRuns();
      expect(runs.length).toBe(2);
      expect(runs.some((r) => r.task === 'task 1')).toBe(true);
      expect(runs.some((r) => r.task === 'task 2')).toBe(true);
    });

    it('returns empty array when directory does not exist', () => {
      const manager = new RunManager(join(TEST_DIR, 'nonexistent'));
      const runs = manager.listRuns();
      expect(runs).toEqual([]);
    });

    it('skips directories without meta.json', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      mkdirSync(join(TEST_DIR, 'invalid-run'), { recursive: true });

      const manager = new RunManager(TEST_DIR);
      const runs = manager.listRuns();
      expect(runs.length).toBe(0);
    });
  });

  describe('getRun', () => {
    it('returns specific run meta', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      ctx.setup([], TEST_DIR);
      ctx.saveMeta('test task', 'dag', ['skill-a']);

      const manager = new RunManager(TEST_DIR);
      const run = manager.getRun(ctx.runId);

      expect(run).not.toBeNull();
      expect(run?.runId).toBe(ctx.runId);
      expect(run?.task).toBe('test task');
    });

    it('returns null for missing run', () => {
      const manager = new RunManager(TEST_DIR);
      const run = manager.getRun('nonexistent-run-id');
      expect(run).toBeNull();
    });

    it('includes result in returned meta when result.json exists', () => {
      const ctx = RunContext.create('test task', { baseDir: TEST_DIR, mode: 'dag' });
      ctx.setup([], TEST_DIR);
      ctx.saveMeta('test task', 'dag', ['skill-a']);

      const result = { status: 'success', data: 'test' };
      ctx.saveResult(result);

      const manager = new RunManager(TEST_DIR);
      const run = manager.getRun(ctx.runId);

      expect(run?.result).toEqual(result);
    });
  });
});

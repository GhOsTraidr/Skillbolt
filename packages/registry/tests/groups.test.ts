import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { GroupManager, DEFAULT_SKILL_GROUPS, SKILL_GROUP_ALIASES } from '../src/groups/index.js';

const TEST_DIR = join(process.cwd(), '.test-groups-' + Date.now());

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('GroupManager', () => {
  it('DEFAULT_SKILL_GROUPS has 3 entries', () => {
    expect(DEFAULT_SKILL_GROUPS).toHaveLength(3);
  });

  it('curated is default', () => {
    const curated = DEFAULT_SKILL_GROUPS.find((g) => g.id === 'curated');
    expect(curated).toBeDefined();
    expect(curated?.isDefault).toBe(true);
  });

  it('SKILL_GROUP_ALIASES maps default to curated', () => {
    expect(SKILL_GROUP_ALIASES['default']).toBe('curated');
  });

  it('listGroups returns all defaults with active flag', () => {
    const manager = new GroupManager(TEST_DIR);
    const groups = manager.listGroups();

    expect(groups).toHaveLength(3);
    expect(groups.some((g) => g.active && g.id === 'curated')).toBe(true);
    expect(groups.every((g) => typeof g.active === 'boolean')).toBe(true);
  });

  it('getActiveGroup returns curated by default', () => {
    const manager = new GroupManager(TEST_DIR);
    const active = manager.getActiveGroup();

    expect(active.id).toBe('curated');
  });

  it('switchGroup changes active group', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    manager.switchGroup('top500');
    const active = manager.getActiveGroup();

    expect(active.id).toBe('top500');
  });

  it('switchGroup with alias resolves correctly', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    manager.switchGroup('default');
    const active = manager.getActiveGroup();

    expect(active.id).toBe('curated');
  });

  it('switchGroup unknown group throws Error', () => {
    const manager = new GroupManager(TEST_DIR);

    expect(() => manager.switchGroup('nonexistent')).toThrow('Unknown skill group: nonexistent');
  });

  it('setCustomGroup creates custom group and activates it', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    const custom = manager.setCustomGroup('/path/to/skills', '/path/to/tree.yaml');

    expect(custom.id).toBe('custom');
    expect(custom.skillsDir).toBe('/path/to/skills');
    expect(custom.treePath).toBe('/path/to/tree.yaml');

    const active = manager.getActiveGroup();
    expect(active.id).toBe('custom');
  });

  it('persists across instances', () => {
    mkdirSync(TEST_DIR, { recursive: true });

    // Create manager, switch group
    const manager1 = new GroupManager(TEST_DIR);
    manager1.switchGroup('top1000');

    // Create new manager instance
    const manager2 = new GroupManager(TEST_DIR);
    const active = manager2.getActiveGroup();

    expect(active.id).toBe('top1000');
  });

  it('setCustomGroupByName creates custom group with sanitized id', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    const custom = manager.setCustomGroupByName('My Project', '/path/to/skills', '/path/to/tree.yaml');

    expect(custom.id).toBe('my-project');
    expect(custom.name).toBe('My Project');
    expect(custom.skillsDir).toBe('/path/to/skills');
    expect(custom.treePath).toBe('/path/to/tree.yaml');

    const active = manager.getActiveGroup();
    expect(active.id).toBe('my-project');
  });

  it('setCustomGroupByName sanitizes special characters', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    const custom = manager.setCustomGroupByName(
      'Test@#$%^&*()  Project',
      '/path/to/skills',
      '/path/to/tree.yaml'
    );

    expect(custom.id).toBe('test-project');
    expect(custom.name).toBe('Test@#$%^&*()  Project');
  });

  it('setCustomGroupByName updates existing group', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    // Create initial custom group
    manager.setCustomGroupByName('myproject', '/path/to/skills1', '/path/to/tree1.yaml');

    // Update the same group
    const updated = manager.setCustomGroupByName('myproject', '/path/to/skills2', '/path/to/tree2.yaml', 'Updated description');

    expect(updated.id).toBe('myproject');
    expect(updated.skillsDir).toBe('/path/to/skills2');
    expect(updated.treePath).toBe('/path/to/tree2.yaml');
    expect(updated.description).toBe('Updated description');

    // Verify only one custom group exists
    const groups = manager.listGroups();
    const customGroups = groups.filter((g) => !DEFAULT_SKILL_GROUPS.find((d) => d.id === g.id));
    expect(customGroups).toHaveLength(1);
    expect(customGroups[0]?.skillsDir).toBe('/path/to/skills2');
  });

  it('setCustomGroupByName with custom description', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    const custom = manager.setCustomGroupByName(
      'myproject',
      '/path/to/skills',
      '/path/to/tree.yaml',
      'This is my custom project'
    );

    expect(custom.description).toBe('This is my custom project');
  });

  it('setCustomGroup with custom description', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    const custom = manager.setCustomGroup('/path/to/skills', '/path/to/tree.yaml', 'Custom description');

    expect(custom.description).toBe('Custom description');
  });

  it('setCustomGroupByName creates unique groups for different names', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const manager = new GroupManager(TEST_DIR);

    manager.setCustomGroupByName('project1', '/path/to/skills1', '/path/to/tree1.yaml');
    manager.setCustomGroupByName('project2', '/path/to/skills2', '/path/to/tree2.yaml');

    const groups = manager.listGroups();
    const customGroups = groups.filter((g) => !DEFAULT_SKILL_GROUPS.find((d) => d.id === g.id));

    expect(customGroups).toHaveLength(2);
    expect(customGroups.some((g) => g.id === 'project1')).toBe(true);
    expect(customGroups.some((g) => g.id === 'project2')).toBe(true);
  });
});

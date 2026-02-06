import { describe, it, expect } from 'vitest';
import { detectConflicts, resolveConflict } from '../../src/core/conflict.js';
import type { LocalSkill, RemoteSkill } from '../../src/types/sync.js';

function createLocalSkill(overrides: Partial<LocalSkill> = {}): LocalSkill {
  return {
    name: 'test-skill',
    relativePath: 'test-skill.md',
    fullPath: '/path/to/test-skill.md',
    content: '# Test Skill',
    hash: 'abc123',
    modifiedAt: new Date('2024-01-01'),
    size: 100,
    ...overrides,
  };
}

function createRemoteSkill(overrides: Partial<RemoteSkill> = {}): RemoteSkill {
  return {
    id: 'remote-1',
    name: 'test-skill',
    relativePath: 'test-skill.md',
    content: '# Test Skill',
    hash: 'abc123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    metadata: {},
    ...overrides,
  };
}

describe('detectConflicts', () => {
  it('should detect conflict when both local and remote changed', () => {
    const local = [createLocalSkill({ hash: 'local-new' })];
    const remote = [createRemoteSkill({ hash: 'remote-new' })];
    const lastSyncHashes = { 'test-skill.md': 'original' };

    const conflicts = detectConflicts(local, remote, lastSyncHashes);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.skillName).toBe('test-skill');
    expect(conflicts[0]?.type).toBe('content');
  });

  it('should not detect conflict when only local changed', () => {
    const local = [createLocalSkill({ hash: 'local-new' })];
    const remote = [createRemoteSkill({ hash: 'original' })];
    const lastSyncHashes = { 'test-skill.md': 'original' };

    const conflicts = detectConflicts(local, remote, lastSyncHashes);

    expect(conflicts).toHaveLength(0);
  });

  it('should not detect conflict when only remote changed', () => {
    const local = [createLocalSkill({ hash: 'original' })];
    const remote = [createRemoteSkill({ hash: 'remote-new' })];
    const lastSyncHashes = { 'test-skill.md': 'original' };

    const conflicts = detectConflicts(local, remote, lastSyncHashes);

    expect(conflicts).toHaveLength(0);
  });

  it('should not detect conflict when contents are same', () => {
    const local = [createLocalSkill({ hash: 'same' })];
    const remote = [createRemoteSkill({ hash: 'same' })];
    const lastSyncHashes = { 'test-skill.md': 'original' };

    const conflicts = detectConflicts(local, remote, lastSyncHashes);

    expect(conflicts).toHaveLength(0);
  });

  it('should handle new skills without last sync hash', () => {
    const local = [createLocalSkill({ hash: 'new' })];
    const remote = [createRemoteSkill({ hash: 'different' })];
    const lastSyncHashes = {};

    const conflicts = detectConflicts(local, remote, lastSyncHashes);

    expect(conflicts).toHaveLength(0);
  });
});

describe('resolveConflict', () => {
  const conflict = {
    skillName: 'test',
    relativePath: 'test.md',
    localVersion: createLocalSkill({ modifiedAt: new Date('2024-01-02') }),
    remoteVersion: createRemoteSkill({ updatedAt: new Date('2024-01-01') }),
    localModifiedAt: new Date('2024-01-02'),
    remoteModifiedAt: new Date('2024-01-01'),
    type: 'content' as const,
  };

  it('should resolve with local-wins strategy', () => {
    const result = resolveConflict(conflict, 'local-wins');
    expect(result).toBe('local');
  });

  it('should resolve with remote-wins strategy', () => {
    const result = resolveConflict(conflict, 'remote-wins');
    expect(result).toBe('remote');
  });

  it('should resolve with latest-wins when local is newer', () => {
    const result = resolveConflict(conflict, 'latest-wins');
    expect(result).toBe('local');
  });

  it('should resolve with latest-wins when remote is newer', () => {
    const olderConflict = {
      ...conflict,
      localModifiedAt: new Date('2024-01-01'),
      remoteModifiedAt: new Date('2024-01-02'),
    };
    const result = resolveConflict(olderConflict, 'latest-wins');
    expect(result).toBe('remote');
  });

  it('should throw for manual strategy', () => {
    expect(() => resolveConflict(conflict, 'manual')).toThrow('Manual resolution required');
  });
});

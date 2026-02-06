import { describe, it, expect } from 'vitest';
import { computeSyncDiff, getSyncSummary } from '../../src/core/diff.js';
import type { LocalSkill, RemoteSkill, SyncMetadata } from '../../src/types/sync.js';

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

describe('computeSyncDiff', () => {
  describe('when skills are in sync', () => {
    it('should mark skills as synced when hashes match', () => {
      const local = [createLocalSkill({ hash: 'same-hash' })];
      const remote = [createRemoteSkill({ hash: 'same-hash' })];

      const diff = computeSyncDiff(local, remote, null);

      expect(diff.synced).toContain('test-skill.md');
      expect(diff.toUpload).toHaveLength(0);
      expect(diff.toDownload).toHaveLength(0);
      expect(diff.conflicts).toHaveLength(0);
    });
  });

  describe('when local has new skills', () => {
    it('should mark new local skills for upload', () => {
      const local = [createLocalSkill({ relativePath: 'new-skill.md' })];
      const remote: RemoteSkill[] = [];

      const diff = computeSyncDiff(local, remote, null);

      expect(diff.toUpload).toHaveLength(1);
      expect(diff.toUpload[0]?.relativePath).toBe('new-skill.md');
    });
  });

  describe('when remote has new skills', () => {
    it('should mark new remote skills for download', () => {
      const local: LocalSkill[] = [];
      const remote = [createRemoteSkill({ relativePath: 'new-skill.md' })];

      const diff = computeSyncDiff(local, remote, null);

      expect(diff.toDownload).toHaveLength(1);
      expect(diff.toDownload[0]?.relativePath).toBe('new-skill.md');
    });
  });

  describe('when local is modified', () => {
    it('should mark locally modified skills for upload', () => {
      const local = [createLocalSkill({ hash: 'new-hash' })];
      const remote = [createRemoteSkill({ hash: 'old-hash' })];
      const metadata: SyncMetadata = {
        backend: 'supabase',
        lastSyncAt: new Date('2024-01-01'),
        skillHashes: { 'test-skill.md': 'old-hash' },
        skillTimestamps: {},
      };

      const diff = computeSyncDiff(local, remote, metadata);

      expect(diff.toUpload).toHaveLength(1);
    });
  });

  describe('when remote is modified', () => {
    it('should mark remotely modified skills for download', () => {
      const local = [createLocalSkill({ hash: 'old-hash' })];
      const remote = [createRemoteSkill({ hash: 'new-hash' })];
      const metadata: SyncMetadata = {
        backend: 'supabase',
        lastSyncAt: new Date('2024-01-01'),
        skillHashes: { 'test-skill.md': 'old-hash' },
        skillTimestamps: {},
      };

      const diff = computeSyncDiff(local, remote, metadata);

      expect(diff.toDownload).toHaveLength(1);
    });
  });

  describe('when both modified (conflict)', () => {
    it('should detect conflict when both local and remote are modified', () => {
      const local = [createLocalSkill({ hash: 'local-new-hash' })];
      const remote = [createRemoteSkill({ hash: 'remote-new-hash' })];
      const metadata: SyncMetadata = {
        backend: 'supabase',
        lastSyncAt: new Date('2024-01-01'),
        skillHashes: { 'test-skill.md': 'original-hash' },
        skillTimestamps: {},
      };

      const diff = computeSyncDiff(local, remote, metadata);

      expect(diff.conflicts).toHaveLength(1);
      expect(diff.conflicts[0]?.skillName).toBe('test-skill');
    });
  });

  describe('when local deleted', () => {
    it('should mark for remote deletion when local was deleted after sync', () => {
      const local: LocalSkill[] = [];
      const remote = [createRemoteSkill({ hash: 'same-hash' })];
      const metadata: SyncMetadata = {
        backend: 'supabase',
        lastSyncAt: new Date('2024-01-01'),
        skillHashes: { 'test-skill.md': 'same-hash' },
        skillTimestamps: {},
      };

      const diff = computeSyncDiff(local, remote, metadata);

      expect(diff.toDeleteRemote).toContain('test-skill.md');
    });
  });

  describe('when remote deleted', () => {
    it('should mark for local deletion when remote was deleted after sync', () => {
      const local = [createLocalSkill({ hash: 'same-hash' })];
      const remote: RemoteSkill[] = [];
      const metadata: SyncMetadata = {
        backend: 'supabase',
        lastSyncAt: new Date('2024-01-01'),
        skillHashes: { 'test-skill.md': 'same-hash' },
        skillTimestamps: {},
      };

      const diff = computeSyncDiff(local, remote, metadata);

      expect(diff.toDeleteLocal).toContain('test-skill.md');
    });
  });
});

describe('getSyncSummary', () => {
  it('should return summary message', () => {
    const diff = {
      toUpload: [createLocalSkill()],
      toDownload: [],
      toDeleteLocal: [],
      toDeleteRemote: [],
      conflicts: [],
      synced: ['skill1.md', 'skill2.md'],
    };

    const summary = getSyncSummary(diff);

    expect(summary).toContain('1 to upload');
    expect(summary).toContain('2 in sync');
  });

  it('should return "Nothing to sync" when empty', () => {
    const diff = {
      toUpload: [],
      toDownload: [],
      toDeleteLocal: [],
      toDeleteRemote: [],
      conflicts: [],
      synced: [],
    };

    const summary = getSyncSummary(diff);

    expect(summary).toBe('Nothing to sync');
  });
});

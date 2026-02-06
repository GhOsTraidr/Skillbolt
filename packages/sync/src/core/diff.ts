import type { LocalSkill, RemoteSkill, SyncMetadata, SyncDiff, Conflict } from '../types/sync.js';
import { hashesMatch } from '../utils/hash.js';

export function computeSyncDiff(
  localSkills: LocalSkill[],
  remoteSkills: RemoteSkill[],
  metadata: SyncMetadata | null
): SyncDiff {
  const localByPath = new Map(localSkills.map((s) => [s.relativePath, s]));
  const remoteByPath = new Map(remoteSkills.map((s) => [s.relativePath, s]));
  const lastSyncHashes = metadata?.skillHashes ?? {};

  const toUpload: LocalSkill[] = [];
  const toDownload: RemoteSkill[] = [];
  const toDeleteLocal: string[] = [];
  const toDeleteRemote: string[] = [];
  const conflicts: Conflict[] = [];
  const synced: string[] = [];

  const allPaths = new Set([...localByPath.keys(), ...remoteByPath.keys()]);

  for (const path of allPaths) {
    const local = localByPath.get(path);
    const remote = remoteByPath.get(path);
    const lastHash = lastSyncHashes[path];

    if (local && remote) {
      const localChanged = !lastHash || !hashesMatch(local.hash, lastHash);
      const remoteChanged = !lastHash || !hashesMatch(remote.hash, lastHash);

      if (hashesMatch(local.hash, remote.hash)) {
        synced.push(path);
      } else if (localChanged && remoteChanged) {
        conflicts.push(createConflict(local, remote));
      } else if (localChanged) {
        toUpload.push(local);
      } else if (remoteChanged) {
        toDownload.push(remote);
      } else {
        synced.push(path);
      }
    } else if (local && !remote) {
      if (lastHash) {
        if (hashesMatch(local.hash, lastHash)) {
          toDeleteLocal.push(path);
        } else {
          toUpload.push(local);
        }
      } else {
        toUpload.push(local);
      }
    } else if (!local && remote) {
      if (lastHash) {
        if (hashesMatch(remote.hash, lastHash)) {
          toDeleteRemote.push(path);
        } else {
          toDownload.push(remote);
        }
      } else {
        toDownload.push(remote);
      }
    }
  }

  return {
    toUpload,
    toDownload,
    toDeleteLocal,
    toDeleteRemote,
    conflicts,
    synced,
  };
}

function createConflict(local: LocalSkill, remote: RemoteSkill): Conflict {
  return {
    skillName: local.name,
    relativePath: local.relativePath,
    localVersion: local,
    remoteVersion: remote,
    localModifiedAt: local.modifiedAt,
    remoteModifiedAt: remote.updatedAt,
    type: 'content',
  };
}

export function getSyncSummary(diff: SyncDiff): string {
  const parts: string[] = [];

  if (diff.toUpload.length > 0) {
    parts.push(`${diff.toUpload.length} to upload`);
  }
  if (diff.toDownload.length > 0) {
    parts.push(`${diff.toDownload.length} to download`);
  }
  if (diff.toDeleteLocal.length > 0) {
    parts.push(`${diff.toDeleteLocal.length} to delete locally`);
  }
  if (diff.toDeleteRemote.length > 0) {
    parts.push(`${diff.toDeleteRemote.length} to delete remotely`);
  }
  if (diff.conflicts.length > 0) {
    parts.push(`${diff.conflicts.length} conflicts`);
  }
  if (diff.synced.length > 0) {
    parts.push(`${diff.synced.length} in sync`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Nothing to sync';
}

import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { expandTilde } from '@skillbolt/core';

import type {
  Conflict,
  ResolvedConflict,
  ConflictStrategy,
  LocalSkill,
  RemoteSkill,
} from '../types/sync.js';

export function detectConflicts(
  localSkills: LocalSkill[],
  remoteSkills: RemoteSkill[],
  lastSyncHashes: Record<string, string>
): Conflict[] {
  const conflicts: Conflict[] = [];
  const remoteByPath = new Map(remoteSkills.map((s) => [s.relativePath, s]));

  for (const local of localSkills) {
    const remote = remoteByPath.get(local.relativePath);
    if (!remote) continue;

    const lastHash = lastSyncHashes[local.relativePath];
    if (!lastHash) continue;

    const localChanged = local.hash !== lastHash;
    const remoteChanged = remote.hash !== lastHash;
    const contentsDiffer = local.hash !== remote.hash;

    if (localChanged && remoteChanged && contentsDiffer) {
      conflicts.push({
        skillName: local.name,
        relativePath: local.relativePath,
        localVersion: local,
        remoteVersion: remote,
        localModifiedAt: local.modifiedAt,
        remoteModifiedAt: remote.updatedAt,
        type: 'content',
      });
    }
  }

  return conflicts;
}

export function resolveConflict(
  conflict: Conflict,
  strategy: ConflictStrategy
): 'local' | 'remote' {
  switch (strategy) {
    case 'local-wins':
      return 'local';
    case 'remote-wins':
      return 'remote';
    case 'latest-wins':
      return conflict.localModifiedAt > conflict.remoteModifiedAt ? 'local' : 'remote';
    case 'manual':
      throw new Error('Manual resolution required');
    default:
      throw new Error(`Unknown conflict strategy: ${strategy as string}`);
  }
}

export async function resolveConflictWithBackup(
  conflict: Conflict,
  resolution: 'local' | 'remote',
  backupDir: string
): Promise<ResolvedConflict> {
  const expandedBackupDir = expandTilde(backupDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupSubdir = join(expandedBackupDir, 'conflicts', timestamp);

  await mkdir(backupSubdir, { recursive: true });

  const localBackupPath = join(backupSubdir, `${conflict.skillName}.local.md`);
  const remoteBackupPath = join(backupSubdir, `${conflict.skillName}.remote.md`);

  await writeFile(localBackupPath, conflict.localVersion.content, 'utf8');
  await writeFile(remoteBackupPath, conflict.remoteVersion.content, 'utf8');

  const metadataPath = join(backupSubdir, `${conflict.skillName}.meta.json`);
  await writeFile(
    metadataPath,
    JSON.stringify(
      {
        skillName: conflict.skillName,
        relativePath: conflict.relativePath,
        resolution,
        localModifiedAt: conflict.localModifiedAt.toISOString(),
        remoteModifiedAt: conflict.remoteModifiedAt.toISOString(),
        resolvedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  );

  return {
    conflict,
    resolution,
    backupPath: backupSubdir,
  };
}

export async function createConflictBackup(conflict: Conflict, backupDir: string): Promise<string> {
  const expandedBackupDir = expandTilde(backupDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(expandedBackupDir, 'conflicts', `${conflict.skillName}-${timestamp}`);

  await mkdir(dirname(backupPath), { recursive: true });

  const localPath = `${backupPath}.local.md`;
  const remotePath = `${backupPath}.remote.md`;

  await writeFile(localPath, conflict.localVersion.content, 'utf8');
  await writeFile(remotePath, conflict.remoteVersion.content, 'utf8');

  return backupPath;
}

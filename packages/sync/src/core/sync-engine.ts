import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { expandTilde } from '@skillbolt/core';

import type { Backend } from '../types/backend.js';
import type {
  LocalSkill,
  RemoteSkill,
  SyncMetadata,
  SyncResult,
  SyncDiff,
  PushOptions,
  PullOptions,
  OverallStatus,
  SkillStatus,
  SyncStatus,
} from '../types/sync.js';
import type { SyncConfiguration } from '../types/config.js';
import { DEFAULT_SYNC_CONFIG } from '../types/config.js';
import { computeSyncDiff } from './diff.js';
import { resolveConflict, resolveConflictWithBackup } from './conflict.js';
import { scanLocalSkills, filterSkills } from '../utils/scanner.js';
import { checkNetworkConnectivity } from '../utils/network.js';

export class SyncEngine {
  private backend: Backend;
  private config: SyncConfiguration;

  constructor(backend: Backend, config: Partial<SyncConfiguration> = {}) {
    this.backend = backend;
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
  }

  async push(options: PushOptions = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const result = this.createEmptyResult();

    try {
      if (!this.backend.isAuthenticated()) {
        throw new Error('Backend not authenticated');
      }

      const isOnline = await checkNetworkConnectivity();
      if (!isOnline) {
        throw new Error('No network connectivity');
      }

      const skillsDir = options.skillsDir ?? this.config.skillsDir;
      const expandedDir = expandTilde(skillsDir);

      let localSkills = await scanLocalSkills(expandedDir, {
        include: this.config.include,
        exclude: this.config.exclude,
      });

      localSkills = filterSkills(localSkills, options.include, options.exclude);

      const remoteSkills = await this.backend.list();
      const metadata = await this.backend.getMetadata();

      const diff = computeSyncDiff(localSkills, remoteSkills, metadata);

      if (options.dryRun) {
        return this.createDryRunResult(diff, startTime);
      }

      for (const skill of diff.toUpload) {
        const uploadResult = await this.backend.put(skill);
        if (uploadResult.success) {
          result.uploaded++;
          result.messages.push(`Uploaded: ${skill.relativePath}`);
        } else {
          result.errors.push(new Error(uploadResult.error ?? 'Upload failed'));
          result.messages.push(`Failed to upload: ${skill.relativePath}`);
        }
      }

      if (options.force) {
        for (const conflict of diff.conflicts) {
          const uploadResult = await this.backend.put(conflict.localVersion);
          if (uploadResult.success) {
            result.uploaded++;
            result.messages.push(`Force uploaded (conflict): ${conflict.relativePath}`);
          }
        }
      } else {
        result.conflicts = diff.conflicts.length;
        result.skipped = diff.conflicts.length;
      }

      if (options.deleteRemote) {
        for (const path of diff.toDeleteRemote) {
          const deleteResult = await this.backend.delete(path);
          if (deleteResult.success) {
            result.deletedRemote++;
            result.messages.push(`Deleted remote: ${path}`);
          }
        }
      }

      await this.updateMetadata(localSkills, diff);

      result.success = result.errors.length === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async pull(options: PullOptions = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const result = this.createEmptyResult();

    try {
      if (!this.backend.isAuthenticated()) {
        throw new Error('Backend not authenticated');
      }

      const isOnline = await checkNetworkConnectivity();
      if (!isOnline) {
        throw new Error('No network connectivity');
      }

      const skillsDir = options.skillsDir ?? this.config.skillsDir;
      const expandedDir = expandTilde(skillsDir);

      const localSkills = await scanLocalSkills(expandedDir, {
        include: this.config.include,
        exclude: this.config.exclude,
      });

      let remoteSkills = await this.backend.list();
      remoteSkills = filterSkills(remoteSkills, options.include, options.exclude);

      const metadata = await this.backend.getMetadata();
      const diff = computeSyncDiff(localSkills, remoteSkills, metadata);

      if (options.dryRun) {
        return this.createDryRunResult(diff, startTime);
      }

      for (const skill of diff.toDownload) {
        try {
          await this.writeSkillFile(expandedDir, skill);
          result.downloaded++;
          result.messages.push(`Downloaded: ${skill.relativePath}`);
        } catch (error) {
          result.errors.push(error instanceof Error ? error : new Error(String(error)));
          result.messages.push(`Failed to download: ${skill.relativePath}`);
        }
      }

      if (options.force) {
        for (const conflict of diff.conflicts) {
          try {
            if (this.config.backup.onConflict) {
              await resolveConflictWithBackup(conflict, 'remote', this.config.backup.directory);
            }
            await this.writeSkillFile(expandedDir, conflict.remoteVersion);
            result.downloaded++;
            result.messages.push(`Force downloaded (conflict): ${conflict.relativePath}`);
          } catch (error) {
            result.errors.push(error instanceof Error ? error : new Error(String(error)));
          }
        }
      } else if (diff.conflicts.length > 0) {
        const resolved = await this.handleConflicts(diff.conflicts, expandedDir);
        result.downloaded += resolved.downloaded;
        result.conflicts = resolved.conflicts;
        result.skipped = resolved.skipped;
        result.messages.push(...resolved.messages);
      }

      if (options.deleteLocal) {
        for (const path of diff.toDeleteLocal) {
          try {
            const fullPath = join(expandedDir, path);
            await rm(fullPath, { force: true });
            result.deletedLocal++;
            result.messages.push(`Deleted local: ${path}`);
          } catch (error) {
            result.errors.push(error instanceof Error ? error : new Error(String(error)));
          }
        }
      }

      const updatedLocalSkills = await scanLocalSkills(expandedDir, {
        include: this.config.include,
        exclude: this.config.exclude,
      });
      await this.updateMetadata(updatedLocalSkills, diff);

      result.success = result.errors.length === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async status(skillsDir?: string): Promise<OverallStatus> {
    const dir = skillsDir ?? this.config.skillsDir;
    const expandedDir = expandTilde(dir);

    const localSkills = await scanLocalSkills(expandedDir, {
      include: this.config.include,
      exclude: this.config.exclude,
    });

    let remoteSkills: RemoteSkill[] = [];
    let metadata: SyncMetadata | null = null;

    if (this.backend.isAuthenticated()) {
      try {
        remoteSkills = await this.backend.list();
        metadata = await this.backend.getMetadata();
      } catch {
        // Ignore errors, just show local status
      }
    }

    const diff = computeSyncDiff(localSkills, remoteSkills, metadata);
    const skills = this.buildSkillStatuses(localSkills, remoteSkills, diff, metadata);

    return {
      backend: this.config.backend,
      authenticated: this.backend.isAuthenticated(),
      lastSyncAt: metadata?.lastSyncAt ?? null,
      totalLocal: localSkills.length,
      totalRemote: remoteSkills.length,
      synced: diff.synced.length,
      modifiedLocal: diff.toUpload.length,
      modifiedRemote: diff.toDownload.length,
      newLocal: diff.toUpload.filter((s) => !metadata?.skillHashes[s.relativePath]).length,
      newRemote: diff.toDownload.filter((s) => !metadata?.skillHashes[s.relativePath]).length,
      conflicts: diff.conflicts.length,
      skills,
    };
  }

  getBackend(): Backend {
    return this.backend;
  }

  getConfig(): SyncConfiguration {
    return this.config;
  }

  private createEmptyResult(): SyncResult {
    return {
      success: false,
      uploaded: 0,
      downloaded: 0,
      deletedLocal: 0,
      deletedRemote: 0,
      conflicts: 0,
      skipped: 0,
      messages: [],
      errors: [],
      duration: 0,
    };
  }

  private createDryRunResult(diff: SyncDiff, startTime: number): SyncResult {
    const result = this.createEmptyResult();
    result.success = true;
    result.uploaded = diff.toUpload.length;
    result.downloaded = diff.toDownload.length;
    result.deletedLocal = diff.toDeleteLocal.length;
    result.deletedRemote = diff.toDeleteRemote.length;
    result.conflicts = diff.conflicts.length;

    result.messages.push(
      '[DRY RUN] Would upload:',
      ...diff.toUpload.map((s) => `  - ${s.relativePath}`)
    );
    result.messages.push(
      '[DRY RUN] Would download:',
      ...diff.toDownload.map((s) => `  - ${s.relativePath}`)
    );
    result.messages.push(
      '[DRY RUN] Would delete local:',
      ...diff.toDeleteLocal.map((p) => `  - ${p}`)
    );
    result.messages.push(
      '[DRY RUN] Would delete remote:',
      ...diff.toDeleteRemote.map((p) => `  - ${p}`)
    );
    result.messages.push(
      '[DRY RUN] Conflicts:',
      ...diff.conflicts.map((c) => `  - ${c.relativePath}`)
    );

    result.duration = Date.now() - startTime;
    return result;
  }

  private async writeSkillFile(baseDir: string, skill: RemoteSkill): Promise<void> {
    const fullPath = join(baseDir, skill.relativePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, skill.content, 'utf8');
  }

  private async handleConflicts(
    conflicts: SyncDiff['conflicts'],
    baseDir: string
  ): Promise<{ downloaded: number; conflicts: number; skipped: number; messages: string[] }> {
    const strategy = this.config.conflictStrategy;
    const messages: string[] = [];
    let downloaded = 0;
    let skipped = 0;

    if (strategy === 'manual') {
      return {
        downloaded: 0,
        conflicts: conflicts.length,
        skipped: conflicts.length,
        messages: conflicts.map((c) => `Conflict (manual resolution required): ${c.relativePath}`),
      };
    }

    for (const conflict of conflicts) {
      try {
        const resolution = resolveConflict(conflict, strategy);

        if (this.config.backup.onConflict) {
          await resolveConflictWithBackup(conflict, resolution, this.config.backup.directory);
        }

        if (resolution === 'remote') {
          await this.writeSkillFile(baseDir, conflict.remoteVersion);
          downloaded++;
          messages.push(`Resolved (${strategy}): ${conflict.relativePath} -> remote`);
        } else {
          messages.push(
            `Resolved (${strategy}): ${conflict.relativePath} -> local (no download needed)`
          );
        }
      } catch (error) {
        skipped++;
        messages.push(`Failed to resolve: ${conflict.relativePath} - ${(error as Error).message}`);
      }
    }

    return { downloaded, conflicts: conflicts.length, skipped, messages };
  }

  private async updateMetadata(localSkills: LocalSkill[], diff: SyncDiff): Promise<void> {
    const skillHashes: Record<string, string> = {};
    const skillTimestamps: Record<string, string> = {};

    for (const skill of localSkills) {
      skillHashes[skill.relativePath] = skill.hash;
      skillTimestamps[skill.relativePath] = skill.modifiedAt.toISOString();
    }

    for (const skill of diff.toDownload) {
      skillHashes[skill.relativePath] = skill.hash;
      skillTimestamps[skill.relativePath] = skill.updatedAt.toISOString();
    }

    const metadata: SyncMetadata = {
      backend: this.config.backend,
      lastSyncAt: new Date(),
      skillHashes,
      skillTimestamps,
    };

    await this.backend.setMetadata(metadata);
  }

  private buildSkillStatuses(
    localSkills: LocalSkill[],
    remoteSkills: RemoteSkill[],
    diff: SyncDiff,
    metadata: SyncMetadata | null
  ): SkillStatus[] {
    const statuses: SkillStatus[] = [];
    const localByPath = new Map(localSkills.map((s) => [s.relativePath, s]));
    const remoteByPath = new Map(remoteSkills.map((s) => [s.relativePath, s]));

    const allPaths = new Set([...localByPath.keys(), ...remoteByPath.keys()]);

    for (const path of allPaths) {
      const local = localByPath.get(path);
      const remote = remoteByPath.get(path);
      const lastHash = metadata?.skillHashes[path];

      let status: SyncStatus;

      if (diff.synced.includes(path)) {
        status = 'synced';
      } else if (diff.conflicts.some((c) => c.relativePath === path)) {
        status = 'conflict';
      } else if (diff.toUpload.some((s) => s.relativePath === path)) {
        status = lastHash ? 'modified-local' : 'new-local';
      } else if (diff.toDownload.some((s) => s.relativePath === path)) {
        status = lastHash ? 'modified-remote' : 'new-remote';
      } else if (diff.toDeleteLocal.includes(path)) {
        status = 'deleted-remote';
      } else if (diff.toDeleteRemote.includes(path)) {
        status = 'deleted-local';
      } else {
        status = 'synced';
      }

      statuses.push({
        name: local?.name ?? remote?.name ?? path,
        status,
        localHash: local?.hash,
        remoteHash: remote?.hash,
        lastSyncedHash: lastHash,
        localModifiedAt: local?.modifiedAt,
        remoteModifiedAt: remote?.updatedAt,
      });
    }

    return statuses;
  }
}

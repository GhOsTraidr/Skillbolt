import type { InstallOptions, InstallResult } from '../types/registry.js';
import { LocalStorage } from '../storage/local.js';
import { MetadataManager } from '../storage/metadata.js';
import { withLock } from '../storage/lock.js';
import {
  resolveInstallTarget,
  isLocalSource,
  isGitHubSource,
  isRegistrySource,
} from '../installer/resolver.js';
import { installFromLocal } from '../installer/local.js';
import { installFromGitHub } from '../installer/github.js';
import { installFromRegistry } from '../installer/remote.js';

export async function installSkill(options: InstallOptions): Promise<InstallResult> {
  const { target, version, link = false, force = false, storagePath } = options;

  const storage = new LocalStorage(storagePath);
  const metadata = new MetadataManager();

  return withLock('install', async () => {
    const resolved = resolveInstallTarget(target);
    const targetVersion = version ?? resolved.version;

    if (isLocalSource(resolved.source)) {
      return installFromLocal({
        sourcePath: resolved.source.path,
        mode: link ? 'link' : 'copy',
        force,
        storage,
        metadata,
      });
    }

    if (isGitHubSource(resolved.source)) {
      return installFromGitHub({
        repo: resolved.source.repo,
        ref: targetVersion ?? resolved.source.ref,
        subdirectory: resolved.source.subdirectory,
        force,
        storage,
        metadata,
      });
    }

    if (isRegistrySource(resolved.source)) {
      return installFromRegistry({
        name: resolved.source.name,
        version: targetVersion,
        force,
        storage,
        metadata,
      });
    }

    return {
      success: false,
      message: `Unknown install source type`,
    };
  });
}

import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { exists } from '@skillbolt/core';

import type { InstalledSkill, InstallResult } from '../types/registry.js';
import { LocalStorage, getDefaultCachePath } from '../storage/local.js';
import { MetadataManager } from '../storage/metadata.js';
import { validateSkillDirectory } from './validator.js';
import { normalizeVersion } from '../utils/version.js';
import { downloadFile, getTempDownloadPath } from '../utils/download.js';
import { extractTarball, getTempExtractPath } from '../utils/archive.js';

export interface GitHubInstallOptions {
  repo: string;
  ref?: string;
  subdirectory?: string;
  force?: boolean;
  storage?: LocalStorage;
  metadata?: MetadataManager;
  cachePath?: string;
}

export async function installFromGitHub(options: GitHubInstallOptions): Promise<InstallResult> {
  const {
    repo,
    ref = 'main',
    subdirectory,
    force = false,
    storage,
    metadata,
    cachePath = getDefaultCachePath(),
  } = options;

  const tarballUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.tar.gz`;
  const tagTarballUrl = `https://github.com/${repo}/archive/refs/tags/${ref}.tar.gz`;

  const downloadPath = getTempDownloadPath(cachePath, `${repo.replace('/', '-')}-${ref}.tar.gz`);
  const extractPath = getTempExtractPath(cachePath, repo.replace('/', '-'));

  try {
    let downloadResult;
    try {
      downloadResult = await downloadFile(tarballUrl, downloadPath);
    } catch {
      downloadResult = await downloadFile(tagTarballUrl, downloadPath);
    }

    await extractTarball(downloadResult.path, extractPath);

    // 如果指定了子目录，则在子目录中查找 skill
    const skillPath = subdirectory ? join(extractPath, subdirectory) : extractPath;

    const validation = await validateSkillDirectory(skillPath);
    if (!validation.valid || !validation.manifest) {
      return {
        success: false,
        message: validation.error ?? `Invalid skill in repository: ${repo}${subdirectory ? ` (subdirectory: ${subdirectory})` : ''}`,
      };
    }

    const { manifest } = validation;
    const skillName = manifest.name;

    const localStorage = storage ?? new LocalStorage();
    const metadataManager = metadata ?? new MetadataManager();

    const existingSkill = await metadataManager.getSkill(skillName);
    if (existingSkill && !force) {
      return {
        success: false,
        message: `Skill "${skillName}" is already installed. Use --force to overwrite.`,
      };
    }

    // 从实际的 skillPath 保存，而不是从 extractPath
    const installedPath = await localStorage.saveSkill(skillName, skillPath, 'copy');
    const now = new Date().toISOString();

    const installedSkill: InstalledSkill = {
      name: skillName,
      version: normalizeVersion(manifest.version),
      source: { type: 'github', repo, ref, subdirectory },
      path: installedPath,
      installedAt: existingSkill?.installedAt ?? now,
      updatedAt: now,
      mode: 'copy',
      manifest: {
        description: manifest.description,
        author: manifest.author,
        tags: manifest.tags,
        platform: manifest.platform,
      },
    };

    await metadataManager.addSkill(installedSkill);

    const sourceDisplay = subdirectory ? `github:${repo}/${subdirectory}@${ref}` : `github:${repo}@${ref}`;

    return {
      success: true,
      skill: installedSkill,
      message: existingSkill
        ? `Updated skill "${skillName}" from ${sourceDisplay}`
        : `Installed skill "${skillName}" from ${sourceDisplay}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to install from GitHub: ${(error as Error).message}`,
      error: error as Error,
    };
  } finally {
    if (await exists(downloadPath)) {
      await rm(downloadPath, { force: true });
    }
    if (await exists(extractPath)) {
      await rm(extractPath, { recursive: true, force: true });
    }
  }
}

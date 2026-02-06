import { resolve } from 'node:path';
import { expandTilde } from '@skillbolt/core';

import type { InstalledSkill, InstallMode, InstallResult } from '../types/registry.js';
import { LocalStorage } from '../storage/local.js';
import { MetadataManager } from '../storage/metadata.js';
import { validateSkillDirectory } from './validator.js';
import { normalizeVersion } from '../utils/version.js';

export interface LocalInstallOptions {
  sourcePath: string;
  mode: InstallMode;
  force?: boolean;
  storage?: LocalStorage;
  metadata?: MetadataManager;
}

export async function installFromLocal(options: LocalInstallOptions): Promise<InstallResult> {
  const { sourcePath, mode, force = false, storage, metadata } = options;

  const resolvedPath = resolve(expandTilde(sourcePath));

  const validation = await validateSkillDirectory(resolvedPath);
  if (!validation.valid || !validation.manifest) {
    return {
      success: false,
      message: validation.error ?? 'Invalid skill directory',
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

  try {
    const installedPath = await localStorage.saveSkill(skillName, resolvedPath, mode);
    const now = new Date().toISOString();

    const installedSkill: InstalledSkill = {
      name: skillName,
      version: normalizeVersion(manifest.version),
      source: { type: 'local', path: resolvedPath },
      path: installedPath,
      installedAt: existingSkill?.installedAt ?? now,
      updatedAt: now,
      mode,
      manifest: {
        description: manifest.description,
        author: manifest.author,
        tags: manifest.tags,
        platform: manifest.platform,
      },
    };

    await metadataManager.addSkill(installedSkill);

    return {
      success: true,
      skill: installedSkill,
      message: existingSkill
        ? `Updated skill "${skillName}" from local path`
        : `Installed skill "${skillName}" from local path`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to install skill: ${(error as Error).message}`,
      error: error as Error,
    };
  }
}

import type {
  UpdateOptions,
  UpdateResult,
  InstalledSkill,
  OutdatedSkill,
} from '../types/registry.js';
import { LocalStorage } from '../storage/local.js';
import { MetadataManager } from '../storage/metadata.js';
import { withLock } from '../storage/lock.js';
import { installFromGitHub } from '../installer/github.js';
import { installFromRegistry } from '../installer/remote.js';
import { SkillHubClient } from '../api/client.js';
import { isGreaterThan, getUpdateType } from '../utils/version.js';

const DEFAULT_REGISTRY_URL = 'https://skillbolt.com/api';

export async function updateSkill(options: UpdateOptions): Promise<UpdateResult[]> {
  const { name, version, force = false, storagePath } = options;

  const storage = new LocalStorage(storagePath);
  const metadata = new MetadataManager();

  return withLock('update', async () => {
    const skills = await metadata.listSkills();

    if (skills.length === 0) {
      return [
        {
          success: false,
          message: 'No skills installed',
        },
      ];
    }

    const skillsToUpdate = name ? skills.filter((s) => s.name === name) : skills;

    if (skillsToUpdate.length === 0) {
      return [
        {
          success: false,
          message: `Skill "${name}" not found`,
        },
      ];
    }

    const results: UpdateResult[] = [];

    for (const skill of skillsToUpdate) {
      const result = await updateSingleSkill(skill, {
        version,
        force,
        storage,
        metadata,
      });
      results.push(result);
    }

    return results;
  });
}

interface UpdateSingleOptions {
  version?: string;
  force: boolean;
  storage: LocalStorage;
  metadata: MetadataManager;
}

async function updateSingleSkill(
  skill: InstalledSkill,
  options: UpdateSingleOptions
): Promise<UpdateResult> {
  const { version, force, storage, metadata } = options;

  if (skill.source.type === 'local') {
    return {
      success: false,
      message: `Skill "${skill.name}" was installed from local path and cannot be updated automatically`,
    };
  }

  const previousVersion = skill.version;

  if (skill.source.type === 'github') {
    const result = await installFromGitHub({
      repo: skill.source.repo,
      ref: version ?? skill.source.ref ?? 'main',
      force: true,
      storage,
      metadata,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        error: result.error,
      };
    }

    return {
      success: true,
      skill: result.skill,
      previousVersion,
      message: `Updated "${skill.name}" from github:${skill.source.repo}`,
    };
  }

  if (skill.source.type === 'registry') {
    const client = new SkillHubClient({ baseUrl: DEFAULT_REGISTRY_URL });
    const latestVersion = await client.getLatestVersion(skill.name);

    if (!latestVersion) {
      return {
        success: false,
        message: `Could not find latest version for "${skill.name}"`,
      };
    }

    if (!force && !isGreaterThan(latestVersion, skill.version)) {
      return {
        success: true,
        skill,
        message: `"${skill.name}" is already at the latest version (${skill.version})`,
      };
    }

    const result = await installFromRegistry({
      name: skill.name,
      version: version ?? latestVersion,
      force: true,
      storage,
      metadata,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        error: result.error,
      };
    }

    return {
      success: true,
      skill: result.skill,
      previousVersion,
      message: `Updated "${skill.name}" from ${previousVersion} to ${result.skill?.version}`,
    };
  }

  return {
    success: false,
    message: `Unknown source type for skill "${skill.name}"`,
  };
}

export async function checkOutdated(_storagePath?: string): Promise<OutdatedSkill[]> {
  const metadata = new MetadataManager();
  const skills = await metadata.listSkills();
  const client = new SkillHubClient({ baseUrl: DEFAULT_REGISTRY_URL });

  const outdated: OutdatedSkill[] = [];

  for (const skill of skills) {
    if (skill.source.type !== 'registry') {
      continue;
    }

    try {
      const latestVersion = await client.getLatestVersion(skill.name);
      if (latestVersion && isGreaterThan(latestVersion, skill.version)) {
        const updateType = getUpdateType(skill.version, latestVersion);
        if (updateType) {
          outdated.push({
            name: skill.name,
            currentVersion: skill.version,
            latestVersion,
            updateType,
          });
        }
      }
    } catch {
      continue;
    }
  }

  return outdated;
}

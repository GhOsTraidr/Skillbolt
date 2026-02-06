import { join } from 'path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { exists } from '@skillbolt/core';

import type { InstalledSkill, InstallResult } from '../types/registry.js';
import { LocalStorage, getDefaultCachePath } from '../storage/local.js';
import { MetadataManager } from '../storage/metadata.js';
import { validateSkillDirectory } from './validator.js';
// import { getMaxSatisfying } from '../utils/version.js';
// import { downloadFile, getTempDownloadPath } from '../utils/download.js';
// import { extractTarball, getTempExtractPath } from '../utils/archive.js';
import { SkillHubClient } from '../api/client.js';
import type { ApiClientConfig } from '../types/api.js';

export interface RemoteInstallOptions {
  name: string;
  version?: string;
  force?: boolean;
  storage?: LocalStorage;
  metadata?: MetadataManager;
  cachePath?: string;
  apiConfig?: ApiClientConfig;
}

const DEFAULT_REGISTRY_URL = 'https://skillbolt.com/api';

export async function installFromRegistry(options: RemoteInstallOptions): Promise<InstallResult> {
  const {
    name,
    version,
    force = false,
    storage,
    metadata,
    cachePath = getDefaultCachePath(),
    apiConfig,
  } = options;

  const client = new SkillHubClient(apiConfig ?? { baseUrl: DEFAULT_REGISTRY_URL });

  try {
    // 1. 从注册表获取技能详情（使用原有方法）
    const skillDetails = await client.getSkillDetails(name);
    if (!skillDetails) {
      return {
        success: false,
        message: `Skill "${name}" not found in registry`,
      };
    }

    // 提取核心数据
    const skillData = skillDetails.skill;
    // 简化版本处理（API返回中无版本信息，使用传入的version或默认值）
    const targetVersion = version || '0.0.0';

    // 2. 检查是否已安装（保留原有逻辑）
    const metadataManager = metadata ?? new MetadataManager();
    const existingSkill = await metadataManager.getSkill(name);

    if (existingSkill && !force) {
      if (existingSkill.version === targetVersion) {
        return {
          success: false,
          message: `Skill "${name}@${targetVersion}" is already installed`,
        };
      }
    }

    // 3. 准备存储并写入SKILL.md文件（核心修改部分）
    // 定义临时缓存目录路径：cachePath/<name>/SKILL.md（必须是目录，符合saveSkill要求）
    const tempSkillDir = join(cachePath, name, 'SKILL.md');
    const tempMdFilePath = join(tempSkillDir, 'SKILL.md'); // 实际存放md内容的文件

    // 清理旧的临时目录（避免残留）
    if (await exists(tempSkillDir)) {
      await rm(tempSkillDir, { recursive: true, force: true });
    }

    // 创建临时目录结构（确保是目录，满足saveSkill对sourcePath的要求）
    await mkdir(tempSkillDir, { recursive: true });

    // 将skill_md_raw内容写入临时目录下的SKILL.md文件
    await writeFile(tempMdFilePath, skillData.skill_md_raw, 'utf8');

    const validation = await validateSkillDirectory(tempSkillDir);
    if (!validation.valid || !validation.manifest) {
      return {
        success: false,
        message: validation.error ?? `Invalid skill package: ${name}`,
      };
    }

    // 调用saveSkill接口（mode固定为copy，传入临时目录路径）
    const localStorage = storage ?? new LocalStorage();
    const installedPath = await localStorage.saveSkill(name, tempSkillDir, 'copy');

    // 4. 更新元数据（调整适配新的文件存储逻辑）
    const now = new Date().toISOString();
    const installedSkill: InstalledSkill = {
      name,
      version: targetVersion,
      source: { type: 'registry', name },
      path: installedPath,
      installedAt: existingSkill?.installedAt ?? now,
      updatedAt: now,
      mode: 'copy', // 修改模式标识为文件存储
      manifest: {
        description: skillData.description,
        author: skillData.author,
        tags: skillData.tags,
        platform: ['all'],
      },
    };

    await metadataManager.addSkill(installedSkill);

    // 5. 返回成功结果
    return {
      success: true,
      skill: installedSkill,
      message: existingSkill
        ? `Updated skill "${name}" to version ${targetVersion}`
        : `Installed skill "${name}@${targetVersion}" to ${installedPath}`,
    };
  } catch (error) {
    // 保留原有错误处理逻辑
    console.error('Registry API Error:', error);
    console.error('Error Stack:', (error as Error).stack);
    return {
      success: false,
      message: `Failed to install from registry: ${(error as Error).message}`,
      error: error as Error,
    };
  }
}

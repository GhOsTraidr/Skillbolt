# @skillbolt/registry

技能注册表管理工具，支持从远程仓库、GitHub 或本地安装、更新和管理技能。

## 功能特性

- **多源安装**: 支持从注册表、GitHub、本地路径安装技能
- **版本管理**: 支持版本安装、更新和检查过时技能
- **依赖管理**: 自动处理技能依赖
- **缓存系统**: 优化下载和安装速度
- **元数据管理**: 维护技能的安装信息和版本
- **搜索功能**: 在注册表中搜索技能
- **卸载管理**: 安全地卸载技能及其依赖

## 基本使用

### CLI 使用

```bash
# 从注册表安装
skill install git-workflow

# 从 GitHub 安装
skill install github:user/repo
skill install https://github.com/user/repo

# 从本地安装
skill install ./local-skill
skill install /path/to/skill

# 列出已安装的技能
skill list

# 更新技能
skill update git-workflow

# 检查过时的技能
skill outdated

# 卸载技能
skill remove git-workflow
```

### API 使用

```typescript
import {
  installSkill,
  listSkills,
  updateSkill,
  checkOutdated,
  uninstallSkill
} from '@skillbolt/registry';

// 安装技能
const result = await installSkill('git-workflow', {
  source: 'registry',
  version: '1.0.0'
});
console.log(result.success);

// 列出技能
const skills = await listSkills();
skills.forEach(skill => {
  console.log(`${skill.name} v${skill.version}`);
});

// 更新技能
const updateResult = await updateSkill('git-workflow');
console.log(updateResult.updated);

// 检查过时
const outdated = await checkOutdated();
outdated.forEach(skill => {
  console.log(`${skill.name}: ${skill.current} -> ${skill.latest}`);
});

// 卸载技能
await uninstallSkill('git-workflow');
```

## 安装源

### 从注册表安装

```typescript
import { installSkill } from '@skillbolt/registry';

await installSkill('git-workflow', {
  source: 'registry',
  version: '1.0.0',
  cache: true
});
```

### 从 GitHub 安装

```typescript
import { installSkill } from '@skillbolt/registry';

// 使用 owner/repo 格式
await installSkill('github:owner/repo', {
  branch: 'main'
});

// 使用完整 URL
await installSkill('https://github.com/owner/repo', {
  version: 'v1.0.0'
});

// 指定子目录
await installSkill('github:owner/repo#subdir', {});
```

### 从本地安装

```typescript
import { installSkill } from '@skillbolt/registry';

// 从目录安装
await installSkill('./local-skill', {
  source: 'local'
});

// 从 tarball 安装
await installSkill('./skill-1.0.0.tgz', {
  source: 'local'
});
```

## 版本管理

### 指定版本

```typescript
import { installSkill } from '@skillbolt/registry';

// 安装特定版本
await installSkill('git-workflow@1.0.0');

// 使用版本范围
await installSkill('git-workflow@^1.0.0');
await installSkill('git-workflow@~2.0.0');

// 安装最新版本
await installSkill('git-workflow@latest');
```

### 检查版本

```typescript
import {
  installSkill,
  checkOutdated,
  getSkillManifest
} from '@skillbolt/registry';

// 获取技能清单
const manifest = await getSkillManifest('git-workflow');
console.log(manifest.version);
console.log(manifest.dependencies);

// 检查是否过时
const outdated = await checkOutdated();
const skill = outdated.find(s => s.name === 'git-workflow');
if (skill) {
  console.log(`Current: ${skill.current}, Latest: ${skill.latest}`);
  console.log(`Update type: ${skill.updateType}`); // 'major', 'minor', 'patch'
}
```

### 更新技能

```typescript
import { updateSkill } from '@skillbolt/registry';

// 更新到最新版本
const result = await updateSkill('git-workflow');
console.log(result.updated); // true/false
console.log(result.previousVersion);
console.log(result.newVersion);

// 更新到特定版本
const result = await updateSkill('git-workflow', {
  version: '2.0.0'
});

// 更新所有技能
const results = await updateSkill('*');
results.forEach(r => {
  if (r.updated) {
    console.log(`Updated ${r.name} to ${r.newVersion}`);
  }
});
```

## 存储

### 存储位置

```typescript
import {
  getDefaultStorageRoot,
  getDefaultCachePath,
  getMetadataPath
} from '@skillbolt/registry';

// 获取存储根目录
const storageRoot = getDefaultStorageRoot(); // ~/.skillbolt/skills

// 获取缓存路径
const cachePath = getDefaultCachePath(); // ~/.skillbolt/cache

// 获取元数据路径
const metadataPath = getMetadataPath(); // ~/.skillbolt/metadata.json
```

### 已安装技能信息

```typescript
import { listSkills } from '@skillbolt/registry';

const skills = await listSkills();

skills.forEach(skill => {
  console.log(`Name: ${skill.name}`);
  console.log(`Version: ${skill.version}`);
  console.log(`Path: ${skill.path}`);
  console.log(`Source: ${skill.source}`);
  console.log(`Installed at: ${skill.installedAt}`);
});
```

## 搜索功能

### 在注册表中搜索

```typescript
import { SkillHubClient } from '@skillbolt/registry';

const client = new SkillHubClient();

// 搜索技能
const results = await client.search('git');

results.forEach(result => {
  console.log(`Name: ${result.name}`);
  console.log(`Description: ${result.description}`);
  console.log(`Version: ${result.version}`);
  console.log(`Author: ${result.author}`);
  console.log(`Downloads: ${result.downloads}`);
});

// 获取技能详情
const details = await client.getDetails('git-workflow');
console.log(details);
console.log(details.readme);
console.log(details.versions);
```

## 安装选项

```typescript
import { installSkill } from '@skillbolt/registry';

await installSkill('git-workflow', {
  // 安装源
  source: 'registry',
  
  // 版本
  version: '1.0.0',
  
  // 输出目录
  output: './skills',
  
  // 使用缓存
  cache: true,
  
  // 覆盖已安装
  force: false,
  
  // 安装依赖
  dependencies: true,
  
  // 安装模式
  mode: 'production' // 'production' | 'development'
});
```

## 使用示例

### 示例 1: 安装并使用技能

```typescript
import { installSkill, getSkillManifest } from '@skillbolt/registry';

async function installAndUse(skillName: string) {
  // 安装技能
  const result = await installSkill(skillName);
  
  if (!result.success) {
    console.error('Installation failed:', result.error);
    return;
  }
  
  // 获取技能清单
  const manifest = await getSkillManifest(skillName);
  console.log(`Installed ${manifest.name} v${manifest.version}`);
  
  // 使用技能
  console.log(`Triggers: ${manifest.triggers?.join(', ')}`);
  console.log(`Description: ${manifest.description}`);
}
```

### 示例 2: 批量更新

```typescript
import { checkOutdated, updateSkill } from '@skillbolt/registry';

async function updateAllSkills() {
  // 检查过时的技能
  const outdated = await checkOutdated();
  
  console.log(`Found ${outdated.length} outdated skills`);
  
  // 逐个更新
  for (const skill of outdated) {
    const result = await updateSkill(skill.name);
    
    if (result.updated) {
      console.log(`✓ Updated ${skill.name}: ${result.previousVersion} -> ${result.newVersion}`);
    } else {
      console.log(`✗ Failed to update ${skill.name}`);
    }
  }
}
```

### 示例 3: 从 GitHub 安装

```typescript
import { installSkill, isGitHubSource } from '@skillbolt/registry';

async function installFromGitHub(githubUrl: string) {
  // 验证是 GitHub 源
  if (!isGitHubSource(githubUrl)) {
    console.error('Not a valid GitHub source');
    return;
  }
  
  // 安装
  const result = await installSkill(githubUrl, {
    cache: true,
    dependencies: true
  });
  
  if (result.success) {
    console.log(`Installed from GitHub to: ${result.path}`);
  }
}
```

### 示例 4: 清理未使用的技能

```typescript
import { listSkills, uninstallSkill } from '@skillbolt/registry';

async function cleanupUnused() {
  const skills = await listSkills();
  
  // 模拟：找出 30 天未使用的技能
  const now = Date.now();
  const unused = skills.filter(skill => {
    const lastUsed = new Date(skill.lastUsed || skill.installedAt);
    const daysSinceUsed = (now - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUsed > 30;
  });
  
  console.log(`Found ${unused.length} unused skills`);
  
  // 确认后卸载
  for (const skill of unused) {
    console.log(`Uninstalling ${skill.name}...`);
    await uninstallSkill(skill.name);
  }
}
```

## 类型定义

```typescript
interface InstallOptions {
  source?: InstallSource;
  version?: string;
  output?: string;
  cache?: boolean;
  force?: boolean;
  dependencies?: boolean;
  mode?: InstallMode;
}

interface InstallResult {
  success: boolean;
  name: string;
  version: string;
  path: string;
  error?: string;
}

interface UpdateOptions {
  version?: string;
  force?: boolean;
}

interface UpdateResult {
  success: boolean;
  name: string;
  updated: boolean;
  previousVersion?: string;
  newVersion?: string;
  error?: string;
}

interface UninstallOptions {
  force?: boolean;
  removeDependencies?: boolean;
}

interface UninstallResult {
  success: boolean;
  name: string;
  removedDependencies?: string[];
  error?: string;
}

interface InstalledSkill {
  name: string;
  version: string;
  path: string;
  source: InstallSource;
  installedAt: string;
  lastUsed?: string;
  dependencies?: string[];
}

interface OutdatedSkill {
  name: string;
  current: string;
  latest: string;
  updateType: 'major' | 'minor' | 'patch';
}

type InstallSource = 'registry' | 'github' | 'local';
type InstallMode = 'production' | 'development';
```

## CLI 命令

### install

```bash
skill install <skill>

# 从注册表安装
skill install git-workflow

# 从 GitHub 安装
skill install github:user/repo
skill install https://github.com/user/repo

# 从本地安装
skill install ./local-skill

# 指定版本
skill install git-workflow@1.0.0

# 选项
skill install git-workflow --force
skill install git-workflow --no-cache
skill install git-workflow --dev
```

### list

```bash
skill list

# 选项
skill list --format json
skill list --installed 30d
skill list --outdated
```

### update

```bash
skill update [skill]

# 更新所有技能
skill update

# 更新特定技能
skill update git-workflow

# 选项
skill update --latest
skill update --force
```

### outdated

```bash
skill outdated

# 选项
skill outdated --format json
skill outdated --major-only
```

### remove

```bash
skill remove <skill>

# 选项
skill remove git-workflow --force
skill remove git-workflow --remove-deps
```

## 最佳实践

1. **版本固定**: 在生产环境中固定技能版本
2. **定期更新**: 定期检查和更新技能
3. **依赖管理**: 了解技能的依赖关系
4. **缓存清理**: 定期清理缓存释放空间
5. **备份重要**: 在更新前备份重要技能

## 故障排除

### 安装失败

如果安装失败：

1. 检查网络连接
2. 验证技能名称或 URL 正确
3. 清除缓存：`rm -rf ~/.skillbolt/cache`
4. 检查磁盘空间

### 版本冲突

如果遇到版本冲突：

1. 使用 `--force` 强制安装
2. 指定确切的版本号
3. 检查依赖项的版本要求

### 权限错误

如果遇到权限错误：

1. 检查目标目录的写入权限
2. 使用 `sudo`（不推荐）或更改目录所有权
3. 确保有足够的磁盘空间

## API 参考

### 主要导出

```typescript
// 命令
export {
  installSkill,
  listSkills,
  formatSkillList,
  updateSkill,
  checkOutdated,
  uninstallSkill
};

// 存储
export {
  LocalStorage,
  getDefaultStorageRoot,
  getDefaultCachePath,
  getMetadataPath,
  MetadataManager,
  FileLock,
  withLock
};

// API 客户端
export { SkillHubClient, ApiClientError };

// 安装器
export {
  installFromLocal,
  installFromGitHub,
  installFromRegistry,
  resolveInstallTarget,
  getSourceDisplayName,
  isGitHubSource,
  isLocalSource,
  isRegistrySource,
  validateSkillDirectory,
  getSkillName,
  getSkillManifest
};

// 工具
export {
  isValidVersion,
  isValidRange,
  satisfies,
  getMaxSatisfying,
  compareVersions,
  isGreaterThan,
  isLessThan,
  getUpdateType,
  coerceVersion,
  parseVersion,
  normalizeVersion,
  downloadFile,
  calculateFileSha256,
  getTempDownloadPath,
  extractTarball,
  createTarball,
  listTarballContents,
  getTempExtractPath
};
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
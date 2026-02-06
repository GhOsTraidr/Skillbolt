# @skillbolt/sync

技能同步工具，支持将技能同步到云端存储，实现跨设备共享和备份。

## 功能特性

- **多云后端**: 支持 GitHub Gist、Supabase 等多种存储后端
- **自动同步**: 可配置自动同步策略
- **冲突解决**: 智能检测和解决同步冲突
- **离线队列**: 支持离线操作，网络恢复后自动同步
- **增量同步**: 仅同步变更的技能，提高效率
- **版本历史**: 保留技能的版本历史
- **网络监控**: 自动检测网络状态

## 基本使用

### CLI 使用

```bash
# 推送技能到云端
skill sync push

# 从云端拉取技能
skill sync pull

# 查看同步状态
skill sync status

# 强制推送（覆盖远程）
skill sync push --force

# 强制拉取（覆盖本地）
skill sync pull --force
```

### API 使用

```typescript
import { SyncEngine, push, pull, syncStatus } from '@skillbolt/sync';

// 创建同步引擎
const syncEngine = new SyncEngine({
  backend: {
    type: 'github-gist',
    credentials: {
      token: 'your-github-token',
      gistId: 'your-gist-id'
    }
  }
});

// 推送技能
const pushResult = await syncEngine.push();
console.log(`Pushed ${pushResult.pushed} skills`);

// 拉取技能
const pullResult = await syncEngine.pull();
console.log(`Pulled ${pullResult.pulled} skills`);

// 查看状态
const status = await syncEngine.getStatus();
console.log(`Local: ${status.local.length}, Remote: ${status.remote.length}`);
```

## 后端配置

### GitHub Gist

```typescript
import { SyncEngine } from '@skillbolt/sync';

const syncEngine = new SyncEngine({
  backend: {
    type: 'github-gist',
    credentials: {
      token: process.env.GITHUB_TOKEN,
      gistId: process.env.GIST_ID
    }
  }
});
```

### Supabase

```typescript
import { SyncEngine } from '@skillbolt/sync';

const syncEngine = new SyncEngine({
  backend: {
    type: 'supabase',
    credentials: {
      url: 'https://your-project.supabase.co',
      anonKey: 'your-anon-key'
    }
  }
});
```

### 自定义后端

```typescript
import { BaseBackend, SyncEngine } from '@skillbolt/sync';

class CustomBackend extends BaseBackend {
  async upload(skill: LocalSkill): Promise<UploadResult> {
    // 自定义上传逻辑
  }

  async download(skillId: string): Promise<RemoteSkill> {
    // 自定义下载逻辑
  }

  async delete(skillId: string): Promise<DeleteResult> {
    // 自定义删除逻辑
  }

  async list(): Promise<RemoteSkill[]> {
    // 自定义列出逻辑
  }
}

const syncEngine = new SyncEngine({
  backend: new CustomBackend()
});
```

## 同步操作

### 推送 (Push)

```typescript
import { push } from '@skillbolt/sync';

const result = await push({
  backend: 'github-gist',
  credentials: { token: 'xxx', gistId: 'yyy' },
  skills: ['skill-1', 'skill-2'], // 特定技能，不指定则全部
  force: false
});

console.log(result.pushed); // 推送的数量
console.log(result.skipped); // 跳过的数量
console.log(result.failed); // 失败的数量
```

### 拉取 (Pull)

```typescript
import { pull } from '@skillbolt/sync';

const result = await pull({
  backend: 'supabase',
  credentials: { url: 'xxx', anonKey: 'yyy' },
  force: false
});

console.log(result.pulled); // 拉取的数量
console.log(result.skipped); // 跳过的数量
console.log(result.failed); // 失败的数量
```

### 状态检查

```typescript
import { syncStatus } from '@skillbolt/sync';

const status = await syncStatus();

status.skills.forEach(skill => {
  console.log(`${skill.name}: ${skill.status}`);
  // 'synced', 'local-only', 'remote-only', 'conflict'
});

console.log(`Overall: ${status.overallStatus}`);
// 'synced', 'needs-sync', 'has-conflicts'
```

## 冲突解决

### 检测冲突

```typescript
import { detectConflicts } from '@skillbolt/sync';

const conflicts = await detectConflicts(localSkills, remoteSkills);

conflicts.forEach(conflict => {
  console.log(`Conflict in ${conflict.skillName}`);
  console.log(`Local version: ${conflict.localVersion}`);
  console.log(`Remote version: ${conflict.remoteVersion}`);
});
```

### 解决冲突

```typescript
import { resolveConflict, resolveConflictWithBackup } from '@skillbolt/sync';

// 策略: 使用本地版本
await resolveConflict(conflict, 'local');

// 策略: 使用远程版本
await resolveConflict(conflict, 'remote');

// 策略: 创建备份后使用本地
await resolveConflictWithBackup(conflict, 'local');

// 策略: 手动解决
const resolved = {
  name: conflict.skillName,
  content: 'merged content',
  version: '1.0.0'
};
await resolveConflict(conflict, 'manual', resolved);
```

## 离线队列

### 使用离线队列

```typescript
import { OfflineQueue } from '@skillbolt/sync';

const queue = new OfflineQueue({
  storagePath: './.skillbolt/queue.json'
});

// 网络可用时，自动同步队列中的操作
queue.on('network:available', async () => {
  await queue.flush();
});

// 添加操作到队列
await queue.add({
  type: 'push',
  skillId: 'my-skill',
  timestamp: Date.now()
});

// 手动刷新队列
await queue.flush();
```

### 队列状态

```typescript
const status = await queue.getStatus();
console.log(`Pending: ${status.pending}`);
console.log(`Failed: ${status.failed}`);
console.log(`Total: ${status.total}`);
```

## 自动同步

### 配置自动同步

```typescript
import { SyncEngine } from '@skillbolt/sync';

const syncEngine = new SyncEngine({
  backend: {
    type: 'github-gist',
    credentials: { token: 'xxx', gistId: 'yyy' }
  },
  autoSync: {
    enabled: true,
    interval: 60000, // 每 60 秒
    onConflict: 'local', // 冲突时使用本地版本
    syncOnStartup: true // 启动时同步
  }
});

// 手动触发自动同步
await syncEngine.autoSync();
```

### 事件监听

```typescript
syncEngine.on('sync:start', () => {
  console.log('Sync started');
});

syncEngine.on('sync:complete', (result) => {
  console.log('Sync completed', result);
});

syncEngine.on('sync:error', (error) => {
  console.error('Sync error', error);
});

syncEngine.on('conflict', (conflict) => {
  console.log('Conflict detected', conflict);
});
```

## 使用示例

### 示例 1: 基本同步

```typescript
import { SyncEngine } from '@skillbolt/sync';

async function basicSync() {
  const syncEngine = new SyncEngine({
    backend: {
      type: 'github-gist',
      credentials: {
        token: process.env.GITHUB_TOKEN,
        gistId: process.env.GIST_ID
      }
    }
  });

  // 检查状态
  const status = await syncEngine.getStatus();
  console.log(`Local skills: ${status.local.length}`);
  console.log(`Remote skills: ${status.remote.length}`);

  // 如果需要同步
  if (status.overallStatus !== 'synced') {
    await syncEngine.push();
    await syncEngine.pull();
  }
}
```

### 示例 2: 处理冲突

```typescript
import { SyncEngine, resolveConflict } from '@skillbolt/sync';

async function syncWithConflictHandling() {
  const syncEngine = new SyncEngine({
    backend: {
      type: 'github-gist',
      credentials: { token: 'xxx', gistId: 'yyy' }
    }
  });

  // 检测冲突
  const conflicts = await syncEngine.detectConflicts();

  // 解决冲突
  for (const conflict of conflicts) {
    console.log(`Resolving conflict for ${conflict.skillName}`);

    // 简单策略: 使用最新修改的版本
    if (conflict.localModifiedAt > conflict.remoteModifiedAt) {
      await resolveConflict(conflict, 'local');
    } else {
      await resolveConflict(conflict, 'remote');
    }
  }

  // 继续同步
  await syncEngine.push();
}
```

### 示例 3: 网络监控

```typescript
import { SyncEngine, createNetworkMonitor } from '@skillbolt/sync';

async function syncWithNetworkMonitoring() {
  const syncEngine = new SyncEngine({
    backend: {
      type: 'supabase',
      credentials: { url: 'xxx', anonKey: 'yyy' }
    }
  });

  // 创建网络监控器
  const monitor = createNetworkMonitor({
    checkInterval: 5000, // 每 5 秒检查一次
    pingUrl: 'https://www.google.com'
  });

  // 网络可用时同步
  monitor.on('online', async () => {
    console.log('Network available, syncing...');
    await syncEngine.pull();
    await syncEngine.push();
  });

  // 网络不可用时记录
  monitor.on('offline', () => {
    console.log('Network unavailable');
  });

  // 启动监控
  monitor.start();
}
```

### 示例 4: 备份和恢复

```typescript
import { SyncEngine } from '@skillbolt/sync';

async function backupSkills() {
  const syncEngine = new SyncEngine({
    backend: {
      type: 'github-gist',
      credentials: { token: 'xxx', gistId: 'yyy' }
    }
  });

  // 推送所有技能作为备份
  const result = await syncEngine.push({
    all: true,
    force: true // 覆盖远程
  });

  console.log(`Backed up ${result.pushed} skills`);
}
```

## 类型定义

```typescript
interface SyncEngineOptions {
  backend: BackendConfig;
  autoSync?: AutoSyncConfig;
  queue?: QueueConfig;
  backup?: BackupSettings;
}

interface BackendConfig {
  type: BackendType;
  credentials: Credentials;
}

interface PushOptions {
  skills?: string[];
  force?: boolean;
  dryRun?: boolean;
}

interface PullOptions {
  skills?: string[];
  force?: boolean;
  dryRun?: boolean;
}

interface PushResult {
  pushed: number;
  skipped: number;
  failed: number;
  errors: Error[];
}

interface PullResult {
  pulled: number;
  skipped: number;
  failed: number;
  errors: Error[];
}

interface StatusResult {
  local: SkillStatus[];
  remote: SkillStatus[];
  overallStatus: OverallStatus;
}

interface SkillStatus {
  name: string;
  status: 'synced' | 'local-only' | 'remote-only' | 'conflict';
  localVersion?: string;
  remoteVersion?: string;
  localModifiedAt?: Date;
  remoteModifiedAt?: Date;
}

interface Conflict {
  skillName: string;
  local: LocalSkill;
  remote: RemoteSkill;
}

type BackendType = 'github-gist' | 'supabase' | 'custom';
type ConflictStrategy = 'local' | 'remote' | 'manual';
type OverallStatus = 'synced' | 'needs-sync' | 'has-conflicts';
```

## CLI 命令

### push

```bash
skill sync push

# 选项
skill sync push --force
skill sync push --skills skill-1,skill-2
skill sync push --dry-run
```

### pull

```bash
skill sync pull

# 选项
skill sync pull --force
skill sync pull --skills skill-1,skill-2
skill sync pull --dry-run
```

### status

```bash
skill sync status

# 选项
skill sync status --detailed
skill sync status --json
```

## 最佳实践

1. **定期同步**: 设置自动同步确保数据安全
2. **冲突处理**: 建立明确的冲突解决策略
3. **网络监控**: 在网络不稳定时使用离线队列
4. **备份策略**: 定期备份重要技能
5. **版本控制**: 保留技能的版本历史

## 故障排除

### 同步失败

如果同步失败：

1. 检查网络连接
2. 验证后端凭证
3. 查看详细的错误日志
4. 检查磁盘空间

### 冲突频繁

如果频繁出现冲突：

1. 检查自动同步配置
2. 调整同步间隔
3. 审查多设备使用情况
4. 建立明确的使用规范

### 性能问题

如果同步速度慢：

1. 检查技能数量和大小
2. 考虑增量同步
3. 优化网络连接
4. 使用更快的后端

## API 参考

### 主要导出

```typescript
// 核心
export { SyncEngine, computeSyncDiff, getSyncSummary };

// 冲突处理
export {
  detectConflicts,
  resolveConflict,
  resolveConflictWithBackup,
  createConflictBackup
};

// 后端
export {
  BaseBackend,
  SupabaseBackend,
  GitHubGistBackend,
  createBackend,
  getSupportedBackends
};

// 队列
export { OfflineQueue, QueueStorage };

// 命令
export { push, pull, syncStatus, formatStatus };

// 工具
export {
  computeHashFromString,
  computeHashFromFile,
  hashesMatch,
  checkNetworkConnectivity,
  createNetworkMonitor,
  scanLocalSkills,
  filterSkills
};
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
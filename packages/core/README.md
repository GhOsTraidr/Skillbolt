# @skillbolt/core

Skill Kit 的核心库，提供所有其他模块共享的基础功能，包括配置加载、日志记录、错误处理、技能解析等。

## 功能特性

- **配置管理**: 支持全局和项目级配置
- **日志系统**: 统一的日志记录和进度显示
- **错误处理**: 标准化的错误类型和处理
- **技能解析**: 解析技能文件（frontmatter、sections）
- **路径工具**: 路径处理和规范化
- **字符串工具**: 字符串处理和格式化
- **类型定义**: 共享的 TypeScript 类型

## 配置管理

### 加载配置

```typescript
import { loadConfig, loadGlobalConfig, loadProjectConfig } from '@skillbolt/core';

// 加载完整配置（全局 + 项目）
const config = await loadConfig();

// 仅加载全局配置
const globalConfig = await loadGlobalConfig();

// 仅加载项目配置
const projectConfig = await loadProjectConfig();

// 获取配置文件路径
const configPath = getConfigPath(); // ~/.skillbolt/config.json
```

### 配置结构

```typescript
interface SkillboltConfig {
  // 默认配置
  defaults?: DefaultsConfig;
  
  // Lint 配置
  lint?: LintConfig;
  
  // Registry 配置
  registry?: RegistryConfig;
  
  // Sync 配置
  sync?: SyncConfig;
  
  // Analytics 配置
  analytics?: AnalyticsConfig;
  
  // Test 配置
  test?: TestConfig;
}

interface DefaultsConfig {
  platform?: 'claude' | 'cursor' | 'continue';
  outputDir?: string;
  template?: string;
}
```

### 配置文件位置

```bash
# 全局配置
~/.skillbolt/config.json

# 项目配置（按优先级）
./skill.config.json
./.skillboltrc.json
./skill.config.js
```

## 日志系统

### 基本使用

```typescript
import { logger, createLogger } from '@skillbolt/core';

// 使用默认 logger
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
logger.success('Success message');

// 创建自定义 logger
const customLogger = createLogger({
  level: 'debug',
  prefix: '[MyApp]',
  color: true
});
```

### 日志级别

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

logger.setLevel('debug'); // 设置最低日志级别
logger.getLevel(); // 获取当前级别
```

### 进度条

```typescript
import { createSpinner } from '@skillbolt/core';

const spinner = createSpinner('Processing...');
spinner.start();

// 更新文本
spinner.text = 'Still processing...';

// 停止
spinner.stop('Done!');
spinner.succeed('Success!');
spinner.fail('Failed!');
spinner.warn('Warning!');
spinner.info('Info!');
```

## 错误处理

### 错误类型

```typescript
import {
  SkillboltError,
  ParseError,
  ConfigError,
  ValidationError,
  FileError
} from '@skillbolt/core';

// 抛出错误
throw new ParseError('Failed to parse skill file', {
  file: 'skill.md',
  line: 10,
  column: 5
});

throw new ConfigError('Invalid configuration', {
  key: 'lint.rules',
  expected: 'array',
  received: 'string'
});

throw new ValidationError('Skill validation failed', {
  skill: 'my-skill',
  errors: ['Missing required field: name']
});

throw new FileError('File not found', {
  path: '/path/to/file.md'
});
```

### 错误代码

```typescript
enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  
  // 解析错误
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_FRONTMATTER = 'INVALID_FRONTMATTER',
  MISSING_REQUIRED_SECTION = 'MISSING_REQUIRED_SECTION',
  
  // 配置错误
  CONFIG_ERROR = 'CONFIG_ERROR',
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
  
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SKILL_NOT_FOUND = 'SKILL_NOT_FOUND',
  
  // 文件错误
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
}
```

## 技能解析

### 解析技能文件

```typescript
import {
  parseSkillFile,
  parseSkillString,
  parseManifest,
  parseSections
} from '@skillbolt/core';

// 从文件解析
const skill = await parseSkillFile('./skill.md');
console.log(skill.manifest);
console.log(skill.sections);

// 从字符串解析
const content = fs.readFileSync('./skill.md', 'utf-8');
const skill = parseSkillString(content);

// 仅解析 frontmatter
const manifest = parseManifest(content);

// 仅解析 sections
const sections = parseSections(content);
```

### 获取特定章节

```typescript
import {
  getSectionByType,
  getSectionsByType,
  findSection
} from '@skillbolt/core';

// 获取第一个 @Claude 章节
const claudeSection = getSectionByType(skill, '@Claude');

// 获取所有 @User 章节
const userSections = getSectionsByType(skill, '@User');

// 查找包含特定文本的章节
const section = findSection(skill, 'example');
```

### 验证技能

```typescript
import {
  validateManifest,
  hasRequiredSections
} from '@skillbolt/core';

// 验证 manifest
const valid = validateManifest(manifest);
if (!valid.valid) {
  console.error('Errors:', valid.errors);
}

// 检查必需章节
const hasAll = hasRequiredSections(skill);
```

### Frontmatter 解析

```typescript
import { parseFrontmatter } from '@skillbolt/core';

const result = parseFrontmatter(content);
console.log(result.data); // frontmatter 数据
console.log(result.content); // 剩余内容
console.log result.line); // frontmatter 结束行号
```

## 路径工具

```typescript
import {
  normalizePath,
  expandTilde,
  resolveSkillPath,
  isDirectory,
  isFile,
  exists,
  getSkillDir,
  getSkillName,
  joinPath
} from '@skillbolt/core';

// 规范化路径
const normalized = normalizePath('path/to/..//file'); // 'path/file'

// 展开波浪号
const expanded = expandTilde('~/documents'); // '/home/user/documents'

// 解析技能路径
const skillPath = resolveSkillPath('my-skill');

// 检查路径类型
const isDir = await isDirectory('/path/to/dir');
const isFile = await isFile('/path/to/file');
const fileExists = await exists('/path/to/file');

// 获取技能目录和名称
const dir = getSkillDir('/path/to/skills/my-skill/skill.md'); // '/path/to/skills/my-skill'
const name = getSkillName('/path/to/skills/my-skill/skill.md'); // 'my-skill'

// 连接路径
const path = joinPath('dir', 'subdir', 'file.txt');
```

## 字符串工具

```typescript
import {
  slugify,
  truncate,
  capitalize,
  camelCase,
  kebabCase,
  pascalCase,
  countWords,
  extractLines,
  indentText,
  dedent,
  escapeRegex
} from '@skillbolt/core';

// 转换为 slug
const slug = slugify('Hello World!'); // 'hello-world'

// 截断文本
const truncated = truncate('Long text here', 10); // 'Long text ...'

// 首字母大写
const capitalized = capitalize('hello'); // 'Hello'

// 驼峰命名
const camel = camelCase('hello-world'); // 'helloWorld'

// 短横线命名
const kebab = kebabCase('helloWorld'); // 'hello-world'

// 帕斯卡命名
const pascal = pascalCase('hello-world'); // 'HelloWorld'

// 计算单词数
const words = countWords('Hello world'); // 2

// 提取行
const lines = extractLines('line1\nline2\nline3', 1, 2); // ['line2']

// 缩进文本
const indented = indentText('text', 2); // '  text'

// 移除缩进
const dedented = dedent('  text'); // 'text'

// 转义正则表达式
const escaped = escapeRegex('a.b'); // 'a\\.b'
```

## 类型定义

### 技能相关

```typescript
interface SkillManifest {
  name: string;
  version?: string;
  description?: string;
  triggers?: string[];
  [key: string]: unknown;
}

interface SkillSection {
  type: string;
  content: string;
  line: number;
}

interface ParsedSkillResult {
  manifest: SkillManifest;
  sections: SkillSection[];
  rawContent: string;
  filePath: string;
}
```

### 配置相关

```typescript
interface ResolvedConfig {
  global: GlobalConfig;
  project: ProjectConfig;
}

interface GlobalConfig {
  defaults: DefaultsConfig;
  registry: RegistryConfig;
  sync: SyncConfig;
}

interface ProjectConfig {
  lint?: LintConfig;
  analytics?: AnalyticsConfig;
  test?: TestConfig;
}
```

### 错误相关

```typescript
interface ErrorDetails {
  [key: string]: unknown;
}

class SkillboltError extends Error {
  code: ErrorCode;
  details: ErrorDetails;
}
```

## 使用示例

### 完整的技能解析流程

```typescript
import {
  parseSkillFile,
  validateManifest,
  hasRequiredSections,
  getSectionByType
} from '@skillbolt/core';
import { logger } from '@skillbolt/core';

async function analyzeSkill(skillPath: string) {
  try {
    // 解析技能文件
    const skill = await parseSkillFile(skillPath);
    logger.info(`Loaded skill: ${skill.manifest.name}`);

    // 验证 manifest
    const manifestValid = validateManifest(skill.manifest);
    if (!manifestValid.valid) {
      logger.error('Invalid manifest:', manifestValid.errors);
      return;
    }

    // 检查必需章节
    const hasAllSections = hasRequiredSections(skill);
    if (!hasAllSections) {
      logger.warn('Missing required sections');
    }

    // 获取 @Claude 章节
    const claudeSection = getSectionByType(skill, '@Claude');
    if (claudeSection) {
      logger.debug('Claude section length:', claudeSection.content.length);
    }

    return skill;
  } catch (error) {
    if (error instanceof SkillboltError) {
      logger.error(`[${error.code}] ${error.message}`);
      if (error.details) {
        logger.error('Details:', error.details);
      }
    }
    throw error;
  }
}
```

### 配置驱动的应用

```typescript
import { loadConfig, logger } from '@skillbolt/core';

async function runApp() {
  // 加载配置
  const config = await loadConfig();
  
  // 根据配置设置日志级别
  logger.setLevel(config.global.defaults.logLevel || 'info');
  
  // 使用配置
  const platform = config.global.defaults.platform || 'claude';
  const outputDir = config.global.defaults.outputDir || './output';
  
  logger.info(`Running on platform: ${platform}`);
  logger.info(`Output directory: ${outputDir}`);
  
  // ... 应用逻辑
}
```

## 最佳实践

1. **错误处理**: 始终使用特定的错误类型而不是通用的 Error
2. **日志级别**: 在生产环境中使用适当的日志级别
3. **路径处理**: 使用提供的路径工具而不是手写字符串操作
4. **配置验证**: 加载配置后验证配置的有效性
5. **类型安全**: 充分利用 TypeScript 类型定义

## API 参考

### 主要导出

```typescript
// 配置
export {
  loadConfig,
  loadGlobalConfig,
  loadProjectConfig,
  getConfigPath
};

// 日志
export {
  Logger,
  logger,
  createLogger,
  createSpinner
};

// 错误
export {
  SkillboltError,
  ParseError,
  ConfigError,
  ValidationError,
  FileError
};

// 解析
export {
  parseFrontmatter,
  parseManifest,
  validateManifest,
  parseSections,
  getLineNumber,
  getSectionByType,
  getSectionsByType,
  parseSkillFile,
  parseSkillString,
  findSection,
  hasRequiredSections
};

// 路径
export {
  normalizePath,
  expandTilde,
  resolveSkillPath,
  isDirectory,
  isFile,
  exists,
  getSkillDir,
  getSkillName,
  joinPath
};

// 字符串
export {
  slugify,
  truncate,
  capitalize,
  camelCase,
  kebabCase,
  pascalCase,
  countWords,
  extractLines,
  indentText,
  dedent,
  escapeRegex
};
```

## 许可证

MIT
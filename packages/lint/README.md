# @skillbolt/lint

技能文件 lint 工具，检查技能文件的质量、格式和最佳实践，提供自动修复功能。

## 功能特性

- **多规则支持**: 内置多种 lint 规则，涵盖格式、样式和最佳实践
- **自动修复**: 支持自动修复部分 lint 错误
- **可配置**: 通过配置文件自定义规则和严重级别
- **多种输出格式**: 支持 stylish、JSON、GitHub 等格式
- **预设配置**: 提供 recommended 和 strict 预设
- **自定义规则**: 支持编写和注册自定义规则
- **性能优化**: 高效的文件扫描和规则执行

## 基本使用

### CLI 使用

```bash
# Lint 单个文件
skill lint ./skill.md

# Lint 目录
skill lint ./skills

# 自动修复
skill lint ./skill.md --fix

# 使用配置文件
skill lint ./skill.md --config .skilllintrc.json

# 指定输出格式
skill lint ./skill.md --format json
skill lint ./skill.md --format github

# 使用预设
skill lint ./skill.md --preset recommended
skill lint ./skill.md --preset strict
```

### API 使用

```typescript
import { Linter } from '@skillbolt/lint';

const linter = new Linter();

const result = await linter.lintFile('./skill.md');

console.log(result.messages); // Lint 消息数组
console.log(result.summary); // 汇总统计

// 自动修复
if (result.hasErrors) {
  const fixResult = await linter.fixFile('./skill.md');
  console.log(`Fixed ${fixResult.fixedCount} issues`);
}
```

## 内置规则

### 格式规则 (format)

#### frontmatter-required

检查技能文件是否包含必需的 frontmatter 字段。

```typescript
import { frontmatterRequired } from '@skillbolt/lint';

const rule = frontmatterRequired;
```

**配置选项:**
```typescript
{
  required: ['name', 'description']; // 必需字段
}
```

#### frontmatter-fields

验证 frontmatter 字段的类型和格式。

```typescript
import { frontmatterFields } from '@skillbolt/lint';
```

**配置选项:**
```typescript
{
  fields: {
    name: { type: 'string', pattern: '^[a-z-]+$' },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' }
  }
}
```

#### sections-required

检查是否包含必需的章节。

```typescript
import { sectionsRequired } from '@skillbolt/lint';
```

**配置选项:**
```typescript
{
  required: ['@Claude', '@User']; // 必需章节
}
```

#### section-not-empty

检查章节内容是否为空。

```typescript
import { sectionNotEmpty } from '@skillbolt/lint';
```

### 样式规则 (style)

#### description-format

验证描述格式。

```typescript
import { descriptionFormat } from '@skillbolt/lint';
```

**配置选项:**
```typescript
{
  minLength: 10,
  maxLength: 200,
  pattern: '^[A-Z].*[.!?]$' // 首字母大写，以标点结尾
}
```

### 最佳实践规则 (best-practices)

#### examples-exist

检查是否包含使用示例。

```typescript
import { examplesExist } from '@skillbolt/lint';
```

#### max-length

检查文件或章节的最大长度。

```typescript
import { maxLength } from '@skillbolt/lint';
```

**配置选项:**
```typescript
{
  maxFileLength: 10000,
  maxSectionLength: 1000
}
```

#### triggers-count

检查触发词数量。

```typescript
import { triggersCount } from '@skillbolt/lint';
```

**配置选项:**
```typescript
{
  minTriggers: 1,
  maxTriggers: 10
}
```

#### steps-count

检查步骤数量。

```typescript
import { stepsCount } from '@skillbolt/lint';
```

**配置选项:**
```typescript
{
  maxSteps: 20
}
```

### 引用规则 (references)

#### no-broken-links

检查内部链接是否有效。

```typescript
import { noBrokenLinks } from '@skillbolt/lint';
```

## 配置

### 配置文件

```json
{
  "rules": {
    "frontmatter-required": ["error", { "required": ["name", "description"] }],
    "sections-required": ["warn", { "required": ["@Claude", "@User"] }],
    "examples-exist": ["warn"],
    "max-length": ["warn", { "maxSectionLength": 800 }]
  },
  "ignore": [
    "**/node_modules/**",
    "**/dist/**"
  ]
}
```

### 使用预设

```typescript
import { defineConfig, presets } from '@skillbolt/lint';

export default defineConfig({
  extends: presets.recommended,
  rules: {
    'description-format': ['error', { 'minLength': 20 }]
  }
});
```

### 自定义配置

```typescript
import { defineConfig } from '@skillbolt/lint';

export default defineConfig({
  rules: {
    'frontmatter-required': ['error'],
    'sections-required': ['warn'],
    'max-length': ['off']
  },
  ignore: ['**/examples/**']
});
```

## 自定义规则

### 创建自定义规则

```typescript
import { createRule, RuleContext } from '@skillbolt/lint';

const customRule = createRule({
  name: 'custom-rule',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Custom rule description',
      category: 'custom'
    },
    fixable: true
  },
  create(context: RuleContext) {
    return {
      async visitSection(section) {
        if (section.content.length > 100) {
          context.report({
            message: 'Section is too long',
            node: section,
            fix(fixer) {
              return fixer.replaceText(section, section.content.slice(0, 100));
            }
          });
        }
      }
    };
  }
});

// 注册规则
export { customRule };
```

### 使用自定义规则

```typescript
import { Linter } from '@skillbolt/lint';
import { customRule } from './custom-rule.js';

const linter = new Linter({
  rules: {
    'custom-rule': ['error']
  },
  customRules: {
    'custom-rule': customRule
  }
});
```

## 输出格式

### Stylish 格式（默认）

```bash
skill lint ./skill.md
```

输出：
```
/path/to/skill.md
  1:1  error  Missing required frontmatter field: description  frontmatter-required
  10:1  warn   Section is too long                              max-length

✖ 2 problems (1 error, 1 warning)
  1 error and 0 warnings potentially fixable with the `--fix` option.
```

### JSON 格式

```bash
skill lint ./skill.md --format json
```

输出：
```json
{
  "files": [
    {
      "filePath": "/path/to/skill.md",
      "messages": [
        {
          "ruleId": "frontmatter-required",
          "severity": "error",
          "message": "Missing required frontmatter field: description",
          "line": 1,
          "column": 1,
          "fix": {
            "range": [0, 0],
            "text": "description: \"A skill description\"\n"
          }
        }
      ]
    }
  ],
  "summary": {
    "errorCount": 1,
    "warningCount": 1,
    "fixableErrorCount": 1,
    "fixableWarningCount": 0
  }
}
```

### GitHub 格式

```bash
skill lint ./skill.md --format github
```

输出：
```
::error file=/path/to/skill.md,line=1,col=1::Missing required frontmatter field: description
::warning file=/path/to/skill.md,line=10,col=1::Section is too long
```

## 使用示例

### 示例 1: 基本 Lint

```typescript
import { Linter } from '@skillbolt/lint';

async function lintSkill(skillPath: string) {
  const linter = new Linter();
  
  const result = await linter.lintFile(skillPath);
  
  if (result.hasErrors) {
    console.error(`Found ${result.summary.errorCount} errors`);
    result.messages.forEach(msg => {
      console.error(`${msg.line}:${msg.column} ${msg.severity}: ${msg.message}`);
    });
  } else {
    console.log('No errors found!');
  }
}
```

### 示例 2: 自动修复

```typescript
import { Linter } from '@skillbolt/lint';

async function fixSkill(skillPath: string) {
  const linter = new Linter();
  
  const fixResult = await linter.fixFile(skillPath);
  
  console.log(`Fixed ${fixResult.fixedCount} issues`);
  console.log(`Remaining: ${fixResult.remainingIssues} issues`);
  
  if (fixResult.fixedCount > 0) {
    console.log('File has been updated');
  }
}
```

### 示例 3: 自定义配置

```typescript
import { Linter } from '@skillbolt/lint';

async function lintWithConfig(skillPath: string) {
  const config = {
    rules: {
      'frontmatter-required': ['error'],
      'sections-required': ['warn'],
      'max-length': ['warn', { maxSectionLength: 800 }]
    },
    ignore: ['**/examples/**']
  };
  
  const linter = new Linter(config);
  const result = await linter.lintFile(skillPath);
  
  return result;
}
```

### 示例 4: 批量 Lint

```typescript
import { Linter } from '@skillbolt/lint';
import { promises as fs } from 'fs';

async function lintDirectory(dir: string) {
  const linter = new Linter();
  const files = await fs.readdir(dir);
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const result = await linter.lintFile(`${dir}/${file}`);
      totalErrors += result.summary.errorCount;
      totalWarnings += result.summary.warningCount;
      
      console.log(`${file}: ${result.summary.errorCount} errors, ${result.summary.warningCount} warnings`);
    }
  }
  
  console.log(`\nTotal: ${totalErrors} errors, ${totalWarnings} warnings`);
}
```

## 类型定义

```typescript
interface LinterOptions {
  rules?: RulesConfig;
  ignore?: string[];
  fix?: boolean;
  format?: FormatterName;
}

interface LintResult {
  filePath: string;
  messages: LintMessage[];
  summary: LintSummary;
  hasErrors: boolean;
}

interface LintMessage {
  ruleId: string;
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  line: number;
  column: number;
  fix?: FixInfo;
}

interface FixInfo {
  range: [number, number];
  text: string;
}

interface LintSummary {
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

interface RuleConfig {
  [key: string]: RuleConfigValue;
}

type RuleConfigValue = 'off' | 'warn' | 'error' | [RuleConfigValue, Record<string, unknown>];
```

## CLI 命令

```bash
skill lint <path>

# 选项
skill lint ./skill.md --fix
skill lint ./skill.md --config .skilllintrc.json
skill lint ./skill.md --format json
skill lint ./skill.md --preset recommended
skill lint ./skill.md --ignore '**/node_modules/**'
```

## 最佳实践

1. **持续集成**: 在 CI/CD 流程中运行 lint
2. **自动修复**: 使用 `--fix` 选项自动修复可修复的问题
3. **配置文件**: 使用配置文件统一项目规范
4. **逐步修复**: 先修复错误，再处理警告
5. **自定义规则**: 为项目特定的需求创建自定义规则

## 故障排除

### 规则未找到

如果遇到规则未找到的错误：

1. 检查规则名称拼写
2. 确认规则是否在内置规则列表中
3. 检查自定义规则是否正确注册

### 修复失败

如果自动修复失败：

1. 检查文件权限
2. 确认文件未被其他程序锁定
3. 查看详细的错误消息

### 性能问题

如果 lint 速度慢：

1. 使用 ignore 配置排除不需要检查的目录
2. 减少启用的规则数量
3. 考虑使用缓存（如果支持）

## API 参考

### 主要导出

```typescript
// Linter
export { Linter };

// 规则
export {
  rules,
  allRules,
  formatRules,
  styleRules,
  bestPracticesRules,
  referencesRules
};

// 具体规则
export {
  frontmatterRequired,
  frontmatterFields,
  sectionsRequired,
  sectionNotEmpty,
  descriptionFormat,
  maxLength,
  examplesExist,
  triggersCount,
  stepsCount,
  noBrokenLinks
};

// 规则创建
export { createRule, runRule };

// 修复
export { createFixer, applyFixes };

// 配置
export {
  loadLintConfig,
  getResolvedConfig,
  defineConfig,
  defaultConfig,
  presets,
  recommendedRules,
  strictRules
};

// 格式化器
export {
  formatters,
  getFormatter,
  stylishFormatter,
  jsonFormatter,
  githubFormatter
};
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
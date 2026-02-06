# @skillbolt/convert

技能格式转换工具，支持在不同 AI 平台的技能格式之间进行转换。

## 功能特性

- **多格式支持**: 支持 Claude、Codex、Cursor、Continue 四种格式
- **自动检测**: 自动识别源文件格式
- **批量转换**: 支持批量转换多个文件
- **双向转换**: 支持所有格式之间的相互转换
- **格式验证**: 验证转换后的格式
- **警告提示**: 提示有损转换的信息
- **保留源文件**: 可选择保留或删除源文件

## 支持的格式

| 格式 | 描述 | 扩展名 |
|------|------|--------|
| `claude` | Claude.ai 技能格式 | `.md`, `.claude` |
| `codex` | OpenAI Codex 格式 | `.json`, `.codex` |
| `cursor` | Cursor IDE 格式 | `.json`, `.cursor` |
| `continue` | Continue IDE 格式 | `.json`, `.continue` |

## 基本使用

### 单文件转换

```bash
# 转换为 Claude 格式
skill convert skill.claude --to claude

# 转换为 Codex 格式
skill convert skill.md --to codex

# 转换为 Cursor 格式
skill convert skill.md --to cursor

# 转换为 Continue 格式
skill convert skill.md --to continue

# 自动检测格式并转换
skill convert skill.json --to claude
```

### 批量转换

```bash
# 批量转换目录中的所有文件
skill convert ./skills --to claude --recursive

# 使用 glob 模式
skill convert "./skills/*.md" --to codex

# 指定输出目录
skill convert ./input --to cursor --output ./output
```

### 高级选项

```bash
# 覆盖现有文件
skill convert skill.md --to claude --overwrite

# 保留源文件
skill convert skill.md --to codex --preserve-source

# 转换为所有格式
skill convert skill.md --to all
```

## API 使用

### 基本转换

```typescript
import { convert, parseSkill, detectFormat } from '@skillbolt/convert';

// 检测格式
const detected = detectFormat(skillContent);
console.log(detected.format); // 'claude'
console.log(detected.confidence); // 95
console.log(detected.indicators); // ['## @Claude', 'version:']

// 解析技能
const parsed = parseSkill(skillContent, 'claude');
console.log(parsed.metadata.name);
console.log(parsed.sections);

// 转换格式
const result = await convert(skillContent, 'claude', 'codex');
console.log(result.content); // 转换后的内容
console.log(result.warnings); // 转换警告
```

### 批量转换

```typescript
import { convertWithWarnings, getConverter } from '@skillbolt/convert';

const converter = getConverter('claude', 'codex');

const results = await Promise.all(
  skills.map(async (skill) => {
    const result = converter.convertWithWarnings(skill);
    return {
      inputPath: skill.path,
      outputPath: skill.path.replace('.md', '.json'),
      content: result.content,
      warnings: result.warnings
    };
  })
);
```

### 转换为所有格式

```typescript
import { convertToAll } from '@skillbolt/convert';

const results = await convertToAll(claudeSkill, './output');
// [
//   { format: 'codex', path: './output/skill.codex.json', warnings: [] },
//   { format: 'cursor', path: './output/skill.cursor.json', warnings: [] },
//   { format: 'continue', path: './output/skill.continue.json', warnings: [] }
// ]
```

### 使用解析器

```typescript
import {
  parseClaudeSkill,
  parseCodexSkill,
  parseCursorSkill,
  parseContinueSkill,
  parseSkillAuto
} from '@skillbolt/convert';

// 解析特定格式
const claudeSkill = parseClaudeSkill(content);
const codexSkill = parseCodexSkill(content);

// 自动检测并解析
const skill = parseSkillAuto(content);
```

### 使用转换器

```typescript
import {
  ClaudeToCodexConverter,
  CodexToClaudeConverter,
  ClaudeToCursorConverter,
  CursorToClaudeConverter,
  ClaudeToContinueConverter,
  ContinueToClaudeConverter
} from '@skillbolt/convert';

const converter = new ClaudeToCodexConverter();

const result = converter.convertWithWarnings(parsedSkill);
console.log(result.content);
console.log(result.warnings);

// 直接转换
const content = converter.convert(parsedSkill);
```

### 格式检测

```typescript
import { detectFormat, detectFormatFromPath } from '@skillbolt/convert';

// 从内容检测
const result1 = detectFormat(content);

// 从文件路径检测
const result2 = detectFormatFromPath('/path/to/skill.claude');
```

## 格式详情

### Claude 格式

Claude 使用 Markdown 格式，具有特定的 frontmatter 和章节结构：

```markdown
---
name: My Skill
version: 1.0.0
description: A sample skill
triggers:
  - help me
  - show me
---

## @Claude
Describe what this skill does...

## @User
What the user says to trigger the skill...
```

### Codex 格式

Codex 使用 JSON 格式：

```json
{
  "name": "My Skill",
  "description": "A sample skill",
  "model": "gpt-4",
  "system": "Describe what this skill does...",
  "user": "What the user says...",
  "examples": []
}
```

### Cursor 格式

Cursor 使用 JSON 格式，类似于 Codex 但有一些特定字段：

```json
{
  "name": "My Skill",
  "description": "A sample skill",
  "systemPrompt": "Describe what this skill does...",
  "userPrompt": "What the user says...",
  "context": {}
}
```

### Continue 格式

Continue 使用 JSON 格式：

```json
{
  "name": "My Skill",
  "description": "A sample skill",
  "slashCommand": "my-skill",
  "systemPrompt": "Describe what this skill does...",
  "contextFiles": [],
  "context": {}
}
```

## 转换映射

| 源格式 | 目标格式 | 转换类型 |
|--------|----------|----------|
| Claude | Codex | 标准 |
| Claude | Cursor | 标准 |
| Claude | Continue | 标准 |
| Codex | Claude | 标准 |
| Cursor | Claude | 标准 |
| Continue | Claude | 标准 |

## 类型定义

```typescript
type Format = 'claude' | 'codex' | 'cursor' | 'continue';

interface ParsedSkill {
  metadata: SkillMetadata;
  sections: ParsedSection[];
  rawContent: string;
}

interface SkillMetadata {
  name: string;
  description: string;
  version?: string;
  model?: string;
  triggers?: string[];
  author?: string;
  [key: string]: unknown;
}

interface ParsedSection {
  name: string;
  content: string;
  level: number;
}

interface ConvertOptions {
  to: Format | 'all';
  output?: string;
  overwrite?: boolean;
  preserveSource?: boolean;
}

interface ConvertResult {
  source: Format;
  target: Format;
  inputPath: string;
  outputPath: string;
  success: boolean;
  warnings?: string[];
  error?: string;
}

interface DetectResult {
  format: Format;
  confidence: number;
  indicators: string[];
}
```

## CLI 命令

### 基本命令

```bash
# 转换文件
skill convert <input> --to <format>

# 批量转换
skill convert <directory> --to <format> --recursive

# 指定输出目录
skill convert <input> --to <format> --output <directory>
```

### 选项

| 选项 | 描述 |
|------|------|
| `--to, -t <format>` | 目标格式 (claude, codex, cursor, continue, all) |
| `--output, -o <path>` | 输出目录 |
| `--overwrite` | 覆盖现有文件 |
| `--preserve-source` | 保留源文件 |
| `--recursive, -r` | 递归处理目录 |
| `--pattern <glob>` | Glob 匹配模式 |
| `--concurrency <number>` | 并发转换数量 |

## 使用示例

### 示例 1: 转换 Claude 技能为其他格式

```bash
# 转换为 Codex
skill convert my-skill.md --to codex

# 转换为所有格式
skill convert my-skill.md --to all --output ./formats
```

### 示例 2: 批量转换

```bash
# 转换整个目录
skill convert ./claude-skills --to cursor --output ./cursor-skills

# 使用模式匹配
skill convert "./**/*.claude" --to codex --recursive
```

### 示例 3: 编程使用

```typescript
import { convert, parseSkillAuto, detectFormat } from '@skillbolt/convert';

async function convertDirectory(inputDir: string, outputDir: string, targetFormat: Format) {
  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const content = fs.readFileSync(inputPath, 'utf-8');
    
    // 检测源格式
    const detected = detectFormat(content);
    console.log(`Detected: ${detected.format} (${detected.confidence}% confidence)`);
    
    // 解析技能
    const parsed = parseSkillAuto(content);
    
    // 转换
    const result = await convert(content, detected.format, targetFormat);
    
    // 保存
    const outputPath = path.join(outputDir, `${parsed.metadata.name}.${targetFormat}.json`);
    fs.writeFileSync(outputPath, result.content);
    
    if (result.warnings.length > 0) {
      console.warn(`Warnings for ${file}:`, result.warnings);
    }
  }
}
```

## 转换注意事项

### 有损转换

某些转换可能是有损的，因为不同格式支持的字段不同：

- **Claude → Codex**: Triggers 可能无法完全保留
- **Claude → Continue**: 版本信息可能丢失
- **Codex → Claude**: 模型特定信息可能需要调整

### 最佳实践

1. **备份原文件**: 转换前备份原始文件
2. **检查警告**: 注意转换警告信息
3. **验证结果**: 转换后验证技能是否正常工作
4. **手动调整**: 某些格式可能需要手动微调

## 故障排除

### 格式检测失败

如果自动检测失败，可以手动指定源格式：

```bash
skill convert skill.md --to codex --source claude
```

### 转换警告

警告不会阻止转换，但可能影响技能功能：

```
Warning: Triggers may not be fully supported in target format
Warning: Version information will be lost in this conversion
```

### 文件权限错误

确保对源文件和目标目录有读写权限：

```bash
chmod 644 skill.md
chmod 755 output-directory
```

## API 参考

### 主要函数

```typescript
// 格式检测
detectFormat(content: string): DetectResult;
detectFormatFromPath(filePath: string): Format;

// 解析
parseSkill(content: string, format: Format): ParsedSkill;
parseSkillAuto(content: string): ParsedSkill;
parseClaudeSkill(content: string): ParsedSkill;
parseCodexSkill(content: string): ParsedSkill;
parseCursorSkill(content: string): ParsedSkill;
parseContinueSkill(content: string): ParsedSkill;

// 转换
convert(content: string, from: Format, to: Format): Promise<ConvertResult>;
convertWithWarnings(skill: ParsedSkill, converter: Converter): ConversionOutput;
convertToAll(content: string, outputDir: string): Promise<ConvertResult[]>;

// 获取转换器
getConverter(from: Format, to: Format): Converter | undefined;
getSupportedConversions(): [Format, Format][];

// 获取解析器
getParser(format: Format): Parser | undefined;
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
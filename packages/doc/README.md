# @skillbolt/doc

技能文档生成工具，自动从技能文件生成各种格式的文档，包括 README、API 文档、示例等。

## 功能特性

- **多种文档类型**: 生成 README、API 文档、示例文档
- **灵活的模板系统**: 支持自定义模板和模板变量
- **多种输出格式**: 支持 Markdown、HTML、JSON
- **批量生成**: 支持批量处理多个技能
- **目录索引**: 自动生成技能目录索引
- **模板助手**: 内置常用的模板助手函数
- **自定义输出**: 可自定义输出格式和样式

## 基本使用

### CLI 使用

```bash
# 生成 README 文档
skill doc generate readme ./skills/my-skill.md

# 生成 API 文档
skill doc generate api ./skills/my-skill.md

# 生成示例文档
skill doc generate examples ./skills/my-skill.md

# 批量生成文档
skill doc batch ./skills --output ./docs

# 生成目录索引
skill doc index ./skills --output README.md
```

### API 使用

```typescript
import { generateReadme, generateApiDocs, generateExamples } from '@skillbolt/doc';

// 生成 README
const readme = await generateReadme(skill, {
  includeExamples: true,
  includeApi: true
});
console.log(readme.content);

// 生成 API 文档
const apiDocs = await generateApiDocs(skill, {
  includeParameters: true,
  includeExamples: true
});
console.log(apiDocs.content);

// 生成示例文档
const examples = await generateExamples(skill);
console.log(examples.content);
```

## 文档类型

### README 文档

生成完整的 README 文档，包含技能概述、安装说明、使用示例等：

```typescript
import { generateReadme } from '@skillbolt/doc';

const readme = await generateReadme(skill, {
  includeOverview: true,
  includeInstallation: true,
  includeUsage: true,
  includeExamples: true,
  includeApi: true
});

// 输出到文件
await writeOutput(readme.content, 'README.md', { format: 'markdown' });
```

### API 文档

生成详细的 API 文档，包含参数说明、返回值等：

```typescript
import { generateApiDocs } from '@skillbolt/doc';

const apiDocs = await generateApiDocs(skill, {
  includeParameters: true,
  includeReturns: true,
  includeExamples: true,
  format: 'markdown'
});
```

### 示例文档

提取和组织技能中的示例：

```typescript
import { generateExamples } from '@skillbolt/doc';

const examples = await generateExamples(skill, {
  includeCodeBlocks: true,
  formatExamples: true
});
```

## 模板系统

### 使用内置模板

```typescript
import {
  loadBuiltInTemplate,
  renderTemplate
} from '@skillbolt/doc';

// 加载内置模板
const template = loadBuiltInTemplate('readme');

// 渲染模板
const context = {
  skill: skill,
  metadata: skill.metadata,
  sections: skill.sections
};

const content = renderTemplate(template, context);
```

### 使用自定义模板

```typescript
import { loadTemplate, renderTemplate } from '@skillbolt/doc';

// 加载自定义模板
const template = await loadTemplate('./templates/my-template.md');

// 渲染模板
const content = renderTemplate(template, context);
```

### 模板上下文

```typescript
import { createTemplateContext } from '@skillbolt/doc';

const context = createTemplateContext(skill, {
  customVar: 'value',
  options: {
    includeExamples: true
  }
});

console.log(context.skill);
console.log(context.metadata);
console.log(context.sections);
```

## 模板助手

### 内置助手函数

```typescript
import {
  slugify,
  formatDate,
  capitalize,
  truncate,
  joinArray,
  indent,
  codeBlock,
  anchor
} from '@skillbolt/doc';

// 在模板中使用
// {{ slugify skill.name }}
// {{ formatDate metadata.createdAt }}
// {{ capitalize description }}
// {{ truncate content 100 }}
// {{ joinArray triggers ', ' }}
// {{ indent code 2 }}
// {{ codeBlock code 'typescript' }}
// {{ anchor 'section-title' }}
```

### 注册自定义助手

```typescript
import { registerHelper, getTemplateEngine } from '@skillbolt/doc';

// 注册自定义助手
registerHelper('customHelper', (value: string) => {
  return value.toUpperCase();
});

// 在模板中使用
// {{ customHelper skill.name }}
```

## 输出格式

### Markdown 输出

```typescript
import { toMarkdown, writeOutput } from '@skillbolt/doc';

const markdown = toMarkdown(content);

await writeOutput(markdown, 'output.md', {
  format: 'markdown',
  overwrite: true
});
```

### HTML 输出

```typescript
import { toHtml, writeOutput } from '@skillbolt/doc';

const html = toHtml(content, {
  theme: 'light',
  highlightCode: true
});

await writeOutput(html, 'output.html', {
  format: 'html'
});
```

### JSON 输出

```typescript
import { toJson, writeOutput } from '@skillbolt/doc';

const json = toJson(content, {
  pretty: true,
  indent: 2
});

await writeOutput(json, 'output.json', {
  format: 'json'
});
```

## 批量生成

### 扫描技能文件

```typescript
import { scanSkillFiles } from '@skillbolt/doc';

const skills = await scanSkillFiles('./skills', {
  recursive: true,
  pattern: '*.md'
});

console.log(`Found ${skills.length} skills`);
```

### 批量生成文档

```typescript
import { batchGenerate } from '@skillbolt/doc';

const result = await batchGenerate('./skills', {
  output: './docs',
  formats: ['readme', 'api'],
  template: 'default'
});

console.log(`Generated ${result.success} documents`);
console.log(`Failed: ${result.failed}`);
```

### 生成索引

```typescript
import { generateIndex } from '@skillbolt/doc';

const index = await generateIndex(skills, {
  output: './README.md',
  format: 'markdown',
  includeDescriptions: true,
  sortBy: 'name'
});
```

## 使用示例

### 示例 1: 生成完整文档

```typescript
import { generateReadme, generateApiDocs, generateExamples, writeOutput } from '@skillbolt/doc';
import { parseSkillFile } from '@skillbolt/core';

async function generateFullDocumentation(skillPath: string, outputDir: string) {
  // 解析技能
  const skill = await parseSkillFile(skillPath);
  
  // 生成各种文档
  const readme = await generateReadme(skill);
  const apiDocs = await generateApiDocs(skill);
  const examples = await generateExamples(skill);
  
  // 写入文件
  await writeOutput(readme.content, `${outputDir}/README.md`, { format: 'markdown' });
  await writeOutput(apiDocs.content, `${outputDir}/API.md`, { format: 'markdown' });
  await writeOutput(examples.content, `${outputDir}/EXAMPLES.md`, { format: 'markdown' });
  
  console.log(`Documentation generated for ${skill.manifest.name}`);
}
```

### 示例 2: 使用自定义模板

```typescript
import { loadTemplate, renderTemplate, createTemplateContext } from '@skillbolt/doc';

async function generateCustomDoc(skillPath: string, templatePath: string) {
  const skill = await parseSkillFile(skillPath);
  const template = await loadTemplate(templatePath);
  
  const context = createTemplateContext(skill, {
    customVar: 'custom-value'
  });
  
  const content = renderTemplate(template, context);
  
  await writeOutput(content, 'custom-doc.md', { format: 'markdown' });
}
```

### 示例 3: 批量生成 HTML 文档

```typescript
import { batchGenerate } from '@skillbolt/doc';

async function generateHtmlDocs(skillsDir: string, outputDir: string) {
  const result = await batchGenerate(skillsDir, {
    output: outputDir,
    formats: ['readme'],
    format: 'html',
    options: {
      theme: 'dark',
      highlightCode: true
    }
  });
  
  console.log(`Generated ${result.success} HTML documents`);
  console.log(`Failed: ${result.failed}`);
  
  // 生成索引
  await generateIndex(result.skills, {
    output: `${outputDir}/index.html`,
    format: 'html'
  });
}
```

## 类型定义

```typescript
interface GeneratorOptions {
  includeOverview?: boolean;
  includeInstallation?: boolean;
  includeUsage?: boolean;
  includeExamples?: boolean;
  includeApi?: boolean;
  format?: 'markdown' | 'html' | 'json';
}

interface GeneratorResult {
  content: string;
  metadata: GeneratorMetadata;
}

interface GeneratorMetadata {
  skillName: string;
  generatedAt: string;
  format: string;
}

interface TemplateContext {
  skill: Skill;
  metadata: SkillMetadata;
  sections: SkillSection[];
  [key: string]: unknown;
}

interface TemplateOptions {
  helpers?: Record<string, HelperFunction>;
  partials?: Record<string, string>;
}

interface OutputOptions {
  format: 'markdown' | 'html' | 'json';
  overwrite?: boolean;
  pretty?: boolean;
}

interface BatchOptions {
  output: string;
  formats?: DocType[];
  template?: string;
  format?: 'markdown' | 'html' | 'json';
  recursive?: boolean;
  concurrency?: number;
}

interface BatchResult {
  total: number;
  success: number;
  failed: number;
  results: BatchSuccessItem[];
  errors: BatchFailedItem[];
}
```

## CLI 命令

### generate 命令

```bash
skill doc generate <type> <skill-path>

# 类型
skill doc generate readme ./skill.md
skill doc generate api ./skill.md
skill doc generate examples ./skill.md

# 选项
skill doc generate readme ./skill.md --output ./docs
skill doc generate readme ./skill.md --template custom
skill doc generate readme ./skill.md --format html
```

### batch 命令

```bash
skill doc batch <directory>

# 选项
skill doc batch ./skills --output ./docs
skill doc batch ./skills --format readme,api
skill doc batch ./skills --format html
skill doc batch ./skills --recursive
```

### index 命令

```bash
skill doc index <directory>

# 选项
skill doc index ./skills --output README.md
skill doc index ./skills --format html
skill doc index ./skills --sort name
```

## 最佳实践

1. **模板组织**: 将模板放在单独的目录中便于管理
2. **版本控制**: 将生成的文档纳入版本控制
3. **持续集成**: 在 CI/CD 中自动生成文档
4. **自定义助手**: 为常用功能创建自定义助手
5. **格式一致性**: 使用统一的模板确保格式一致

## 故障排除

### 模板渲染失败

如果模板渲染失败：

1. 检查模板语法是否正确
2. 确认模板上下文包含所需变量
3. 查看详细的错误消息

### 输出格式问题

如果输出格式不符合预期：

1. 验证输出选项配置
2. 检查模板是否支持目标格式
3. 使用内置模板进行对比

### 批量生成失败

如果批量生成部分失败：

1. 检查失败项目的错误消息
2. 确认所有技能文件格式正确
3. 降低并发数量避免资源问题

## API 参考

### 主要导出

```typescript
// 生成器
export {
  generateReadme,
  generateApiDocs,
  generateExamples,
  generateToc,
  tocToMarkdown
};

// 模板引擎
export {
  TemplateEngine,
  loadBuiltInTemplate,
  loadTemplate,
  getTemplateEngine,
  renderTemplate,
  registerHelper
};

// 助手函数
export {
  slugify,
  formatDate,
  capitalize,
  truncate,
  joinArray,
  indent,
  codeBlock,
  anchor,
  defaultHelpers
};

// 输出
export {
  toMarkdown,
  normalizeMarkdown,
  toHtml,
  toJson,
  writeOutput
};

// 批量处理
export {
  scanSkillFiles,
  batchGenerate,
  generateIndex
};

// CLI
export { createDocCli };
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
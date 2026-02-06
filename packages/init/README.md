# @skillbolt/init

技能项目初始化工具，快速创建新的技能项目结构，支持多种平台和模板。

## 功能特性

- **快速初始化**: 一键生成技能项目结构
- **多平台支持**: 支持 Claude、Cursor、Continue 等平台
- **模板系统**: 提供多种预设模板
- **交互式提示**: 友好的命令行交互
- **自定义模板**: 支持使用自定义模板
- **目录结构**: 自动生成完整的目录结构
- **验证机制**: 验证生成的项目配置

## 基本使用

### CLI 使用

```bash
# 使用默认模板初始化
skill init my-skill

# 指定平台
skill init my-skill --platform claude
skill init my-skill --platform cursor
skill init my-skill --platform continue

# 使用特定模板
skill init my-skill --template advanced

# 指定输出目录
skill init my-skill --output ./skills

# 跳过交互式提示
skill init my-skill --name "My Skill" --description "A sample skill"
```

### API 使用

```typescript
import { initSkill } from '@skillbolt/init';

const result = await initSkill({
  name: 'my-skill',
  description: 'A sample skill',
  platform: 'claude',
  template: 'default',
  output: './skills'
});

console.log(result.success); // true
console.log(result.path); // './skills/my-skill'
console.log(result.tree); // 目录树结构
```

## 模板类型

### 内置模板

```typescript
import { TEMPLATE_CHOICES } from '@skillbolt/init';

console.log(TEMPLATE_CHOICES);
// [
//   { name: 'default', description: 'Basic skill template' },
//   { name: 'advanced', description: 'Advanced skill with examples' },
//   { name: 'minimal', description: 'Minimal skill template' }
// ]
```

### 平台类型

```typescript
import { PLATFORM_CHOICES } from '@skillbolt/init';

console.log(PLATFORM_CHOICES);
// [
//   { name: 'claude', description: 'Claude.ai format' },
//   { name: 'cursor', description: 'Cursor IDE format' },
//   { name: 'continue', description: 'Continue IDE format' }
// ]
```

## 交互式提示

### 运行交互式提示

```typescript
import { runInteractivePrompts } from '@skillbolt/init';

const answers = await runInteractivePrompts({
  defaults: {
    name: 'my-skill',
    description: 'A sample skill'
  }
});

console.log(answers.name);
console.log(answers.description);
console.log(answers.platform);
console.log(answers.template);
```

### 自定义问题

```typescript
import { questions } from '@skillbolt/init';

// 添加自定义问题
const customQuestions = [
  ...questions,
  {
    type: 'input',
    name: 'author',
    message: 'What is your name?'
  }
];

const answers = await customQuestions();
```

### 验证函数

```typescript
import {
  validateName,
  validateDescription,
  isValidTemplate,
  isValidPlatform
} from '@skillbolt/init';

// 验证技能名称
const nameValid = validateName('my-skill'); // true
const nameInvalid = validateName('My Skill!'); // false

// 验证描述
const descValid = validateDescription('A good description'); // true

// 验证模板
const templateValid = isValidTemplate('default'); // true

// 验证平台
const platformValid = isValidPlatform('claude'); // true
```

## 模板系统

### 加载模板

```typescript
import { loadTemplate, getTemplateDefinition } from '@skillbolt/init';

// 加载模板定义
const template = getTemplateDefinition('default');
console.log(template.name);
console.log(template.description);
console.log(template.files);

// 加载模板文件
const files = await loadTemplate('default');
console.log(files); // 模板文件列表
```

### 渲染模板

```typescript
import { renderTemplate, createTemplateContext } from '@skillbolt/init';

const context = createTemplateContext({
  name: 'my-skill',
  description: 'A sample skill',
  version: '1.0.0',
  author: 'John Doe'
});

const content = renderTemplate('skill-template.md', context);
```

### 模板变量

模板中可用的变量：

```handlebars
# 技能名称
{{ name }}

# 技能描述
{{ description }}

# 版本号
{{ version }}

# 作者
{{ author }}

# 触发词
{{ triggers }}

# 日期
{{ date }}

# 平台特定变量
{{ platform }}
```

## 目录生成

### 生成目录结构

```typescript
import { generateDirectory, generateFiles } from '@skillbolt/init';

// 生成目录
await generateDirectory('./skills/my-skill', {
  overwrite: true
});

// 生成文件
const files = [
  { path: 'README.md', content: '# My Skill' },
  { path: 'skill.md', content: 'Skill content...' }
];

await generateFiles('./skills/my-skill', files);
```

### 显示目录树

```typescript
import { displayTree, getTreeDisplay } from '@skillbolt/init';

// 显示树状结构
displayTree('./skills/my-skill');

// 获取树状显示字符串
const tree = getTreeDisplay('./skills/my-skill');
console.log(tree);
```

### 检查目录

```typescript
import {
  directoryExists,
  isDirectoryEmpty
} from '@skillbolt/init';

// 检查目录是否存在
const exists = await directoryExists('./skills/my-skill');

// 检查目录是否为空
const isEmpty = await isDirectoryEmpty('./skills/my-skill');
```

## 验证和验证器

### 验证初始化选项

```typescript
import { validateInitOptions } from '@skillbolt/init';

const options = {
  name: 'my-skill',
  description: 'A sample skill',
  platform: 'claude',
  template: 'default'
};

const result = validateInitOptions(options);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### 验证模板

```typescript
import { validateTemplate } from '@skillbolt/init';

const result = validateTemplate('default');

if (!result.valid) {
  console.error('Template errors:', result.errors);
}
```

### 验证输出

```typescript
import { validateOutput } from '@skillbolt/init';

const result = await validateOutput('./skills/my-skill');

if (!result.valid) {
  console.error('Output validation failed:', result.errors);
}
```

## 使用示例

### 示例 1: 基本初始化

```typescript
import { initSkill } from '@skillbolt/init';

async function createNewSkill() {
  const result = await initSkill({
    name: 'git-workflow',
    description: 'Git workflow management skill',
    platform: 'claude',
    template: 'default',
    output: './skills'
  });

  if (result.success) {
    console.log(`Skill created at: ${result.path}`);
    console.log('Directory structure:');
    console.log(result.tree);
  } else {
    console.error('Failed to create skill:', result.error);
  }
}
```

### 示例 2: 使用自定义模板

```typescript
import { initSkill } from '@skillbolt/init';

async function createWithCustomTemplate() {
  const result = await initSkill({
    name: 'my-skill',
    description: 'Custom template skill',
    template: './templates/my-custom-template',
    output: './skills'
  });

  console.log(result.success);
}
```

### 示例 3: 交互式初始化

```typescript
import { runInteractivePrompts, initSkill } from '@skillbolt/init';

async function interactiveCreate() {
  // 运行交互式提示
  const answers = await runInteractivePrompts();

  // 使用答案初始化
  const result = await initSkill({
    ...answers,
    output: './skills'
  });

  if (result.success) {
    console.log('Skill created successfully!');
  }
}
```

### 示例 4: 批量初始化

```typescript
import { initSkill } from '@skillbolt/init';

async function batchCreate(skills: Array<{ name: string; description: string }>) {
  for (const skill of skills) {
    const result = await initSkill({
      ...skill,
      platform: 'claude',
      template: 'default',
      output: './skills'
    });

    if (result.success) {
      console.log(`Created: ${skill.name}`);
    } else {
      console.error(`Failed: ${skill.name}`, result.error);
    }
  }
}

batchCreate([
  { name: 'skill-1', description: 'First skill' },
  { name: 'skill-2', description: 'Second skill' },
  { name: 'skill-3', description: 'Third skill' }
]);
```

## CLI 命令

### init 命令

```bash
skill init <name>

# 选项
skill init my-skill --platform claude
skill init my-skill --template advanced
skill init my-skill --output ./skills
skill init my-skill --name "My Skill"
skill init my-skill --description "A description"
skill init my-skill --author "John Doe"
skill init my-skill --no-prompts
skill init my-skill --overwrite
```

## 类型定义

```typescript
interface InitOptions {
  name?: string;
  description?: string;
  platform?: 'claude' | 'cursor' | 'continue';
  template?: string;
  output?: string;
  author?: string;
  triggers?: string[];
  noPrompts?: boolean;
  overwrite?: boolean;
}

interface GeneratedResult {
  success: boolean;
  path: string;
  tree: string;
  error?: string;
}

interface TemplateContext {
  name: string;
  description: string;
  version: string;
  author?: string;
  triggers?: string[];
  date: string;
  platform: string;
  [key: string]: unknown;
}

interface TemplateFile {
  path: string;
  content: string;
}

interface TemplateDefinition {
  name: string;
  description: string;
  files: TemplateFile[];
  variables?: string[];
}

interface QuestionConfig {
  type: 'input' | 'confirm' | 'list' | 'checkbox';
  name: string;
  message: string;
  default?: unknown;
  choices?: Array<{ name: string; value: string }>;
  validate?: (value: unknown) => boolean | string;
}
```

## 最佳实践

1. **命名规范**: 使用 kebab-case 命名技能
2. **描述清晰**: 提供清晰的技能描述
3. **模板选择**: 根据需求选择合适的模板
4. **版本控制**: 初始化后立即提交到版本控制
5. **自定义模板**: 对于重复使用的模式，创建自定义模板

## 故障排除

### 目录已存在

如果目标目录已存在：

```bash
# 使用 --overwrite 选项覆盖
skill init my-skill --overwrite
```

### 模板未找到

如果指定的模板未找到：

1. 检查模板名称拼写
2. 使用 `--template default` 使用内置模板
3. 提供自定义模板的完整路径

### 验证失败

如果验证失败：

1. 检查技能名称是否有效（仅字母、数字、连字符）
2. 确保描述不为空
3. 验证平台和模板选项

## API 参考

### 主要导出

```typescript
// 初始化
export { initSkill, getTreeDisplay };

// 提示
export {
  runInteractivePrompts,
  questions,
  createQuestions,
  validateName,
  validateDescription,
  filterTriggers,
  isValidTemplate,
  isValidPlatform
};

// 模板
export {
  loadTemplate,
  getTemplateDefinition,
  getTemplateFiles,
  renderTemplate,
  renderTemplateFile,
  createTemplateContext
};

// 生成器
export {
  generateDirectory,
  generateFiles,
  directoryExists,
  isDirectoryEmpty,
  displayTree
};

// 验证器
export {
  validateInitOptions,
  validateTemplate,
  validatePlatform,
  validateOutput
};

// 常量
export { TEMPLATE_CHOICES, PLATFORM_CHOICES, DEFAULTS };
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
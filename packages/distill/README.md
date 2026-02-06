# @skillbolt/distill

从对话历史中自动提取和生成技能的工具，使用 LLM 分析对话内容并创建结构化的技能定义。

## 功能特性

- **智能提取**: 使用 LLM 从对话中提取技能意图和步骤
- **对话预处理**: 过滤失败尝试和无关内容
- **参数提取**: 自动识别技能参数和类型
- **质量增强**: 使用 LLM 改进生成的技能质量
- **失败过滤**: 自动过滤不成功的对话尝试
- **多格式输出**: 支持多种输出格式
- **会话管理**: 支持多个会话的处理

## 基本使用

### CLI 使用

```bash
# 从对话文件提取技能
skill distill conversation.json

# 指定输出文件
skill distill conversation.json --output skill.md

# 跳过失败过滤
skill distill conversation.json --skip-failed-filter

# 详细输出
skill distill conversation.json --verbose
```

### API 使用

```typescript
import { Distiller } from '@skillbolt/distill';

const distiller = new Distiller();

const session = {
  id: 'session-1',
  messages: [
    { role: 'user', content: 'Help me create a git workflow' },
    { role: 'assistant', content: 'I can help with that...' },
    // ... 更多消息
  ]
};

const result = await distiller.distill(session, {
  verbose: true
});

console.log(result.skill);
console.log(result.metadata);
// {
//   sessionId: 'session-1',
//   distilledAt: '2024-01-15T10:30:00.000Z',
//   tokenUsage: { input: 1500, output: 800 },
//   stepsFiltered: 2
// }
```

## 核心 API

### Distiller 类

```typescript
import { Distiller, DistillerOptions } from '@skillbolt/distill';

const options: DistillerOptions = {
  userPrompts: ['custom prompt 1', 'custom prompt 2'],
  skipFailedFilter: false,
  verbose: true
};

const distiller = new Distiller();
const result = await distiller.distill(session, options);
```

### Session 类型

```typescript
interface Session {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
  }>;
}
```

### 提取结果

```typescript
interface DistillResult {
  skill: Skill;
  metadata: {
    sessionId: string;
    distilledAt: string;
    tokenUsage: {
      input: number;
      output: number;
    };
    stepsFiltered: number;
  };
}
```

## 提取过程

Distiller 按以下步骤处理对话：

1. **对话预处理**: 清理和标准化消息格式
2. **失败过滤**: 移除不成功的尝试和无关内容
3. **意图提取**: 使用 LLM 识别技能的主要目标和触发词
4. **步骤提取**: 将对话转换为结构化的执行步骤
5. **参数提取**: 识别步骤中的可变参数
6. **描述生成**: 生成技能描述和概述
7. **质量增强**: 使用 LLM 改进技能质量

## 输出格式

### 生成的技能结构

```typescript
interface Skill {
  metadata: {
    name: string;
    description: string;
    version: string;
  };
  overview: string;
  triggers: string[];
  prerequisites: string[];
  steps: SkillStep[];
  parameters: SkillParameter[];
  errorHandling: string[];
  examples: string[];
  notes: string[];
}

interface SkillStep {
  id: string;
  description: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

interface SkillParameter {
  name: string;
  type: 'string' | 'boolean' | 'number';
  description: string;
  default?: unknown;
  required: boolean;
}
```

## 高级功能

### 自定义提示词

```typescript
const distiller = new Distiller();

const result = await distiller.distill(session, {
  userPrompts: [
    'Focus on creating reusable steps',
    'Include error handling examples',
    'Add practical use cases'
  ]
});
```

### 跳过失败过滤

```typescript
const result = await distiller.distill(session, {
  skipFailedFilter: true
});
```

### 使用自定义 LLM 引擎

```typescript
import { Distiller, LLMEngine } from '@skillbolt/distill';

const customEngine = new LLMEngine({
  // 自定义配置
});

const distiller = new Distiller(customEngine);
const result = await distiller.distill(session);
```

## 组件说明

### 对话预处理器 (ConversationPreprocessor)

清理和标准化对话消息：

```typescript
import { ConversationPreprocessor } from '@skillbolt/distill';

const preprocessor = new ConversationPreprocessor();
const result = preprocessor.process(session.messages);

console.log(result.messages); // 处理后的消息
console.log(result.metadata); // 预处理元数据
```

### 失败过滤器 (FailedAttemptFilter)

过滤不成功的对话尝试：

```typescript
import { FailedAttemptFilter } from '@skillbolt/distill';

const filter = new FailedAttemptFilter();
const result = filter.filter(messages);

console.log(result.messages); // 过滤后的消息
console.log(result.removedCount); // 移除的消息数量
```

### 参数提取器 (ParameterExtractor)

从步骤中提取参数：

```typescript
import { ParameterExtractor } from '@skillbolt/distill';

const extractor = new ParameterExtractor();

const steps = [
  { id: 'step1', description: 'Process ${input}' },
  { id: 'step2', description: 'Save to ${path}' }
];

const result = extractor.extract(steps, []);

console.log(result.steps); // 参数化的步骤
console.log(result.parameters); // 提取的参数
```

### LLM 引擎 (LLMEngine)

与 LLM 交互的核心引擎：

```typescript
import { LLMEngine } from '@skillbolt/distill';

const engine = new LLMEngine();

// 提取意图
const intent = await engine.extractIntent(session);

// 提取步骤
const steps = await engine.distillSteps(session, intent);

// 生成描述
const description = await engine.generateDescription(intent);

// 增强质量
const enhanced = await engine.enhanceQuality(skill);

// 获取 token 使用情况
const usage = engine.getTokenUsage();
console.log(usage.inputTokens);
console.log(usage.outputTokens);
```

## 使用示例

### 示例 1: 基本提取

```typescript
import { Distiller } from '@skillbolt/distill';

const session = {
  id: 'git-workflow-session',
  messages: [
    {
      role: 'user',
      content: 'Help me create a git workflow for feature branches'
    },
    {
      role: 'assistant',
      content: 'I\'ll help you create a git workflow. Here are the steps...'
    }
  ]
};

const distiller = new Distiller();
const result = await distiller.distill(session);

console.log('Skill Name:', result.skill.metadata.name);
console.log('Triggers:', result.skill.triggers);
console.log('Steps:', result.skill.steps);
console.log('Token Usage:', result.metadata.tokenUsage);
```

### 示例 2: 批量处理

```typescript
import { Distiller } from '@skillbolt/distill';
import { promises as fs } from 'fs';

async function distillMultipleSessions(sessionsDir: string, outputDir: string) {
  const distiller = new Distiller();
  const files = await fs.readdir(sessionsDir);

  for (const file of files) {
    const session = JSON.parse(await fs.readFile(`${sessionsDir}/${file}`, 'utf-8'));
    
    const result = await distiller.distill(session, { verbose: true });
    
    // 保存技能
    const outputPath = `${outputDir}/${result.skill.metadata.name}.md`;
    await fs.writeFile(outputPath, formatSkillAsMarkdown(result.skill));
    
    console.log(`Distilled: ${result.skill.metadata.name}`);
    console.log(`Tokens: ${result.metadata.tokenUsage.input} in, ${result.metadata.tokenUsage.output} out`);
  }
}
```

### 示例 3: 自定义处理

```typescript
import { Distiller, ConversationPreprocessor, FailedAttemptFilter } from '@skillbolt/distill';

async function customDistillation(session: Session) {
  // 自定义预处理
  const preprocessor = new ConversationPreprocessor();
  const preprocessed = preprocessor.process(session.messages);
  
  // 自定义过滤
  const filter = new FailedAttemptFilter();
  const filtered = filter.filter(preprocessed.messages);
  
  // 创建新的会话
  const filteredSession = {
    ...session,
    messages: filtered.messages
  };
  
  // 提取技能
  const distiller = new Distiller();
  const result = await distiller.distill(filteredSession, {
    userPrompts: [
      'Focus on best practices',
      'Include error handling'
    ],
    verbose: true
  });
  
  return result;
}
```

## 最佳实践

1. **准备对话**: 确保对话清晰、结构良好，包含完整的来回对话
2. **检查输出**: 提取后检查生成的技能是否准确反映对话内容
3. **参数验证**: 验证提取的参数类型和默认值是否正确
4. **步骤优化**: 可能需要手动优化提取的步骤描述
5. **Token 监控**: 注意 token 使用量，避免超限

## 限制和注意事项

- **质量依赖**: 提取质量依赖于 LLM 的理解和对话的清晰度
- **上下文限制**: 长对话可能被截断
- **参数推断**: 参数推断可能不准确，需要人工审核
- **成本考虑**: 每次提取都会消耗 LLM tokens

## 故障排除

### 提取结果不理想

如果提取的技能质量不高：

1. 检查对话是否足够清晰和完整
2. 使用自定义提示词引导提取
3. 跳过失败过滤以保留更多上下文
4. 手动调整提取后的技能

### Token 使用过高

如果 token 使用量过高：

1. 缩短对话长度
2. 使用 `skipFailedFilter` 过滤无关内容
3. 分批处理长对话

### 参数提取不准确

如果参数提取不准确：

1. 在对话中更明确地说明参数
2. 手动检查和调整参数定义
3. 使用自定义提示词强调参数识别

## 类型定义

```typescript
interface Skill {
  metadata: SkillMetadata;
  overview: string;
  triggers: string[];
  prerequisites: string[];
  steps: SkillStep[];
  parameters: SkillParameter[];
  errorHandling: string[];
  examples: string[];
  notes: string[];
}

interface SkillMetadata {
  name: string;
  description: string;
  version: string;
}

interface SkillStep {
  id: string;
  description: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

interface SkillParameter {
  name: string;
  type: 'string' | 'boolean' | 'number';
  description: string;
  default?: unknown;
  required: boolean;
}

interface Session {
  id: string;
  messages: SessionMessage[];
}

interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface DistillResult {
  skill: Skill;
  metadata: DistillMetadata;
}

interface DistillMetadata {
  sessionId: string;
  distilledAt: string;
  tokenUsage: {
    input: number;
    output: number;
  };
  stepsFiltered: number;
}

interface DistillerOptions {
  userPrompts?: string[];
  skipFailedFilter?: boolean;
  verbose?: boolean;
}
```

## API 参考

### 主要导出

```typescript
// 核心
export { Distiller };

// 类型
export type {
  Skill,
  SkillMetadata,
  SkillStep,
  SkillParameter,
  Session,
  SessionMessage,
  DistillResult,
  DistillMetadata,
  DistillerOptions
};

// 组件
export {
  ConversationPreprocessor,
  FailedAttemptFilter,
  ParameterExtractor,
  LLMEngine
};

// 版本
export { VERSION };
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
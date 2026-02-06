# @skillbolt/compose

工作流编排引擎，允许通过 YAML 配置文件定义和执行复杂的技能工作流，支持条件、循环、并行等控制流。

## 功能特性

- **声明式工作流**: 使用 YAML 定义工作流
- **变量插值**: 支持在步骤之间传递数据
- **条件执行**: 支持条件分支和逻辑判断
- **循环控制**: 支持 foreach 和 while 循环
- **并行执行**: 支持并行执行多个步骤
- **错误处理**: 支持重试、继续和回退策略
- **子工作流**: 支持工作流嵌套和复用
- **可视化**: 生成 ASCII 和 Mermaid 流程图

## 工作流定义

### 基本结构

```yaml
name: my-workflow
description: A sample workflow
inputs:
  message:
    type: string
    default: "Hello"

steps:
  - id: step1
    skill: echo
    inputs:
      text: "${inputs.message}"
```

### 步骤类型

#### 1. 基本技能步骤

```yaml
steps:
  - id: analyze
    skill: code-analyzer
    inputs:
      code: "${inputs.code}"
      language: "typescript"
```

#### 2. 条件步骤

```yaml
steps:
  - id: check
    condition:
      if: "${inputs.fileType} == 'typescript'"
      then:
        id: process-ts
        skill: ts-analyzer
      else:
        id: process-js
        skill: js-analyzer
```

#### 3. 并行步骤

```yaml
steps:
  - id: parallel-tasks
    parallel:
      - id: task1
        skill: analyzer
        inputs:
          file: "file1.ts"
      - id: task2
        skill: analyzer
        inputs:
          file: "file2.ts"
```

#### 4. Foreach 循环

```yaml
steps:
  - id: process-files
    foreach:
      items: "${inputs.files}"
      as: file
      step:
        id: analyze-${file}
        skill: analyzer
        inputs:
          file: "${file}"
```

#### 5. While 循环

```yaml
steps:
  - id: retry-until-success
    while:
      condition: "${retry.count < 3 and lastResult.success == false}"
      step:
        id: attempt
        skill: flaky-operation
        inputs:
          attempt: "${retry.count}"
```

#### 6. 子工作流

```yaml
steps:
  - id: sub-workflow
    workflow: ./sub-workflow.yaml
    inputs:
      data: "${inputs.data}"
```

### 变量引用

```yaml
steps:
  - id: step1
    skill: processor
    inputs:
      value: 42
  
  - id: step2
    skill: consumer
    inputs:
      previous: "${step1.outputs}"
      direct: "${step1.outputs.result}"
      nested: "${step1.outputs.data.items[0]}"
```

### 条件执行

```yaml
steps:
  - id: conditional-step
    skill: processor
    when: "${inputs.enabled == true}"
    inputs:
      data: "${inputs.data}"
```

### 错误处理

```yaml
steps:
  - id: flaky-step
    skill: unstable-operation
    onError:
      action: retry  # retry, continue, stop, fallback
      retry:
        maxRetries: 3
        initialDelay: 1000
        backoffMultiplier: 2
      fallback: "default-value"
```

## API 使用

### 基本执行

```typescript
import { executeWorkflow, createExecutor } from '@skillbolt/compose';

const workflow = {
  name: 'simple-workflow',
  steps: [
    { id: 'step1', skill: 'echo', inputs: { message: 'Hello' } },
    { id: 'step2', skill: 'processor', inputs: { data: '${step1.result}' } }
  ]
};

const result = await executeWorkflow(workflow, {
  skillExecutor: async (skillName, inputs, context) => {
    // 自定义技能执行器
    return { output: 'processed' };
  }
});

console.log(result.status); // 'completed', 'failed', 'cancelled'
console.log(result.steps);  // 步骤结果数组
```

### 使用执行器

```typescript
import { createExecutor } from '@skillbolt/compose';

const executor = createExecutor(workflow, {
  skillExecutor: mySkillExecutor,
  inputs: { message: 'Hello' }
});

// 取消执行
setTimeout(() => executor.cancel(), 5000);

const result = await executor.execute();
```

### 事件处理

```typescript
const result = await executeWorkflow(workflow, {
  skillExecutor: myExecutor,
  onStepStart: (step, context) => {
    console.log(`Starting step: ${step.id}`);
  },
  onStepComplete: (step, result, context) => {
    console.log(`Completed step: ${step.id}, status: ${result.status}`);
  },
  onStepError: (step, error, context) => {
    console.error(`Error in step: ${step.id}`, error);
  },
  onWorkflowStart: (workflow) => {
    console.log('Starting workflow');
  },
  onWorkflowComplete: (result) => {
    console.log('Workflow completed', result);
  }
});
```

### 解析工作流

```typescript
import { parseWorkflowFile, parseWorkflowString } from '@skillbolt/compose';

// 从文件解析
const workflow = await parseWorkflowFile('./workflow.yaml');

// 从字符串解析
const yaml = `
name: test
steps:
  - id: step1
    skill: echo
`;
const workflow = parseWorkflowString(yaml);
```

### 验证工作流

```typescript
import { validateWorkflow } from '@skillbolt/compose';

const result = await validateWorkflow(workflow);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// 获取 JSON Schema
const schema = getWorkflowSchema();
```

### 变量插值

```typescript
import { interpolate, resolveVariable } from '@skillbolt/compose';

const context = {
  inputs: { name: 'Alice' },
  step1: { result: 'success' }
};

// 插值字符串
const result = interpolate('Hello ${inputs.name}, status: ${step1.result}', context);
// "Hello Alice, status: success"

// 解析变量
const value = resolveVariable('inputs.name', context); // "Alice"
```

### 条件评估

```typescript
import { evaluateCondition } from '@skillbolt/compose';

const context = createExecutionContext(workflow, { inputs: { count: 5 } });

const isTrue = await evaluateCondition('${inputs.count} > 3', context);
// true

const isFalse = await evaluateCondition('${inputs.count} == 10', context);
// false
```

### 可视化

```typescript
import { toAscii, toMermaid } from '@skillbolt/compose';

// ASCII 流程图
const ascii = toAscii(workflow);
console.log(ascii);

// Mermaid 图表
const mermaid = toMermaid(workflow);
console.log(mermaid);

// 带样式的 Mermaid
const styledMermaid = toMermaidWithStyles(workflow, {
  theme: 'dark',
  nodeColor: '#4CAF50'
});
```

## CLI 命令

### 执行工作流

```bash
skill compose run workflow.yaml
skill compose run workflow.yaml --input message="Hello"
skill compose run workflow.yaml --dry-run
skill compose run workflow.yaml --timeout 60000
```

### 验证工作流

```bash
skill compose validate workflow.yaml
skill compose validate workflow.yaml --strict
```

### 可视化工作流

```bash
skill compose visualize workflow.yaml
skill compose visualize workflow.yaml --format ascii
skill compose visualize workflow.yaml --format mermaid
skill compose visualize workflow.yaml --output diagram.mmd
```

## 执行上下文

工作流执行使用上下文管理变量和状态：

```typescript
import { createExecutionContext } from '@skillbolt/compose';

const context = createExecutionContext(workflow, {
  inputs: { name: 'Alice' }
});

// 设置变量
context.setVariable('myVar', 'value');

// 获取变量
const value = context.getVariable('myVar');

// 作用域管理
context.pushScope('step', 'step1');
context.setVariable('local', 'value1');
context.popScope();

// 步骤结果
context.setStepResult('step1', {
  stepId: 'step1',
  status: 'completed',
  outputs: { result: 'success' }
});

const result = context.getStepResult('step1');

// 取消执行
context.cancel();
```

## 错误处理策略

### 重试 (retry)

```yaml
onError:
  action: retry
  retry:
    maxRetries: 3
    initialDelay: 1000
    backoffMultiplier: 2
```

### 继续执行 (continue)

```yaml
onError:
  action: continue
  fallback: "default-value"
```

### 停止执行 (stop)

```yaml
onError:
  action: stop
  message: "Critical error, stopping workflow"
```

### 回退值 (fallback)

```yaml
onError:
  action: fallback
  fallback: "${step1.outputs}"
```

## 类型定义

```typescript
interface Workflow {
  name: string;
  description?: string;
  inputs?: Record<string, InputDefinition>;
  outputs?: Record<string, OutputDefinition>;
  steps: WorkflowStep[];
}

interface SkillStep {
  id: string;
  skill: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  when?: string;
  onError?: ErrorStrategy;
}

interface ParallelStep {
  id: string;
  parallel: WorkflowStep[];
}

interface ConditionStep {
  id: string;
  condition: {
    if: string;
    then: WorkflowStep;
    else?: WorkflowStep;
  };
}

interface ForeachStep {
  id: string;
  foreach: {
    items: string;
    as: string;
    step: WorkflowStep;
  };
}

interface WhileStep {
  id: string;
  while: {
    condition: string;
    step: WorkflowStep;
  };
}

interface SubWorkflowStep {
  id: string;
  workflow: string;
  inputs?: Record<string, unknown>;
}
```

## 使用示例

### 完整工作流示例

```yaml
name: code-review-workflow
description: Automated code review workflow

inputs:
  repoUrl:
    type: string
    required: true
  branch:
    type: string
    default: "main"

steps:
  - id: clone
    skill: git-clone
    inputs:
      url: "${inputs.repoUrl}"
      branch: "${inputs.branch}"

  - id: analyze
    skill: code-analyzer
    inputs:
      path: "${clone.outputs.path}"
    when: "${clone.success == true}"

  - id: parallel-checks
    parallel:
      - id: lint
        skill: linter
        inputs:
          files: "${analyze.outputs.files}"

      - id: security
        skill: security-scanner
        inputs:
          files: "${analyze.outputs.files}"

      - id: tests
        skill: test-runner
        inputs:
          path: "${clone.outputs.path}"

  - id: generate-report
    skill: report-generator
    inputs:
      lintResults: "${lint.outputs}"
      securityResults: "${security.outputs}"
      testResults: "${tests.outputs}"

  - id: notify
    skill: notifier
    inputs:
      message: "${generate-report.outputs.summary}"
    onError:
      action: continue
```

### 条件工作流

```yaml
name: deploy-workflow

inputs:
  environment:
    type: string
    enum: [dev, staging, prod]

steps:
  - id: deploy
    condition:
      if: "${inputs.environment} == 'prod'"
      then:
        id: deploy-prod
        skill: deploy-prod
      else:
        id: deploy-non-prod
        skill: deploy-dev
```

### 循环处理

```yaml
name: batch-processor

inputs:
  items:
    type: array

steps:
  - id: process-all
    foreach:
      items: "${inputs.items}"
      as: item
      step:
        id: process-${item.id}
        skill: processor
        inputs:
          data: "${item}"
        onError:
          action: continue
```

## 最佳实践

1. **命名规范**: 使用 kebab-case 命名步骤 ID
2. **错误处理**: 为不稳定步骤添加适当的错误处理
3. **并行化**: 将独立步骤组织成并行块以提高效率
4. **复用**: 将常用工作流提取为子工作流
5. **验证**: 使用 `skill compose validate` 在执行前验证工作流
6. **文档**: 为工作流添加描述和注释

## 故障排除

### 变量未定义

确保变量在作用域中已定义，检查插值语法是否正确：

```yaml
# 错误
inputs:
  value: "${undefinedVar}"

# 正确
inputs:
  value: "${inputs.definedVar}"
```

### 条件评估失败

检查条件表达式语法，确保比较操作符使用正确：

```yaml
# 错误
when: "${inputs.count > 10}"

# 正确
when: "${inputs.count} > 10"
```

### 循环无限执行

为 while 循环添加明确的退出条件和最大迭代次数限制。

## 性能优化

1. 使用并行执行减少总时间
2. 避免不必要的变量插值
3. 缓存重复的计算结果
4. 使用子工作流组织复杂逻辑

## 许可证

MIT
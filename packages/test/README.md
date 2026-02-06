# @skillbolt/test

技能测试框架，提供完整的技能测试、覆盖率分析和 Mock 功能。

## 功能特性

- **触发词测试**: 测试技能对不同触发词的响应
- **覆盖率分析**: 分析触发词和章节的测试覆盖率
- **Mock 支持**: Mock LLM 响应用于测试
- **录制和回放**: 录制真实响应用于回归测试
- **多种匹配模式**: 支持精确、包含、模糊和正则匹配
- **多种输出格式**: 支持 console、JSON、HTML 格式
- **监视模式**: 文件变化时自动运行测试

## 基本使用

### CLI 使用

```bash
# 运行测试（匹配所有 .skill-test.{yaml,yml,json} 文件）
skill test

# 运行特定测试文件
skill test ./tests/basic-test.skill-test.yaml

# 运行匹配模式的测试文件
skill test "./tests/**/*.skill-test.yaml"

# 生成覆盖率报告
skill test --coverage

# 监视模式
skill test --watch

# 指定输出格式（当前仅支持控制台输出）
skill test --verbose
```

### API 使用

```typescript
import { createTestRunner, runTests } from '@skillbolt/test';

// 创建测试运行器
const runner = createTestRunner({
  cwd: process.cwd(),
  watch: false,
  coverage: false,
  verbose: false
});

// 运行测试
const result = await runner.run(['./tests/basic-test.skill-test.yaml']);

console.log('Total tests:', result.totalTests);
console.log('Passed:', result.passed);
console.log('Failed:', result.failed);
console.log('Duration:', result.duration);
```

## 定义测试

### YAML 测试文件

```yaml
description: Git Workflow Tests
skill: ./path/to/skill.md
cases:
  - name: Git init trigger
    input: git init
    shouldTrigger: true

  - name: Git add trigger
    input: git add .
    shouldTrigger: true

  - name: Non-matching input
    input: hello world
    shouldTrigger: false
```

### JavaScript/TypeScript 测试文件

```typescript
import { defineTests } from '@skillbolt/test';

export default defineTests({
  description: 'Git workflow trigger tests',
  skill: './path/to/skill.md',
  cases: [
    {
      name: 'Git init trigger',
      input: 'git init',
      shouldTrigger: true,
      matchType: 'exact',
      minConfidence: 0.9
    },
    {
      name: 'Git add trigger',
      input: 'git add .',
      shouldTrigger: true
    },
    {
      name: 'Non-matching input',
      input: 'hello world',
      shouldTrigger: false
    }
  ]
});
```

### 高级测试定义

```typescript
export default defineTests({
  description: 'Advanced trigger tests',
  skill: './path/to/skill.md',
  cases: [
    {
      name: 'Fuzzy match test',
      input: 'help me with git workflow',
      shouldTrigger: true,
      matchType: 'fuzzy',
      minConfidence: 0.7
    },
    {
      name: 'Exact match test',
      input: 'git init',
      shouldTrigger: true,
      matchType: 'exact',
      minConfidence: 1.0
    }
  ]
});
```

## 匹配类型

测试框架支持多种匹配类型来检查输入是否触发技能：

- **exact**: 精确匹配（默认）- 输入必须与触发词完全相同
- **contains**: 包含匹配 - 输入包含触发词
- **fuzzy**: 模糊匹配 - 使用编辑距离计算相似度
- **regex**: 正则匹配 - 使用正则表达式匹配

### 精确匹配 (exact)

```typescript
{
  name: 'Exact match test',
  input: 'git init',
  shouldTrigger: true,
  matchType: 'exact'
}
```

### 包含匹配 (contains)

```typescript
{
  name: 'Contains match test',
  input: 'please run git init for me',
  shouldTrigger: true,
  matchType: 'contains'
}
```

### 模糊匹配 (fuzzy)

```typescript
{
  name: 'Fuzzy match test',
  input: 'help me with git',
  shouldTrigger: true,
  matchType: 'fuzzy',
  minConfidence: 0.7
}
```

### 正则匹配 (regex)

```yaml
# 在 SKILL.md 中定义正则触发词
triggers:
  - /^git\s+(init|clone|add)/
```

```typescript
{
  name: 'Regex match test',
  input: 'git init',
  shouldTrigger: true
}
```

## 覆盖率分析

### 收集覆盖率

```typescript
import { createCoverageCollector, collectCoverage } from '@skillbolt/test';

const collector = createCoverageCollector();

// 运行测试并收集覆盖率
const result = await runTests(coverageCollector);

// 获取覆盖率报告
const coverage = collector.getReport();

console.log('Trigger coverage:', coverage.triggerCoverage);
console.log('Section coverage:', coverage.sectionCoverage);
```

### 覆盖率报告

```typescript
import { generateCoverageReport, createCoverageReporter } from '@skillbolt/test';

// 生成文本报告
const textReport = generateCoverageReport(coverage);

// 生成 HTML 报告
const htmlReporter = createCoverageReporter('html');
const htmlReport = await htmlReporter.generate(coverage, {
  output: './coverage/index.html'
});
```

### 覆盖率类型

```typescript
interface TriggerCoverage {
  trigger: string;
  tested: boolean;
  testCount: number;
  lastTested?: Date;
}

interface SectionCoverage {
  section: string;
  tested: boolean;
  coverage: number; // 0-1
}
```

## Mock 功能

### 创建 Mock Provider

```typescript
import { createMockProvider } from '@skillbolt/test';

const mockProvider = createMockProvider({
  responses: {
    'git init': {
      role: 'assistant',
      content: 'Git repository initialized successfully.'
    },
    'git add': {
      role: 'assistant',
      content: 'Files staged for commit.'
    }
  }
});
```

### 录制响应

```typescript
import { createRecorder, recordResponses } from '@skillbolt/test';

const recorder = createRecorder({
  outputPath: './recordings/git-workflow.json'
});

// 录制真实响应
await recordResponses(skill, testCases, recorder);
```

### 回放响应

```typescript
import { loadRecording, replayResponses } from '@skillbolt/test';

// 加载录制
const recording = await loadRecording('./recordings/git-workflow.json');

// 回放响应
const mockProvider = replayResponses(recording);
```

## 使用示例

### 示例 1: 基本测试（使用 YAML 测试文件）

```typescript
import { createTestRunner } from '@skillbolt/test';

async function runBasicTests() {
  const runner = createTestRunner({
    cwd: process.cwd(),
    verbose: true
  });

  const result = await runner.run(['./tests/basic-test.skill-test.yaml']);

  if (result.failed > 0) {
    console.error('Some tests failed');
    result.suites.forEach(suite => {
      suite.results.forEach(test => {
        if (!test.passed) {
          console.error(`❌ ${test.name}: ${test.error}`);
        }
      });
    });
  } else {
    console.log('All tests passed! ✅');
  }

  return result;
}
```

### 示例 2: 带覆盖率的测试

```typescript
import { createTestRunner, createCoverageCollector } from '@skillbolt/test';

async function runTestsWithCoverage(skillPath: string) {
  const coverageCollector = createCoverageCollector();
  
  const runner = createTestRunner({
    skillPath,
    tests: testSuites,
    coverageCollector
  });

  const result = await runner.run();

  // 生成覆盖率报告
  const coverage = coverageCollector.getReport();
  
  console.log('Trigger Coverage:');
  coverage.triggerCoverage.forEach(trigger => {
    const status = trigger.tested ? '✅' : '❌';
    console.log(`  ${status} ${trigger.trigger} (${trigger.testCount} tests)`);
  });

  console.log('\nSection Coverage:');
  coverage.sectionCoverage.forEach(section => {
    const percentage = Math.round(section.coverage * 100);
    console.log(`  ${section.section}: ${percentage}%`);
  });
}
```

### 示例 3: 使用 Mock 测试

```typescript
import { createTestRunner, createMockProvider } from '@skillbolt/test';

async function runMockTests() {
  const mockProvider = createMockProvider({
    responses: {
      'git init': {
        role: 'assistant',
        content: 'Repository initialized.'
      },
      'git commit': {
        role: 'assistant',
        content: 'Commit successful.'
      }
    }
  });

  const runner = createTestRunner({
    skillPath: './skill.md',
    tests: testCases,
    mockProvider
  });

  const result = await runner.run();
  console.log('Tests completed with mocks');
  return result;
}
```

### 示例 4: 监视模式

```typescript
import { createTestRunner } from '@skillbolt/test';

async function watchTests(skillPath: string) {
  const runner = createTestRunner({
    skillPath,
    tests: testSuites
  });

  // 启动监视模式
  await runner.watch({
    onFileChange: (filePath) => {
      console.log(`File changed: ${filePath}`);
      runner.run();
    }
  });
}
```

## 类型定义

```typescript
// 测试用例
interface TestCase {
  /** 测试用例名称 */
  name: string;
  /** 测试输入 */
  input: string;
  /** 期望是否触发技能 */
  shouldTrigger: boolean;
  /** 期望的匹配类型 */
  matchType?: 'exact' | 'contains' | 'fuzzy' | 'regex' | 'semantic';
  /** 最小置信度阈值 (0-1) */
  minConfidence?: number;
  /** 标签用于过滤测试 */
  tags?: string[];
  /** 测试前的设置函数 */
  setup?: () => void | Promise<void>;
  /** 测试后的清理函数 */
  teardown?: () => void | Promise<void>;
  /** 跳过此测试 */
  skip?: boolean;
  /** 仅运行此测试 */
  only?: boolean;
  /** 超时时间（毫秒） */
  timeout?: number;
}

// 测试套件
interface TestSuite {
  /** 测试套件名称 */
  name: string;
  /** 测试套件描述 */
  description?: string;
  /** SKILL.md 文件路径 */
  skill?: string;
  /** 解析后的技能文件 */
  skillFile?: SkillFile;
  /** 测试用例数组 */
  cases: TestCase[];
  /** 标签用于过滤测试套件 */
  tags?: string[];
  /** 默认超时时间（毫秒） */
  timeout?: number;
  /** 所有测试前的钩子 */
  beforeAll?: () => void | Promise<void>;
  /** 所有测试后的钩子 */
  afterAll?: () => void | Promise<void>;
  /** 每个测试前的钩子 */
  beforeEach?: () => void | Promise<void>;
  /** 每个测试后的钩子 */
  afterEach?: () => void | Promise<void>;
  /** Mock 配置 */
  mock?: MockConfig;
}

// 测试用例结果
interface TestCaseResult {
  /** 测试名称 */
  name: string;
  /** 是否通过 */
  passed: boolean;
  /** 期望值 */
  expected: boolean;
  /** 实际值 */
  actual: boolean;
  /** 匹配结果详情 */
  matchResult?: MatchResult;
  /** 执行时长（毫秒） */
  duration: number;
  /** 错误信息 */
  error?: string;
  /** 错误堆栈 */
  stack?: string;
  /** 是否跳过 */
  skipped?: boolean;
  /** 跳过原因 */
  skipReason?: string;
}

// 测试套件结果
interface TestSuiteResult {
  /** 测试套件名称 */
  name: string;
  /** 技能文件路径 */
  skillPath?: string;
  /** 总测试数 */
  total: number;
  /** 通过数 */
  passed: number;
  /** 失败数 */
  failed: number;
  /** 跳过数 */
  skipped: number;
  /** 总执行时长（毫秒） */
  duration: number;
  /** 测试用例结果数组 */
  results: TestCaseResult[];
  /** 错误信息 */
  errors: TestError[];
}

// 测试运行结果
interface TestRunResult {
  /** 总测试套件数 */
  totalSuites: number;
  /** 总测试数 */
  totalTests: number;
  /** 总通过数 */
  passed: number;
  /** 总失败数 */
  failed: number;
  /** 总跳过数 */
  skipped: number;
  /** 总执行时长（毫秒） */
  duration: number;
  /** 测试套件结果数组 */
  suites: TestSuiteResult[];
  /** 是否全部通过 */
  success: boolean;
}

// 匹配结果
interface MatchResult {
  /** 是否匹配 */
  matched: boolean;
  /** 匹配的触发词 */
  trigger?: string;
  /** 置信度 (0-1) */
  confidence: number;
  /** 匹配类型 */
  matchType: 'exact' | 'contains' | 'fuzzy' | 'regex' | 'semantic';
  /** 额外详情 */
  details?: Record<string, unknown>;
}

// 匹配类型
type MatchType = 'exact' | 'contains' | 'fuzzy' | 'regex' | 'semantic';

// Mock 配置
interface MockConfig {
  /** 静态响应映射 */
  responses?: Record<string, string>;
  /** 动态响应模板 */
  templates?: Record<string, (input: string) => string | Promise<string>>;
  /** 要模拟的错误 */
  errors?: Record<string, Error>;
  /** 响应延迟（毫秒） */
  delay?: number;
}

// 测试运行器选项
interface TestRunnerOptions {
  /** 配置对象 */
  config?: Partial<SkillTestConfig>;
  /** 工作目录 */
  cwd?: string;
  /** 监视模式 */
  watch?: boolean;
  /** 覆盖率收集 */
  coverage?: boolean;
  /** 详细输出 */
  verbose?: boolean;
  /** 测试套件开始回调 */
  onSuiteStart?: (suite: TestSuite) => void;
  /** 测试套件结束回调 */
  onSuiteEnd?: (result: TestSuiteResult) => void;
  /** 测试用例开始回调 */
  onTestStart?: (testCase: TestCase) => void;
  /** 测试用例结束回调 */
  onTestEnd?: (result: TestCaseResult) => void;
}
```

## CLI 命令

```bash
# 基本语法
skill test [patterns...]

# 运行所有测试文件（匹配 .skill-test.{yaml,yml,json}）
skill test

# 运行特定测试文件
skill test ./tests/basic-test.skill-test.yaml

# 运行匹配模式的测试文件
skill test "./tests/**/*.skill-test.yaml"

# 选项
skill test --coverage              # 收集覆盖率信息
skill test --watch                 # 监视模式 - 文件变化时自动运行测试
skill test --verbose               # 详细输出
skill test -c ./config.json        # 指定配置文件路径

# 组合使用
skill test "./tests/**/*.skill-test.yaml" --coverage --verbose
```

**注意**: 
- 测试文件必须是 `.skill-test.yaml`、`.skill-test.yml` 或 `.skill-test.json` 格式
- `patterns` 参数使用 glob 模式匹配文件
- 测试文件中通过 `skill` 字段指定要测试的 SKILL.md 文件路径

## 配置

### 测试配置文件

```json
{
  "tests": "./tests/**/*.test.ts",
  "coverage": {
    "enabled": true,
    "output": "./coverage",
    "threshold": 80
  },
  "watch": {
    "enabled": true,
    "ignore": ["node_modules", "dist"]
  },
  "format": "console",
  "timeout": 5000
}
```

### 加载配置

```typescript
import { loadTestConfig, defineConfig } from '@skillbolt/test';

// 从文件加载
const config = await loadTestConfig('./skill.test.config.json');

// 定义配置
const config = defineConfig({
  tests: testSuites,
  coverage: {
    enabled: true,
    output: './coverage'
  },
  watch: {
    enabled: true
  }
});
```

## 最佳实践

1. **测试命名**: 使用描述性的测试名称
2. **覆盖率目标**: 设置合理的覆盖率目标（如 80%）
3. **独立测试**: 确保测试之间相互独立
4. **快速测试**: 保持测试快速执行
5. **Mock 使用**: 使用 Mock 隔离外部依赖

## 故障排除

### 测试超时

如果测试超时：

1. 增加 `--timeout` 值
2. 检查测试逻辑是否有阻塞
3. 优化技能执行速度

### 覆盖率低

如果覆盖率低：

1. 添加更多测试用例
2. 检查触发词是否都被测试
3. 审查未测试的章节

### Mock 不工作

如果 Mock 不工作：

1. 检查 Mock 响应格式
2. 确认触发词匹配正确
3. 查看详细的错误日志

## API 参考

### 主要导出

```typescript
// 测试运行器
export {
  createTestRunner,
  runTests,
  type TestRunner,
  type TestRunnerOptions
};

// 执行器
export {
  executeTestCase,
  executeTestSuite,
  type ExecutorOptions
};

// 匹配器
export {
  createMatcher,
  matchTrigger,
  matchExact,
  matchContains,
  matchFuzzy,
  matchRegex,
  type MatcherOptions
};

// Mock
export {
  createMockProvider,
  createRecorder,
  loadRecording,
  recordResponses,
  replayResponses,
  type MockLLMProvider,
  type MockProviderOptions,
  type RecordedResponse,
  type RecordingSession,
  type ResponseRecorder
};

// 覆盖率
export {
  createCoverageCollector,
  collectCoverage,
  calculateTriggerCoverage,
  type CoverageCollector
};

// 报告器
export {
  createTextReporter,
  createJsonReporter,
  createHtmlReporter,
  createCoverageReporter,
  generateCoverageReport,
  type CoverageReporter,
  type CoverageReporterOptions
};

// 配置
export {
  loadTestConfig,
  defineConfig,
  type LoadConfigOptions
};

// 工具
export { defineTests };
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 许可证

MIT
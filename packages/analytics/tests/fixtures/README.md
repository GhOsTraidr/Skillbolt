# Skill Analytics 测试数据集

本目录包含用于测试 Skill Analytics 功能的测试数据集。

## 文件说明

### 1. `sample-dataset.ts`
TypeScript 格式的综合测试数据集，包含 56 条测试事件。

**数据特点：**
- 5 个不同的技能（react-patterns、git-workflow、typescript-tips、docker-setup、python-debug）
- 3 种事件类型（trigger、complete、error）
- 多种触发短语
- 不同隐私级别（low、medium、high）
- 跨度 30 天的时间范围
- 包含历史数据用于趋势分析

**导出内容：**
- `comprehensiveTestEvents`: 所有测试事件数组
- `allTestSkills`: 用于测试建议生成的所有技能列表（包括未使用的技能）
- `testTriggers`: 用于测试触发建议的触发词列表
- 多个辅助函数用于数据筛选和分组
- `datasetStats`: 数据集统计信息

### 2. `test-analytics.db`
SQLite 格式的测试数据库文件，可直接用于 skill analytics 命令。

**数据库内容：**
- 56 条测试事件
- 5 个唯一技能
- 完整的表结构和索引

### 3. `generate-database.ts`
数据库生成脚本，用于从 `sample-dataset.ts` 生成 SQLite 数据库文件。

**使用方法：**
```bash
cd packages/analytics
pnpm generate:test-db
```

### 4. `events.ts`
原始的简单测试数据生成器，用于基础测试。

### 5. `validate-dataset.ts`
数据验证脚本，用于验证测试数据集的完整性。

## 使用方法

### 生成测试数据库

如果需要重新生成数据库：

```bash
cd packages/analytics
pnpm generate:test-db
```

### 使用测试数据库运行 analytics 命令

**分析数据：**
```bash
cd packages/analytics
node dist/cli/index.js analyze --db tests/fixtures/test-analytics.db --triggers --unused --suggestions
```

**生成报告：**
```bash
cd packages/analytics
node dist/cli/index.js report --db tests/fixtures/test-analytics.db --days 30 --format terminal
```

**导出报告：**
```bash
cd packages/analytics
node dist/cli/index.js export --db tests/fixtures/test-analytics.db --format json --output report.json
node dist/cli/index.js export --db tests/fixtures/test-analytics.db --format html --output report.html
node dist/cli/index.js export --db tests/fixtures/test-analytics.db --format csv --output report.csv
```

### 在代码中使用测试数据

```typescript
import { comprehensiveTestEvents, getMonthlyEvents, getEventsBySkill } from './sample-dataset.js';

// 使用所有事件
const allEvents = comprehensiveTestEvents;

// 获取过去30天的事件
const recentEvents = getMonthlyEvents(30);

// 按技能分组
const bySkill = getEventsBySkill();
console.log(bySkill['react-patterns']);
```

## 数据集统计

- **总事件数**: 56
- **唯一技能数**: 5
- **触发事件**: 28
- **完成事件**: 24
- **错误事件**: 4

### 技能使用分布

| 技能            | 总计 | 成功 | 失败 | 成功率 | 平均时长 |
| --------------- | ---- | ---- | ---- | ------ | -------- |
| react-patterns  | 22   | 10   | 1    | 90.9%  | 203ms    |
| git-workflow    | 20   | 8    | 2    | 80.0%  | 219ms    |
| typescript-tips | 8    | 4    | 0    | 100.0% | 250ms    |
| docker-setup    | 4    | 1    | 1    | 50.0%  | 375ms    |
| python-debug    | 2    | 1    | 0    | 100.0% | 300ms    |

### 触发短语分布

最常用的触发短语：
- "react best practices" - 4 次 (50% 成功率)
- "git help" - 4 次 (25% 成功率)
- "show react patterns" - 4 次 (50% 成功率)
- "git workflow" - 4 次 (50% 成功率)

## 注意事项

1. **数据库路径**: 使用时确保使用相对于项目根目录的正确路径
2. **重新生成**: 如果修改了 `sample-dataset.ts`，需要重新运行 `pnpm generate:test-db` 来更新数据库
3. **版本控制**: `test-analytics.db` 已添加到 `.gitignore`，不会被提交到版本控制
4. **时间范围**: 数据集中的时间戳是固定的，从 2025-12-22 到 2026-01-24

## 扩展数据集

如果需要添加更多测试数据：

1. 编辑 `sample-dataset.ts` 文件
2. 添加新的 `AnalyticsEvent` 对象到 `comprehensiveTestEvents` 数组
3. 运行 `pnpm generate:test-db` 重新生成数据库
4. 使用 `node dist/cli/index.js report --db tests/fixtures/test-analytics.db` 验证

## 相关文档

- [Analytics README](../../README.md) - 功能说明和使用文档
- [Events API](../../src/types/events.ts) - 事件类型定义
- [Storage Schema](../../src/storage/schema.ts) - 数据库结构定义
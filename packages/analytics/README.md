# @skillbolt/analytics

技能使用分析工具，用于收集、跟踪和分析技能的使用模式、统计信息和趋势。

## 功能特性

- **数据收集**: 跟踪技能触发、完成和错误事件
- **隐私控制**: 支持多个隐私级别（关闭、低、中、高）
- **统计分析**: 计算技能使用统计、聚合数据和趋势变化
- **模式分析**: 分析触发短语模式，识别常用触发词
- **优化建议**: 基于使用数据生成优化建议（如移除未使用的技能）
- **多种报告格式**: 支持 JSON、CSV、HTML 和终端报告
- **SQLite 存储**: 使用 SQLite 数据库持久化分析数据

## 核心组件

### 数据收集器 (AnalyticsCollector)

负责收集和存储分析事件：

```typescript
import { createCollector } from '@skillbolt/analytics';

const collector = createCollector({
  enabled: true,
  privacyLevel: 'medium',
  dbPath: './analytics.db',
  retentionDays: 90
});

// 跟踪事件
collector.track({
  skillName: 'git-workflow',
  eventType: 'trigger',
  triggerPhrase: 'git help',
  duration: 150,
  success: true
});

// 查询事件
const events = collector.query({
  skillName: 'git-workflow',
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});

// 清理旧数据
collector.cleanup();
collector.close();
```

### 统计计算器

计算各种统计指标：

```typescript
import { calculateSkillStats, calculateAggregatedStats, calculateTrends } from '@skillbolt/analytics';

// 计算单个技能的统计
const stats = calculateSkillStats(events, 'git-workflow');
// { totalTriggers: 10, successRate: 0.9, avgDuration: 150, ... }

// 计算所有技能的聚合统计
const aggregated = calculateAggregatedStats(events);
// { totalEvents: 100, uniqueSkills: 5, overallSuccessRate: 0.85, ... }

// 计算趋势变化
const trends = calculateTrends(currentEvents, previousEvents);
// { current: {...}, previous: {...}, changes: { triggersChange: 20, ... } }
```

### 模式分析器

分析触发短语模式：

```typescript
import { PatternAnalyzer } from '@skillbolt/analytics';

const analyzer = new PatternAnalyzer(events);

// 获取触发短语模式
const patterns = analyzer.getTriggerPatterns();
// [{ phrase: 'git help', count: 5, successRate: 0.8, skillName: 'git-workflow' }, ...]

// 获取最常用的触发词
const topTriggers = analyzer.getMostCommonTriggers(10);

// 查找未使用的技能
const unused = analyzer.getUnusedSkills(allSkills, 30); // 30+天未使用
```

### 建议生成器

生成优化建议：

```typescript
import { SuggestionGenerator } from '@skillbolt/analytics';

const generator = new SuggestionGenerator(events, allSkills, triggers);

const suggestions = generator.generate({
  maxSuggestions: 10,
  minConfidence: 0.7
});
// [
//   { type: 'remove_skill', skillName: 'unused-skill', priority: 'high', confidence: 0.9, ... },
//   ...
// ]

// 获取高优先级建议
const highPriority = generator.getHighPrioritySuggestions();
```

### 报告生成器

生成各种格式的报告：

```typescript
import { generateReport, exportToJSON, exportToCSV, exportToHTML } from '@skillbolt/analytics';

// 生成报告
const report = generateReport(events, {
  includeStats: true,
  includePatterns: true,
  includeSuggestions: true
});

// 导出为不同格式
exportToJSON(report, './report.json');
exportToCSV(report, './report.csv');
exportToHTML(report, './report.html');

// 终端报告
import { renderTerminalReport, renderBarChart } from '@skillbolt/analytics';
console.log(renderTerminalReport(report));
console.log(renderBarChart(stats, 'Skill Usage'));
```

## CLI 命令

### analyze

分析技能使用模式：

```bash
skill analytics analyze --days 30
skill analytics analyze --triggers --unused --suggestions
skill analytics analyze --db ./custom-analytics.db
```

### clear

清除分析数据：

```bash
skill analytics clear --older-than 90
skill analytics clear --skill git-workflow
```

### config

配置分析选项：

```bash
skill analytics config --privacy-level medium
skill analytics config --retention-days 90
```

### export

导出分析报告：

```bash
skill analytics export --format json --output report.json
skill analytics export --format csv --output report.csv
skill analytics export --format html --output report.html
```

### report

生成和显示报告：

```bash
skill analytics report --days 30 --format terminal
skill analytics report --output report.html
```

## 隐私级别

- `off`: 完全禁用数据收集
- `low`: 仅收集技能名称和时间戳
- `medium`: 收集触发短语和基本参数（默认）
- `high`: 收集完整的用户输入（可选）

## 事件类型

- `trigger`: 技能被触发时
- `complete`: 技能执行完成时
- `error`: 技能执行失败时

## 数据库

分析数据存储在 SQLite 数据库中，默认路径为 `~/.skillbolt/analytics.db`。

数据库包含以下表：
- `events`: 存储所有分析事件
- `schema_version`: 存储数据库架构版本

## API 参考

### 主要类型

```typescript
interface AnalyticsEvent {
  id: string;
  timestamp: string;
  skillName: string;
  eventType: 'trigger' | 'complete' | 'error';
  triggerPhrase?: string;
  parameters?: Record<string, unknown>;
  duration?: number;
  success?: boolean;
  errorCode?: string;
  errorMessage?: string;
  privacyLevel: PrivacyLevel;
}

interface SkillStats {
  skillName: string;
  totalTriggers: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgDuration: number;
  triggerDistribution: Record<string, number>;
}

interface Suggestion {
  type: 'remove_skill' | 'add_trigger' | 'optimize' | 'deprecate';
  skillName: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  reason: string;
  suggestion: string;
}
```

## 使用示例

### 集成到技能执行器

```typescript
import { trackEvent } from '@skillbolt/analytics';

async function executeSkill(skillName, inputs) {
  const startTime = Date.now();
  
  // 跟踪触发事件
  trackEvent({
    skillName,
    eventType: 'trigger',
    triggerPhrase: inputs.triggerPhrase
  });

  try {
    const result = await runSkill(skillName, inputs);
    
    // 跟踪完成事件
    trackEvent({
      skillName,
      eventType: 'complete',
      duration: Date.now() - startTime,
      success: true
    });
    
    return result;
  } catch (error) {
    // 跟踪错误事件
    trackEvent({
      skillName,
      eventType: 'error',
      duration: Date.now() - startTime,
      success: false,
      errorCode: error.code,
      errorMessage: error.message
    });
    
    throw error;
  }
}
```

### 定期分析

```typescript
import { createCollector, PatternAnalyzer, SuggestionGenerator } from '@skillbolt/analytics';

const collector = createCollector();
const endDate = new Date();
const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

const events = collector.query({ startDate, endDate });
const allSkills = collector.getUniqueSkills();

const analyzer = new PatternAnalyzer(events);
const patterns = analyzer.getTriggerPatterns();
const unused = analyzer.getUnusedSkills(allSkills, 30);

const generator = new SuggestionGenerator(events, allSkills, []);
const suggestions = generator.generate();

console.log('Top triggers:', patterns.slice(0, 10));
console.log('Unused skills:', unused);
console.log('Suggestions:', suggestions);

collector.close();
```

## 许可证

MIT
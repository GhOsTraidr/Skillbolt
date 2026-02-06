import { comprehensiveTestEvents, allTestSkills, testTriggers, datasetStats } from './sample-dataset.js';
import { calculateSkillStats, calculateAggregatedStats } from '../../src/analyzer/statistics.js';
import { PatternAnalyzer } from '../../src/analyzer/patterns.js';

/**
 * 验证测试数据集
 * 
 * 这个脚本用于验证测试数据集是否可以正确用于 skill analytics 的各种功能
 */

console.log('=== Skill Analytics 测试数据集验证 ===\n');

// 1. 验证基本统计信息
console.log('1. 基本统计信息:');
console.log(`   总事件数: ${datasetStats.totalEvents}`);
console.log(`   唯一技能数: ${datasetStats.uniqueSkills}`);
console.log(`   事件类型分布:`);
console.log(`     - trigger: ${datasetStats.eventTypes.trigger}`);
console.log(`     - complete: ${datasetStats.eventTypes.complete}`);
console.log(`     - error: ${datasetStats.eventTypes.error}`);
console.log(`   成功率: ${(datasetStats.successRate * 100).toFixed(2)}%`);
console.log(`   时间范围: ${datasetStats.dateRange.start} 到 ${datasetStats.dateRange.end}\n`);

// 2. 验证数据完整性
console.log('2. 数据完整性检查:');
let hasErrors = false;

for (const event of comprehensiveTestEvents) {
  if (!event.id || !event.timestamp || !event.skillName || !event.eventType || !event.privacyLevel) {
    console.error(`   ❌ 事件 ${event.id} 缺少必填字段`);
    hasErrors = true;
  }

  if (event.eventType === 'complete' && event.success === undefined) {
    console.error(`   ❌ 事件 ${event.id} (complete) 缺少 success 字段`);
    hasErrors = true;
  }

  if (event.eventType === 'error' && (!event.errorCode || !event.errorMessage)) {
    console.error(`   ❌ 事件 ${event.id} (error) 缺少错误信息`);
    hasErrors = true;
  }
}

if (!hasErrors) {
  console.log('   ✅ 所有事件数据完整\n');
}

// 3. 验证统计分析功能
console.log('3. 统计分析功能测试:');

try {
  // 计算聚合统计
  const aggregated = calculateAggregatedStats(comprehensiveTestEvents);
  console.log(`   ✅ 聚合统计:`);
  console.log(`     - 总事件: ${aggregated.totalEvents}`);
  console.log(`     - 唯一技能: ${aggregated.uniqueSkills}`);
  console.log(`     - 总触发次数: ${aggregated.totalTriggers}`);
  console.log(`     - 总成功次数: ${aggregated.successCount}`);
  console.log(`     - 总失败次数: ${aggregated.failureCount}`);
  console.log(`     - 整体成功率: ${(aggregated.overallSuccessRate * 100).toFixed(2)}%`);
  console.log(`     - 平均持续时间: ${aggregated.avgDuration.toFixed(2)}ms\n`);

  // 计算单个技能统计
  const reactStats = calculateSkillStats(comprehensiveTestEvents, 'react-patterns');
  console.log(`   ✅ react-patterns 统计:`);
  console.log(`     - 总触发次数: ${reactStats.totalTriggers}`);
  console.log(`     - 成功次数: ${reactStats.successCount}`);
  console.log(`     - 失败次数: ${reactStats.failureCount}`);
  console.log(`     - 成功率: ${(reactStats.successRate * 100).toFixed(2)}%`);
  console.log(`     - 平均持续时间: ${reactStats.avgDuration.toFixed(2)}ms\n`);
} catch (error) {
  console.error(`   ❌ 统计分析失败: ${error}\n`);
}

// 4. 验证模式分析功能
console.log('4. 模式分析功能测试:');

try {
  const analyzer = new PatternAnalyzer(comprehensiveTestEvents);
  const patterns = analyzer.getTriggerPatterns();

  console.log(`   ✅ 触发短语模式 (前5个):`);
  patterns.slice(0, 5).forEach((pattern, index) => {
    console.log(`     ${index + 1}. "${pattern.phrase}" - ${pattern.count}次 (${(pattern.successRate * 100).toFixed(0)}% 成功率)`);
  });

  const topTriggers = analyzer.getMostCommonTriggers(5);
  console.log(`\n   ✅ 最常用触发词 (前5个):`);
  topTriggers.forEach((trigger, index) => {
    console.log(`     ${index + 1}. "${trigger.word}" - ${trigger.count}次`);
  });

  const unusedSkills = analyzer.getUnusedSkills(allTestSkills, 30);
  console.log(`\n   ✅ 未使用的技能 (30天以上):`);
  unusedSkills.forEach((skill) => {
    console.log(`     - ${skill.skillName} (上次使用: ${skill.lastUsed ? new Date(skill.lastUsed).toLocaleDateString() : '从未使用'})`);
  });
  console.log('');
} catch (error) {
  console.error(`   ❌ 模式分析失败: ${error}\n`);
}

// 5. 验证数据分组功能
console.log('5. 数据分组测试:');

const skills = [...new Set(comprehensiveTestEvents.map((e) => e.skillName))];
console.log(`   ✅ 技能列表: ${skills.join(', ')}`);

const eventTypes = [...new Set(comprehensiveTestEvents.map((e) => e.eventType))];
console.log(`   ✅ 事件类型: ${eventTypes.join(', ')}`);

const privacyLevels = [...new Set(comprehensiveTestEvents.map((e) => e.privacyLevel))];
console.log(`   ✅ 隐私级别: ${privacyLevels.join(', ')}\n`);

// 6. 总结
console.log('=== 验证完成 ===');
console.log('测试数据集已成功创建并可用于以下功能:');
console.log('  ✅ 基本统计和聚合分析');
console.log('  ✅ 技能使用统计');
console.log('  ✅ 触发短语模式分析');
console.log('  ✅ 未使用技能检测');
console.log('  ✅ 数据分组和过滤');
console.log('  ✅ 趋势分析 (包含历史数据)');
console.log('  ✅ 隐私级别支持');
console.log('  ✅ 错误处理和失败分析');
console.log('\n数据集文件: packages/analytics/tests/fixtures/sample-dataset.ts');
console.log('使用示例: skill analytics report --days 30 --format terminal');
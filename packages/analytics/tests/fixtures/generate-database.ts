/**
 * 生成测试数据库文件
 * 
 * 运行: npx tsx generate-database.ts
 * 
 * 生成的数据库文件可以直接用于 skill analytics 命令：
 * - skill analytics suggest --db test-analytics.db
 * - skill analytics report --db test-analytics.db --days 30
 * - skill analytics analyze --db test-analytics.db
 */

import Database from 'better-sqlite3';
import { comprehensiveTestEvents } from './sample-dataset.js';
import { SCHEMA_VERSION, CREATE_TABLES_SQL } from '../../src/storage/schema.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const dbPath = join(__dirname, 'test-analytics.db');

console.log('=== 生成 Skill Analytics 测试数据库 ===\n');

// 删除已存在的数据库
const fs = await import('fs');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log(`✅ 删除旧数据库文件: ${dbPath}`);
}

// 创建新数据库
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log(`✅ 创建新数据库: ${dbPath}\n`);

// 创建表结构
db.exec(CREATE_TABLES_SQL);
console.log('✅ 创建表结构');

// 插入 schema 版本
db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(SCHEMA_VERSION);
console.log(`✅ 设置 schema 版本: ${SCHEMA_VERSION}\n`);

// 插入测试数据
const insertEvent = db.prepare(`
  INSERT INTO events (
    id, timestamp, skill_name, event_type, trigger_phrase,
    parameters, duration, success, error_code, error_message, privacy_level
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((events) => {
  for (const event of events) {
    insertEvent.run(
      event.id,
      event.timestamp,
      event.skillName,
      event.eventType,
      event.triggerPhrase || null,
      event.parameters ? JSON.stringify(event.parameters) : null,
      event.duration || null,
      event.success !== undefined ? (event.success ? 1 : 0) : null,
      event.errorCode || null,
      event.errorMessage || null,
      event.privacyLevel
    );
  }
});

insertMany(comprehensiveTestEvents);
console.log(`✅ 插入 ${comprehensiveTestEvents.length} 条测试事件\n`);

// 验证数据
const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
const skillCount = db.prepare('SELECT COUNT(DISTINCT skill_name) as count FROM events').get() as { count: number };
const triggerCount = db.prepare('SELECT COUNT(*) as count FROM events WHERE event_type = ?').get('trigger') as { count: number };
const completeCount = db.prepare('SELECT COUNT(*) as count FROM events WHERE event_type = ?').get('complete') as { count: number };
const errorCount = db.prepare('SELECT COUNT(*) as count FROM events WHERE event_type = ?').get('error') as { count: number };

console.log('=== 数据库统计 ===');
console.log(`总事件数: ${eventCount.count}`);
console.log(`唯一技能数: ${skillCount.count}`);
console.log(`触发事件: ${triggerCount.count}`);
console.log(`完成事件: ${completeCount.count}`);
console.log(`错误事件: ${errorCount.count}\n`);

// 显示技能分布
const skillDistribution = db.prepare(`
  SELECT 
    skill_name,
    COUNT(*) as total,
    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed,
    AVG(duration) as avg_duration
  FROM events
  GROUP BY skill_name
  ORDER BY total DESC
`).all() as Array<{
  skill_name: string;
  total: number;
  successful: number;
  failed: number;
  avg_duration: number;
}>;

console.log('=== 技能使用分布 ===');
skillDistribution.forEach((skill) => {
  const successRate = skill.successful > 0 ? ((skill.successful / (skill.successful + skill.failed)) * 100).toFixed(1) : '0.0';
  console.log(`${skill.skill_name}:`);
  console.log(`  总计: ${skill.total}次 | 成功: ${skill.successful}次 | 失败: ${skill.failed}次 | 成功率: ${successRate}% | 平均时长: ${skill.avg_duration?.toFixed(0) || 0}ms`);
});

console.log('\n=== 数据库生成完成 ===');
console.log(`数据库路径: ${dbPath}`);
console.log('\n使用示例:');
console.log(`  skill analytics suggest --db ${dbPath}`);
console.log(`  skill analytics report --db ${dbPath} --days 30 --format terminal`);
console.log(`  skill analytics analyze --db ${dbPath} --triggers --unused --suggestions`);

// 关闭数据库连接
db.close();
import type { AnalyticsEvent } from '../../src/types/index.js';

/**
 * 综合测试数据集
 * 
 * 该数据集包含多种技能、事件类型、触发短语和时间跨度，
 * 用于测试 skill analytics 的各种功能，包括：
 * - 统计分析
 * - 模式分析
 * - 趋势分析
 * - 建议生成
 * - 报告生成
 */

export const comprehensiveTestEvents: AnalyticsEvent[] = [
  // ====== 热门技能：react-patterns ======
  {
    id: 'evt_react_001',
    timestamp: '2026-01-15T08:00:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'show react patterns',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_002',
    timestamp: '2026-01-15T08:00:15.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'show react patterns',
    duration: 150,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_003',
    timestamp: '2026-01-15T10:30:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'react best practices',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_004',
    timestamp: '2026-01-15T10:30:20.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'react best practices',
    duration: 200,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_005',
    timestamp: '2026-01-16T09:00:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'react hooks',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_006',
    timestamp: '2026-01-16T09:00:25.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'react hooks',
    duration: 250,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_007',
    timestamp: '2026-01-17T14:00:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'help with react',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_008',
    timestamp: '2026-01-17T14:00:18.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'help with react',
    duration: 180,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_009',
    timestamp: '2026-01-18T11:30:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'react patterns',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_010',
    timestamp: '2026-01-18T11:30:22.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'react patterns',
    duration: 220,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_011',
    timestamp: '2026-01-19T16:00:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'react component',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_012',
    timestamp: '2026-01-19T16:00:30.000Z',
    skillName: 'react-patterns',
    eventType: 'error',
    triggerPhrase: 'react component',
    duration: 300,
    success: false,
    errorCode: 'TIMEOUT',
    errorMessage: 'Execution timeout after 300ms',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_013',
    timestamp: '2026-01-20T08:15:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'show react patterns',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_014',
    timestamp: '2026-01-20T08:15:10.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'show react patterns',
    duration: 100,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_015',
    timestamp: '2026-01-21T13:45:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'react best practices',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_react_016',
    timestamp: '2026-01-21T13:45:28.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'react best practices',
    duration: 280,
    success: true,
    privacyLevel: 'medium',
  },

  // ====== 热门技能：git-workflow ======
  {
    id: 'evt_git_001',
    timestamp: '2026-01-15T09:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git workflow',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_002',
    timestamp: '2026-01-15T09:00:12.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git workflow',
    duration: 120,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_003',
    timestamp: '2026-01-15T14:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git help',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_004',
    timestamp: '2026-01-15T14:00:15.000Z',
    skillName: 'git-workflow',
    eventType: 'error',
    triggerPhrase: 'git help',
    duration: 150,
    success: false,
    errorCode: 'EXECUTION_FAILED',
    errorMessage: 'Failed to execute git command',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_005',
    timestamp: '2026-01-16T10:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git commands',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_006',
    timestamp: '2026-01-16T10:00:18.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git commands',
    duration: 180,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_007',
    timestamp: '2026-01-17T11:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git workflow',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_008',
    timestamp: '2026-01-17T11:00:20.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git workflow',
    duration: 200,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_009',
    timestamp: '2026-01-18T15:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git branch',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_010',
    timestamp: '2026-01-18T15:00:25.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git branch',
    duration: 250,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_011',
    timestamp: '2026-01-19T09:30:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git commit',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_012',
    timestamp: '2026-01-19T09:30:22.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git commit',
    duration: 220,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_013',
    timestamp: '2026-01-20T13:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git help',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_git_014',
    timestamp: '2026-01-20T13:00:30.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git help',
    duration: 300,
    success: true,
    privacyLevel: 'medium',
  },

  // ====== 中等使用：typescript-tips ======
  {
    id: 'evt_ts_001',
    timestamp: '2026-01-15T11:00:00.000Z',
    skillName: 'typescript-tips',
    eventType: 'trigger',
    triggerPhrase: 'typescript tips',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_ts_002',
    timestamp: '2026-01-15T11:00:25.000Z',
    skillName: 'typescript-tips',
    eventType: 'complete',
    triggerPhrase: 'typescript tips',
    duration: 250,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_ts_003',
    timestamp: '2026-01-17T16:00:00.000Z',
    skillName: 'typescript-tips',
    eventType: 'trigger',
    triggerPhrase: 'ts hints',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_ts_004',
    timestamp: '2026-01-17T16:00:20.000Z',
    skillName: 'typescript-tips',
    eventType: 'complete',
    triggerPhrase: 'ts hints',
    duration: 200,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_ts_005',
    timestamp: '2026-01-20T10:00:00.000Z',
    skillName: 'typescript-tips',
    eventType: 'trigger',
    triggerPhrase: 'typescript help',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_ts_006',
    timestamp: '2026-01-20T10:00:30.000Z',
    skillName: 'typescript-tips',
    eventType: 'complete',
    triggerPhrase: 'typescript help',
    duration: 300,
    success: true,
    privacyLevel: 'medium',
  },

  // ====== 较少使用：docker-setup ======
  {
    id: 'evt_docker_001',
    timestamp: '2026-01-16T12:00:00.000Z',
    skillName: 'docker-setup',
    eventType: 'trigger',
    triggerPhrase: 'docker help',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_docker_002',
    timestamp: '2026-01-16T12:00:35.000Z',
    skillName: 'docker-setup',
    eventType: 'complete',
    triggerPhrase: 'docker help',
    duration: 350,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_docker_003',
    timestamp: '2026-01-19T14:30:00.000Z',
    skillName: 'docker-setup',
    eventType: 'trigger',
    triggerPhrase: 'docker compose',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_docker_004',
    timestamp: '2026-01-19T14:30:40.000Z',
    skillName: 'docker-setup',
    eventType: 'error',
    triggerPhrase: 'docker compose',
    duration: 400,
    success: false,
    errorCode: 'DOCKER_NOT_FOUND',
    errorMessage: 'Docker daemon not running',
    privacyLevel: 'medium',
  },

  // ====== 很少使用：python-debug ======
  {
    id: 'evt_py_001',
    timestamp: '2026-01-18T13:00:00.000Z',
    skillName: 'python-debug',
    eventType: 'trigger',
    triggerPhrase: 'python debug',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_py_002',
    timestamp: '2026-01-18T13:00:30.000Z',
    skillName: 'python-debug',
    eventType: 'complete',
    triggerPhrase: 'python debug',
    duration: 300,
    success: true,
    privacyLevel: 'medium',
  },

  // ====== 历史数据（用于趋势分析，30天前） ======
  {
    id: 'evt_history_001',
    timestamp: '2025-12-22T10:00:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'react patterns',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_002',
    timestamp: '2025-12-22T10:00:15.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'react patterns',
    duration: 150,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_003',
    timestamp: '2025-12-22T11:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git workflow',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_004',
    timestamp: '2025-12-22T11:00:20.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git workflow',
    duration: 200,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_005',
    timestamp: '2025-12-23T09:00:00.000Z',
    skillName: 'typescript-tips',
    eventType: 'trigger',
    triggerPhrase: 'typescript tips',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_006',
    timestamp: '2025-12-23T09:00:25.000Z',
    skillName: 'typescript-tips',
    eventType: 'complete',
    triggerPhrase: 'typescript tips',
    duration: 250,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_007',
    timestamp: '2025-12-23T14:00:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    triggerPhrase: 'react hooks',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_008',
    timestamp: '2025-12-23T14:00:30.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'react hooks',
    duration: 300,
    success: true,
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_009',
    timestamp: '2025-12-24T10:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git commands',
    privacyLevel: 'medium',
  },
  {
    id: 'evt_history_010',
    timestamp: '2025-12-24T10:00:22.000Z',
    skillName: 'git-workflow',
    eventType: 'error',
    triggerPhrase: 'git commands',
    duration: 220,
    success: false,
    errorCode: 'INVALID_COMMAND',
    errorMessage: 'Invalid git command',
    privacyLevel: 'medium',
  },

  // ====== 不同隐私级别的示例 ======
  {
    id: 'evt_privacy_low_001',
    timestamp: '2026-01-21T10:00:00.000Z',
    skillName: 'react-patterns',
    eventType: 'trigger',
    privacyLevel: 'low',
  },
  {
    id: 'evt_privacy_low_002',
    timestamp: '2026-01-21T10:00:10.000Z',
    skillName: 'react-patterns',
    eventType: 'complete',
    duration: 100,
    success: true,
    privacyLevel: 'low',
  },
  {
    id: 'evt_privacy_high_001',
    timestamp: '2026-01-21T11:00:00.000Z',
    skillName: 'git-workflow',
    eventType: 'trigger',
    triggerPhrase: 'git workflow with detailed parameters',
    parameters: {
      branch: 'main',
      remote: 'origin',
      verbose: true,
    },
    privacyLevel: 'high',
  },
  {
    id: 'evt_privacy_high_002',
    timestamp: '2026-01-21T11:00:35.000Z',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git workflow with detailed parameters',
    parameters: {
      branch: 'main',
      remote: 'origin',
      verbose: true,
    },
    duration: 350,
    success: true,
    privacyLevel: 'high',
  },
];

/**
 * 用于测试建议生成的所有技能列表
 */
export const allTestSkills = [
  'react-patterns',
  'git-workflow',
  'typescript-tips',
  'docker-setup',
  'python-debug',
  'unused-skill-1', // 未使用的技能
  'unused-skill-2', // 未使用的技能
  'old-deprecated-skill', // 已弃用的技能
];

/**
 * 用于测试触发建议的触发词列表
 */
export const testTriggers = [
  'show react patterns',
  'react best practices',
  'react hooks',
  'help with react',
  'react patterns',
  'react component',
  'git workflow',
  'git help',
  'git commands',
  'git branch',
  'git commit',
  'typescript tips',
  'ts hints',
  'typescript help',
  'docker help',
  'docker compose',
  'python debug',
];

/**
 * 获取过去7天的数据（用于近期报告）
 */
export function getRecentEvents(days: number = 7): AnalyticsEvent[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return comprehensiveTestEvents.filter((event) => {
    return new Date(event.timestamp) >= cutoffDate;
  });
}

/**
 * 获取过去30天的数据（用于月度报告）
 */
export function getMonthlyEvents(days: number = 30): AnalyticsEvent[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return comprehensiveTestEvents.filter((event) => {
    return new Date(event.timestamp) >= cutoffDate;
  });
}

/**
 * 获取历史数据（用于趋势对比）
 */
export function getHistoricalEvents(): AnalyticsEvent[] {
  return comprehensiveTestEvents.filter((event) => {
    return new Date(event.timestamp) < new Date('2026-01-01T00:00:00.000Z');
  });
}

/**
 * 按技能名称分组事件
 */
export function getEventsBySkill(): Record<string, AnalyticsEvent[]> {
  const grouped: Record<string, AnalyticsEvent[]> = {};

  for (const event of comprehensiveTestEvents) {
    if (!grouped[event.skillName]) {
      grouped[event.skillName] = [];
    }
    grouped[event.skillName].push(event);
  }

  return grouped;
}

/**
 * 按事件类型分组事件
 */
export function getEventsByType(): Record<string, AnalyticsEvent[]> {
  const grouped: Record<string, AnalyticsEvent[]> = {
    trigger: [],
    complete: [],
    error: [],
  };

  for (const event of comprehensiveTestEvents) {
    grouped[event.eventType].push(event);
  }

  return grouped;
}

/**
 * 按隐私级别分组事件
 */
export function getEventsByPrivacyLevel(): Record<string, AnalyticsEvent[]> {
  const grouped: Record<string, AnalyticsEvent[]> = {
    off: [],
    low: [],
    medium: [],
    high: [],
  };

  for (const event of comprehensiveTestEvents) {
    grouped[event.privacyLevel].push(event);
  }

  return grouped;
}

/**
 * 获取成功的事件
 */
export function getSuccessfulEvents(): AnalyticsEvent[] {
  return comprehensiveTestEvents.filter((event) => event.success === true);
}

/**
 * 获取失败的事件
 */
export function getFailedEvents(): AnalyticsEvent[] {
  return comprehensiveTestEvents.filter((event) => event.success === false);
}

/**
 * 数据集统计信息
 */
export const datasetStats = {
  totalEvents: comprehensiveTestEvents.length,
  uniqueSkills: new Set(comprehensiveTestEvents.map((e) => e.skillName)).size,
  eventTypes: {
    trigger: comprehensiveTestEvents.filter((e) => e.eventType === 'trigger').length,
    complete: comprehensiveTestEvents.filter((e) => e.eventType === 'complete').length,
    error: comprehensiveTestEvents.filter((e) => e.eventType === 'error').length,
  },
  successRate:
    comprehensiveTestEvents.filter((e) => e.success === true).length /
    comprehensiveTestEvents.filter((e) => e.success !== undefined).length,
  dateRange: {
    start: comprehensiveTestEvents.reduce((min, e) => (e.timestamp < min ? e.timestamp : min), comprehensiveTestEvents[0]?.timestamp),
    end: comprehensiveTestEvents.reduce((max, e) => (e.timestamp > max ? e.timestamp : max), ''),
  },
};
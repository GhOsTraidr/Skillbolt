import type { AnalyticsEvent } from '../../src/types/index.js';

export function createTestEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    skillName: 'test-skill',
    eventType: 'complete',
    triggerPhrase: 'test trigger',
    success: true,
    duration: 100,
    privacyLevel: 'medium',
    ...overrides,
  };
}

export function createTestEvents(
  count: number,
  baseOverrides: Partial<AnalyticsEvent> = {}
): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    events.push(
      createTestEvent({
        ...baseOverrides,
        id: `evt_${baseTime}_${i}`,
        timestamp: new Date(baseTime - i * 60000).toISOString(),
      })
    );
  }

  return events;
}

export const sampleEvents: AnalyticsEvent[] = [
  createTestEvent({
    id: 'evt_1',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'show react patterns',
    success: true,
    duration: 150,
    timestamp: '2026-01-20T10:00:00.000Z',
  }),
  createTestEvent({
    id: 'evt_2',
    skillName: 'react-patterns',
    eventType: 'complete',
    triggerPhrase: 'react best practices',
    success: true,
    duration: 200,
    timestamp: '2026-01-20T11:00:00.000Z',
  }),
  createTestEvent({
    id: 'evt_3',
    skillName: 'git-workflow',
    eventType: 'complete',
    triggerPhrase: 'git workflow',
    success: true,
    duration: 100,
    timestamp: '2026-01-20T12:00:00.000Z',
  }),
  createTestEvent({
    id: 'evt_4',
    skillName: 'git-workflow',
    eventType: 'error',
    triggerPhrase: 'git help',
    success: false,
    errorCode: 'EXECUTION_FAILED',
    duration: 50,
    timestamp: '2026-01-20T13:00:00.000Z',
  }),
  createTestEvent({
    id: 'evt_5',
    skillName: 'typescript-tips',
    eventType: 'complete',
    triggerPhrase: 'typescript tips',
    success: true,
    duration: 120,
    timestamp: '2026-01-19T10:00:00.000Z',
  }),
];

export const eventsWithDistribution = [
  ...sampleEvents,
  ...createTestEvents(10, { skillName: 'react-patterns', triggerPhrase: 'react help' }),
  ...createTestEvents(5, { skillName: 'git-workflow', triggerPhrase: 'git commands' }),
  ...createTestEvents(3, { skillName: 'typescript-tips', triggerPhrase: 'ts hints' }),
];

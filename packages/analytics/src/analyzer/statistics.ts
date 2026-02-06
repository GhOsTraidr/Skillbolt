import type {
  AnalyticsEvent,
  SkillStats,
  AggregatedStats,
  TrendComparison,
} from '../types/index.js';

export function calculateSkillStats(events: AnalyticsEvent[], skillName: string): SkillStats {
  const skillEvents = events.filter((e) => e.skillName === skillName);

  if (skillEvents.length === 0) {
    return createEmptyStats(skillName);
  }

  const completeEvents = skillEvents.filter(
    (e) => e.eventType === 'complete' || e.eventType === 'error'
  );
  const successEvents = completeEvents.filter((e) => e.success === true);
  const failureEvents = completeEvents.filter((e) => e.success === false);

  const durations = completeEvents
    .map((e) => e.duration)
    .filter((d): d is number => d !== undefined);

  const triggerDistribution: Record<string, number> = {};
  for (const event of skillEvents) {
    if (event.triggerPhrase) {
      triggerDistribution[event.triggerPhrase] =
        (triggerDistribution[event.triggerPhrase] ?? 0) + 1;
    }
  }

  const hourlyDistribution: Record<string, number> = {};
  const weekdayDistribution: Record<string, number> = {};

  for (const event of skillEvents) {
    const date = new Date(event.timestamp);
    const hour = date.getHours().toString();
    const weekday = date.getDay().toString();

    hourlyDistribution[hour] = (hourlyDistribution[hour] ?? 0) + 1;
    weekdayDistribution[weekday] = (weekdayDistribution[weekday] ?? 0) + 1;
  }

  const timestamps = skillEvents.map((e) => e.timestamp).sort();

  return {
    skillName,
    totalTriggers: skillEvents.length,
    successCount: successEvents.length,
    failureCount: failureEvents.length,
    successRate: completeEvents.length > 0 ? successEvents.length / completeEvents.length : 0,
    avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    minDuration: durations.length > 0 ? Math.min(...durations) : 0,
    maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
    firstUsed: timestamps[0] ?? '',
    lastUsed: timestamps[timestamps.length - 1] ?? '',
    triggerDistribution,
    hourlyDistribution,
    weekdayDistribution,
  };
}

function createEmptyStats(skillName: string): SkillStats {
  return {
    skillName,
    totalTriggers: 0,
    successCount: 0,
    failureCount: 0,
    successRate: 0,
    avgDuration: 0,
    minDuration: 0,
    maxDuration: 0,
    firstUsed: '',
    lastUsed: '',
    triggerDistribution: {},
    hourlyDistribution: {},
    weekdayDistribution: {},
  };
}

export function calculateAggregatedStats(events: AnalyticsEvent[]): AggregatedStats {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      uniqueSkills: 0,
      overallSuccessRate: 0,
      avgPerDay: 0,
      peakHour: 0,
      peakWeekday: 0,
      startDate: '',
      endDate: '',
      skillStats: [],
    };
  }

  const skillNames = [...new Set(events.map((e) => e.skillName))];
  const skillStats = skillNames.map((name) => calculateSkillStats(events, name));

  const completeEvents = events.filter(
    (e) => e.eventType === 'complete' || e.eventType === 'error'
  );
  const successEvents = completeEvents.filter((e) => e.success === true);
  const overallSuccessRate =
    completeEvents.length > 0 ? successEvents.length / completeEvents.length : 0;

  const hourCounts: Record<number, number> = {};
  const weekdayCounts: Record<number, number> = {};

  for (const event of events) {
    const date = new Date(event.timestamp);
    const hour = date.getHours();
    const weekday = date.getDay();

    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    weekdayCounts[weekday] = (weekdayCounts[weekday] ?? 0) + 1;
  }

  const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '0';
  const peakWeekday = Object.entries(weekdayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '0';

  const timestamps = events.map((e) => e.timestamp).sort();
  const startDate = timestamps[0] ?? '';
  const endDate = timestamps[timestamps.length - 1] ?? '';

  const daysDiff =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 1;

  return {
    totalEvents: events.length,
    uniqueSkills: skillNames.length,
    overallSuccessRate,
    avgPerDay: events.length / daysDiff,
    peakHour: parseInt(peakHour, 10),
    peakWeekday: parseInt(peakWeekday, 10),
    startDate,
    endDate,
    skillStats: skillStats.sort((a, b) => b.totalTriggers - a.totalTriggers),
  };
}

export function calculateTrends(
  currentEvents: AnalyticsEvent[],
  previousEvents: AnalyticsEvent[]
): TrendComparison {
  const currentStats = calculateAggregatedStats(currentEvents);
  const previousStats = calculateAggregatedStats(previousEvents);

  const currentDurations = currentEvents
    .filter((e) => e.duration !== undefined)
    .map((e) => e.duration as number);
  const previousDurations = previousEvents
    .filter((e) => e.duration !== undefined)
    .map((e) => e.duration as number);

  const currentAvgDuration =
    currentDurations.length > 0
      ? currentDurations.reduce((a, b) => a + b, 0) / currentDurations.length
      : 0;
  const previousAvgDuration =
    previousDurations.length > 0
      ? previousDurations.reduce((a, b) => a + b, 0) / previousDurations.length
      : 0;

  const triggersChange =
    previousStats.totalEvents > 0
      ? ((currentStats.totalEvents - previousStats.totalEvents) / previousStats.totalEvents) * 100
      : currentStats.totalEvents > 0
        ? 100
        : 0;

  const successRateChange =
    previousStats.overallSuccessRate > 0
      ? ((currentStats.overallSuccessRate - previousStats.overallSuccessRate) /
          previousStats.overallSuccessRate) *
        100
      : currentStats.overallSuccessRate > 0
        ? 100
        : 0;

  const durationChange =
    previousAvgDuration > 0
      ? ((currentAvgDuration - previousAvgDuration) / previousAvgDuration) * 100
      : currentAvgDuration > 0
        ? 100
        : 0;

  return {
    current: {
      startDate: currentStats.startDate,
      endDate: currentStats.endDate,
      totalTriggers: currentStats.totalEvents,
      successRate: currentStats.overallSuccessRate,
      avgDuration: currentAvgDuration,
    },
    previous: {
      startDate: previousStats.startDate,
      endDate: previousStats.endDate,
      totalTriggers: previousStats.totalEvents,
      successRate: previousStats.overallSuccessRate,
      avgDuration: previousAvgDuration,
    },
    changes: {
      triggersChange,
      successRateChange,
      durationChange,
    },
  };
}

export class StatisticsCalculator {
  private events: AnalyticsEvent[];

  constructor(events: AnalyticsEvent[]) {
    this.events = events;
  }

  getSkillStats(skillName: string): SkillStats {
    return calculateSkillStats(this.events, skillName);
  }

  getAggregatedStats(): AggregatedStats {
    return calculateAggregatedStats(this.events);
  }

  getTopSkills(limit: number = 10): SkillStats[] {
    const stats = calculateAggregatedStats(this.events);
    return stats.skillStats.slice(0, limit);
  }

  compareTrends(previousEvents: AnalyticsEvent[]): TrendComparison {
    return calculateTrends(this.events, previousEvents);
  }
}

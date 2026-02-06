import type {
  AnalyticsEvent,
  TriggerPattern,
  PotentialTrigger,
  UnusedSkill,
} from '../types/index.js';

export function analyzeTriggerPatterns(events: AnalyticsEvent[]): TriggerPattern[] {
  const phraseMap = new Map<
    string,
    { count: number; skills: Map<string, { total: number; success: number }> }
  >();

  for (const event of events) {
    if (!event.triggerPhrase) continue;

    const phrase = event.triggerPhrase.toLowerCase().trim();

    if (!phraseMap.has(phrase)) {
      phraseMap.set(phrase, { count: 0, skills: new Map() });
    }

    const entry = phraseMap.get(phrase)!;
    entry.count++;

    if (!entry.skills.has(event.skillName)) {
      entry.skills.set(event.skillName, { total: 0, success: 0 });
    }

    const skillEntry = entry.skills.get(event.skillName)!;
    skillEntry.total++;
    if (event.success === true) {
      skillEntry.success++;
    }
  }

  const patterns: TriggerPattern[] = [];

  for (const [phrase, data] of phraseMap) {
    const primarySkill = [...data.skills.entries()].sort(([, a], [, b]) => b.total - a.total)[0];

    if (primarySkill) {
      const [skillName, stats] = primarySkill;
      patterns.push({
        phrase,
        count: data.count,
        skillName,
        successRate: stats.total > 0 ? stats.success / stats.total : 0,
        isRegistered: true,
      });
    }
  }

  return patterns.sort((a, b) => b.count - a.count);
}

export function findPotentialTriggers(
  events: AnalyticsEvent[],
  existingPhrases: string[]
): PotentialTrigger[] {
  const errorEvents = events.filter((e) => e.eventType === 'error' && e.triggerPhrase);
  const phraseAttempts = new Map<string, number>();

  for (const event of errorEvents) {
    const phrase = event.triggerPhrase!.toLowerCase().trim();
    phraseAttempts.set(phrase, (phraseAttempts.get(phrase) ?? 0) + 1);
  }

  const potentials: PotentialTrigger[] = [];
  const normalizedExisting = existingPhrases.map((p) => p.toLowerCase().trim());

  for (const [phrase, attempts] of phraseAttempts) {
    if (attempts < 2) continue;

    const similarities = normalizedExisting.map((existing) => ({
      phrase: existing,
      score: calculateSimilarity(phrase, existing),
    }));

    const bestMatch = similarities.sort((a, b) => b.score - a.score)[0];
    const bestScore = bestMatch?.score ?? 0;

    potentials.push({
      phrase,
      attempts,
      similarTo: bestScore > 0.3 ? bestMatch?.phrase : undefined,
      similarity: bestScore,
    });
  }

  return potentials.sort((a, b) => b.attempts - a.attempts);
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const aWords = new Set(a.split(/\s+/));
  const bWords = new Set(b.split(/\s+/));

  let intersection = 0;
  for (const word of aWords) {
    if (bWords.has(word)) intersection++;
  }

  const union = aWords.size + bWords.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function findUnusedSkills(
  events: AnalyticsEvent[],
  allSkillNames: string[],
  thresholdDays: number = 30
): UnusedSkill[] {
  const now = new Date();
  const skillLastUsed = new Map<string, { lastUsed: Date; count: number }>();

  for (const event of events) {
    const existing = skillLastUsed.get(event.skillName);
    const eventDate = new Date(event.timestamp);

    if (!existing || eventDate > existing.lastUsed) {
      skillLastUsed.set(event.skillName, {
        lastUsed: eventDate,
        count: (existing?.count ?? 0) + 1,
      });
    } else {
      existing.count++;
    }
  }

  const unused: UnusedSkill[] = [];

  for (const skillName of allSkillNames) {
    const usage = skillLastUsed.get(skillName);

    if (!usage) {
      unused.push({
        skillName,
        daysSinceLastUse: Infinity,
        lastUsed: '',
        lifetimeTriggers: 0,
      });
      continue;
    }

    const daysSince = Math.floor(
      (now.getTime() - usage.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince >= thresholdDays) {
      unused.push({
        skillName,
        daysSinceLastUse: daysSince,
        lastUsed: usage.lastUsed.toISOString(),
        lifetimeTriggers: usage.count,
      });
    }
  }

  return unused.sort((a, b) => b.daysSinceLastUse - a.daysSinceLastUse);
}

export class PatternAnalyzer {
  private events: AnalyticsEvent[];

  constructor(events: AnalyticsEvent[]) {
    this.events = events;
  }

  getTriggerPatterns(): TriggerPattern[] {
    return analyzeTriggerPatterns(this.events);
  }

  getPotentialTriggers(existingPhrases: string[]): PotentialTrigger[] {
    return findPotentialTriggers(this.events, existingPhrases);
  }

  getUnusedSkills(allSkillNames: string[], thresholdDays: number = 30): UnusedSkill[] {
    return findUnusedSkills(this.events, allSkillNames, thresholdDays);
  }

  getMostCommonTriggers(limit: number = 10): TriggerPattern[] {
    return this.getTriggerPatterns().slice(0, limit);
  }

  getLowSuccessRateTriggers(threshold: number = 0.5): TriggerPattern[] {
    return this.getTriggerPatterns().filter((p) => p.successRate < threshold);
  }
}

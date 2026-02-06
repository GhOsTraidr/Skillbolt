import type {
  AnalyticsEvent,
  Suggestion,
  SuggestionOptions,
  TriggerPattern,
} from '../types/index.js';
import { DEFAULT_SUGGESTION_OPTIONS } from '../types/index.js';
import { analyzeTriggerPatterns, findUnusedSkills, findPotentialTriggers } from './patterns.js';

export function generateSuggestions(
  events: AnalyticsEvent[],
  allSkillNames: string[],
  registeredTriggers: string[],
  options: SuggestionOptions = {}
): Suggestion[] {
  const opts = { ...DEFAULT_SUGGESTION_OPTIONS, ...options };
  const suggestions: Suggestion[] = [];

  const unusedSuggestions = generateUnusedSkillSuggestions(
    events,
    allSkillNames,
    opts.unusedThresholdDays
  );
  suggestions.push(...unusedSuggestions);

  const triggerPatterns = analyzeTriggerPatterns(events);
  const lowSuccessSuggestions = generateLowSuccessSuggestions(triggerPatterns);
  suggestions.push(...lowSuccessSuggestions);

  const potentialTriggers = findPotentialTriggers(events, registeredTriggers);
  const addTriggerSuggestions = generateAddTriggerSuggestions(potentialTriggers);
  suggestions.push(...addTriggerSuggestions);

  const removeTriggerSuggestions = generateRemoveTriggerSuggestions(triggerPatterns);
  suggestions.push(...removeTriggerSuggestions);

  let filtered = suggestions.filter((s) => s.confidence >= opts.minConfidence);

  if (!opts.includeLowPriority) {
    filtered = filtered.filter((s) => s.priority !== 'low');
  }

  filtered.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });

  return filtered.slice(0, opts.maxSuggestions);
}

function generateUnusedSkillSuggestions(
  events: AnalyticsEvent[],
  allSkillNames: string[],
  thresholdDays: number
): Suggestion[] {
  const unused = findUnusedSkills(events, allSkillNames, thresholdDays);

  return unused.map((skill): Suggestion => {
    const priority =
      skill.daysSinceLastUse > 60 ? 'high' : skill.daysSinceLastUse > 30 ? 'medium' : 'low';
    const confidence = Math.min(0.9, 0.5 + (skill.daysSinceLastUse / 90) * 0.4);

    return {
      type: 'remove_skill',
      priority,
      skillName: skill.skillName,
      reason: `Skill has not been used for ${skill.daysSinceLastUse === Infinity ? 'ever' : skill.daysSinceLastUse + ' days'}`,
      suggestion: `Consider removing or archiving "${skill.skillName}" if it's no longer needed`,
      evidence: [
        `Last used: ${skill.lastUsed || 'Never'}`,
        `Lifetime triggers: ${skill.lifetimeTriggers}`,
      ],
      confidence,
    };
  });
}

function generateLowSuccessSuggestions(patterns: TriggerPattern[]): Suggestion[] {
  return patterns
    .filter((p) => p.successRate < 0.5 && p.count >= 5)
    .map(
      (pattern): Suggestion => ({
        type: 'improve_description',
        priority: pattern.successRate < 0.3 ? 'high' : 'medium',
        skillName: pattern.skillName,
        reason: `Trigger phrase "${pattern.phrase}" has only ${(pattern.successRate * 100).toFixed(0)}% success rate`,
        suggestion: `Review and improve the skill description or implementation for better reliability`,
        evidence: [
          `Phrase: "${pattern.phrase}"`,
          `Total uses: ${pattern.count}`,
          `Success rate: ${(pattern.successRate * 100).toFixed(1)}%`,
        ],
        confidence: Math.min(0.9, 0.5 + (1 - pattern.successRate) * 0.4),
      })
    );
}

function generateAddTriggerSuggestions(
  potentialTriggers: Array<{
    phrase: string;
    attempts: number;
    similarTo?: string;
    similarity?: number;
  }>
): Suggestion[] {
  return potentialTriggers
    .filter((p) => p.attempts >= 3)
    .map(
      (potential): Suggestion => ({
        type: 'add_trigger',
        priority: potential.attempts >= 10 ? 'high' : potential.attempts >= 5 ? 'medium' : 'low',
        skillName: potential.similarTo ?? 'unknown',
        reason: `Users attempted "${potential.phrase}" ${potential.attempts} times`,
        suggestion: potential.similarTo
          ? `Add "${potential.phrase}" as a trigger for "${potential.similarTo}"`
          : `Consider creating a skill for the phrase "${potential.phrase}"`,
        evidence: [
          `Attempted ${potential.attempts} times`,
          potential.similarTo
            ? `Similar to: "${potential.similarTo}" (${((potential.similarity ?? 0) * 100).toFixed(0)}% match)`
            : 'No similar skill found',
        ],
        confidence: Math.min(0.85, 0.4 + (potential.attempts / 20) * 0.45),
      })
    );
}

function generateRemoveTriggerSuggestions(patterns: TriggerPattern[]): Suggestion[] {
  const lowUseTriggers = patterns.filter((p) => p.count === 1 && p.successRate < 0.5);

  return lowUseTriggers.map(
    (pattern): Suggestion => ({
      type: 'remove_trigger',
      priority: 'low',
      skillName: pattern.skillName,
      reason: `Trigger phrase "${pattern.phrase}" was only used once and failed`,
      suggestion: `Consider removing "${pattern.phrase}" if it's not a useful trigger`,
      evidence: [
        `Used only ${pattern.count} time(s)`,
        `Success rate: ${(pattern.successRate * 100).toFixed(0)}%`,
      ],
      confidence: 0.5,
    })
  );
}

export class SuggestionGenerator {
  private events: AnalyticsEvent[];
  private allSkillNames: string[];
  private registeredTriggers: string[];

  constructor(
    events: AnalyticsEvent[],
    allSkillNames: string[] = [],
    registeredTriggers: string[] = []
  ) {
    this.events = events;
    this.allSkillNames = allSkillNames;
    this.registeredTriggers = registeredTriggers;
  }

  generate(options: SuggestionOptions = {}): Suggestion[] {
    return generateSuggestions(this.events, this.allSkillNames, this.registeredTriggers, options);
  }

  getHighPrioritySuggestions(): Suggestion[] {
    return this.generate({ includeLowPriority: false }).filter((s) => s.priority === 'high');
  }

  getSuggestionsByType(type: Suggestion['type']): Suggestion[] {
    return this.generate().filter((s) => s.type === type);
  }
}

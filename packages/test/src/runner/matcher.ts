import type { MatchResult, MatchType, MatchTypeConfig } from '../types/index.js';

const DEFAULT_MATCH_CONFIG: MatchTypeConfig = {
  exact: true,
  contains: true,
  fuzzy: true,
  regex: true,
  semantic: false,
  fuzzyThreshold: 0.7,
};

export function matchExact(input: string, triggers: string[]): MatchResult {
  const normalizedInput = input.toLowerCase().trim();

  for (const trigger of triggers) {
    const normalizedTrigger = trigger.toLowerCase().trim();

    if (normalizedInput === normalizedTrigger) {
      return {
        matched: true,
        trigger,
        confidence: 1.0,
        matchType: 'exact',
      };
    }
  }

  return {
    matched: false,
    confidence: 0,
    matchType: 'exact',
  };
}

export function matchContains(input: string, triggers: string[]): MatchResult {
  const normalizedInput = input.toLowerCase().trim();

  for (const trigger of triggers) {
    const normalizedTrigger = trigger.toLowerCase().trim();

    if (normalizedInput.includes(normalizedTrigger)) {
      const coverage = normalizedTrigger.length / normalizedInput.length;
      const confidence = Math.min(0.9, 0.6 + coverage * 0.3);

      return {
        matched: true,
        trigger,
        confidence,
        matchType: 'contains',
        details: { coverage },
      };
    }
  }

  return {
    matched: false,
    confidence: 0,
    matchType: 'contains',
  };
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
}

function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

export function matchFuzzy(input: string, triggers: string[], threshold = 0.7): MatchResult {
  const normalizedInput = input.toLowerCase().trim();
  let bestMatch: { trigger: string; similarity: number } | null = null;

  for (const trigger of triggers) {
    const normalizedTrigger = trigger.toLowerCase().trim();
    const similarity = calculateSimilarity(normalizedInput, normalizedTrigger);

    if (similarity >= threshold) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { trigger, similarity };
      }
    }
  }

  if (bestMatch) {
    return {
      matched: true,
      trigger: bestMatch.trigger,
      confidence: bestMatch.similarity,
      matchType: 'fuzzy',
      details: { similarity: bestMatch.similarity },
    };
  }

  return {
    matched: false,
    confidence: 0,
    matchType: 'fuzzy',
  };
}

function isRegexTrigger(trigger: string): boolean {
  return trigger.startsWith('/') && trigger.lastIndexOf('/') > 0;
}

function parseRegexTrigger(trigger: string): RegExp | null {
  if (!isRegexTrigger(trigger)) return null;

  const lastSlash = trigger.lastIndexOf('/');
  const pattern = trigger.slice(1, lastSlash);
  const flags = trigger.slice(lastSlash + 1);

  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

export function matchRegex(input: string, triggers: string[]): MatchResult {
  for (const trigger of triggers) {
    const regex = parseRegexTrigger(trigger);
    if (!regex) continue;

    const match = input.match(regex);
    if (match) {
      return {
        matched: true,
        trigger,
        confidence: 0.95,
        matchType: 'regex',
        details: {
          match: match[0],
          groups: match.slice(1),
        },
      };
    }
  }

  return {
    matched: false,
    confidence: 0,
    matchType: 'regex',
  };
}

export interface MatcherOptions {
  config?: Partial<MatchTypeConfig>;
}

export function createMatcher(options: MatcherOptions = {}) {
  const config = { ...DEFAULT_MATCH_CONFIG, ...options.config };

  return {
    match(input: string, triggers: string[]): MatchResult {
      if (triggers.length === 0) {
        return { matched: false, confidence: 0, matchType: 'exact' };
      }

      const regularTriggers = triggers.filter((t) => !isRegexTrigger(t));
      const regexTriggers = triggers.filter((t) => isRegexTrigger(t));

      if (config.exact) {
        const result = matchExact(input, regularTriggers);
        if (result.matched) return result;
      }

      if (config.contains) {
        const result = matchContains(input, regularTriggers);
        if (result.matched) return result;
      }

      if (config.regex && regexTriggers.length > 0) {
        const result = matchRegex(input, regexTriggers);
        if (result.matched) return result;
      }

      if (config.fuzzy) {
        const result = matchFuzzy(input, regularTriggers, config.fuzzyThreshold);
        if (result.matched) return result;
      }

      return { matched: false, confidence: 0, matchType: 'exact' };
    },

    matchAll(input: string, triggers: string[]): MatchResult[] {
      const results: MatchResult[] = [];
      const regularTriggers = triggers.filter((t) => !isRegexTrigger(t));
      const regexTriggers = triggers.filter((t) => isRegexTrigger(t));

      if (config.exact) {
        const result = matchExact(input, regularTriggers);
        if (result.matched) results.push(result);
      }

      if (config.contains) {
        const result = matchContains(input, regularTriggers);
        if (result.matched && !results.some((r) => r.trigger === result.trigger)) {
          results.push(result);
        }
      }

      if (config.regex && regexTriggers.length > 0) {
        const result = matchRegex(input, regexTriggers);
        if (result.matched) results.push(result);
      }

      if (config.fuzzy) {
        const result = matchFuzzy(input, regularTriggers, config.fuzzyThreshold);
        if (result.matched && !results.some((r) => r.trigger === result.trigger)) {
          results.push(result);
        }
      }

      return results.sort((a, b) => b.confidence - a.confidence);
    },
  };
}

export function matchTrigger(
  input: string,
  triggers: string[],
  matchType?: MatchType
): MatchResult {
  if (triggers.length === 0) {
    return { matched: false, confidence: 0, matchType: matchType ?? 'exact' };
  }

  switch (matchType) {
    case 'exact':
      return matchExact(input, triggers);
    case 'contains':
      return matchContains(input, triggers);
    case 'fuzzy':
      return matchFuzzy(input, triggers);
    case 'regex':
      return matchRegex(input, triggers);
    default:
      return createMatcher().match(input, triggers);
  }
}

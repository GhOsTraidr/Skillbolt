import { describe, it, expect } from 'vitest';
import {
  matchExact,
  matchContains,
  matchFuzzy,
  matchRegex,
  createMatcher,
  matchTrigger,
} from '../src/runner/matcher.js';

describe('matchExact', () => {
  const triggers = ['test something', 'run tests'];

  it('should match exact trigger phrase', () => {
    const result = matchExact('test something', triggers);
    expect(result.matched).toBe(true);
    expect(result.trigger).toBe('test something');
    expect(result.confidence).toBe(1.0);
    expect(result.matchType).toBe('exact');
  });

  it('should match case-insensitively', () => {
    const result = matchExact('TEST SOMETHING', triggers);
    expect(result.matched).toBe(true);
    expect(result.confidence).toBe(1.0);
  });

  it('should trim whitespace', () => {
    const result = matchExact('  test something  ', triggers);
    expect(result.matched).toBe(true);
  });

  it('should not match partial phrases', () => {
    const result = matchExact('test', triggers);
    expect(result.matched).toBe(false);
  });

  it('should not match unrelated input', () => {
    const result = matchExact('deploy to production', triggers);
    expect(result.matched).toBe(false);
  });
});

describe('matchContains', () => {
  const triggers = ['test something'];

  it('should match when trigger is contained in input', () => {
    const result = matchContains('please test something for me', triggers);
    expect(result.matched).toBe(true);
    expect(result.trigger).toBe('test something');
    expect(result.matchType).toBe('contains');
    expect(result.confidence).toBeGreaterThan(0.6);
    expect(result.confidence).toBeLessThan(1.0);
  });

  it('should not match when trigger is not present', () => {
    const result = matchContains('deploy to production', triggers);
    expect(result.matched).toBe(false);
  });
});

describe('matchFuzzy', () => {
  const triggers = ['test something'];

  it('should match with minor typos', () => {
    const result = matchFuzzy('tset somthing', triggers, 0.6);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('fuzzy');
  });

  it('should return confidence score', () => {
    const result = matchFuzzy('test somethng', triggers, 0.7);
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.confidence).toBeLessThan(1);
  });

  it('should not match completely different phrases', () => {
    const result = matchFuzzy('deploy to production', triggers, 0.7);
    expect(result.matched).toBe(false);
  });
});

describe('matchRegex', () => {
  const triggers = ['/test\\s+\\w+/i'];

  it('should match regex patterns', () => {
    const result = matchRegex('test something', triggers);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('regex');
    expect(result.confidence).toBe(0.95);
  });

  it('should handle invalid regex gracefully', () => {
    const invalidTriggers = ['/[invalid/'];
    expect(() => matchRegex('test', invalidTriggers)).not.toThrow();
    const result = matchRegex('test', invalidTriggers);
    expect(result.matched).toBe(false);
  });

  it('should ignore non-regex triggers', () => {
    const mixedTriggers = ['plain text', '/test\\s+/'];
    const result = matchRegex('test hello', mixedTriggers);
    expect(result.matched).toBe(true);
  });
});

describe('createMatcher', () => {
  const triggers = ['test something', 'run tests', '/^execute\\s+test$/i'];

  it('should try match types in order', () => {
    const matcher = createMatcher();
    const result = matcher.match('test something', triggers);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('exact');
  });

  it('should fall back to fuzzy match', () => {
    const matcher = createMatcher();
    const result = matcher.match('tset somethng', triggers);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('fuzzy');
  });

  it('should match regex triggers', () => {
    const matcher = createMatcher();
    const result = matcher.match('execute test', triggers);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('regex');
  });

  it('should return all matches with matchAll', () => {
    const matcher = createMatcher();
    const results = matcher.matchAll('test something', triggers);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.matchType).toBe('exact');
  });

  it('should respect config options', () => {
    const matcher = createMatcher({ config: { fuzzy: false } });
    const result = matcher.match('tset somethng', triggers);
    expect(result.matched).toBe(false);
  });
});

describe('matchTrigger', () => {
  const triggers = ['test something', 'run tests'];

  it('should use specified match type', () => {
    const result = matchTrigger('test something', triggers, 'exact');
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('exact');
  });

  it('should use auto match when type not specified', () => {
    const result = matchTrigger('please test something', triggers);
    expect(result.matched).toBe(true);
  });

  it('should handle empty triggers', () => {
    const result = matchTrigger('test', []);
    expect(result.matched).toBe(false);
  });
});

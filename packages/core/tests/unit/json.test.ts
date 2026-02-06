import { describe, it, expect } from 'vitest';
import { extractJSON, extractJSONArray } from '../../src/utils/json.js';

describe('extractJSON', () => {
  it('should parse bare JSON object', () => {
    const result = extractJSON<{ name: string }>('{"name": "test"}');
    expect(result).toEqual({ name: 'test' });
  });

  it('should parse bare JSON array', () => {
    const result = extractJSON<string[]>('["a", "b"]');
    expect(result).toEqual(['a', 'b']);
  });

  it('should extract JSON from markdown code fence', () => {
    const text = 'Here is the result:\n```json\n{"key": "value"}\n```\nDone.';
    const result = extractJSON<{ key: string }>(text);
    expect(result).toEqual({ key: 'value' });
  });

  it('should extract JSON from code fence without json label', () => {
    const text = '```\n{"key": 42}\n```';
    const result = extractJSON<{ key: number }>(text);
    expect(result).toEqual({ key: 42 });
  });

  it('should extract JSON embedded in prose', () => {
    const text = 'The answer is {"score": 95} and that is final.';
    const result = extractJSON<{ score: number }>(text);
    expect(result).toEqual({ score: 95 });
  });

  it('should handle nested objects', () => {
    const obj = { a: { b: { c: [1, 2, 3] } } };
    const text = `Some text ${JSON.stringify(obj)} more text`;
    const result = extractJSON(text);
    expect(result).toEqual(obj);
  });

  it('should return null for empty input', () => {
    expect(extractJSON('')).toBeNull();
    expect(extractJSON(null as unknown as string)).toBeNull();
    expect(extractJSON(undefined as unknown as string)).toBeNull();
  });

  it('should return null for non-JSON text', () => {
    expect(extractJSON('just plain text with no json')).toBeNull();
  });

  it('should handle strings with escaped quotes in JSON', () => {
    const text = '{"msg": "say \\"hello\\""}';
    const result = extractJSON<{ msg: string }>(text);
    expect(result).toEqual({ msg: 'say "hello"' });
  });
});

describe('extractJSONArray', () => {
  it('should extract a direct array', () => {
    const result = extractJSONArray('["a", "b", "c"]');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should extract array from object wrapper', () => {
    const text = '{"items": [1, 2, 3]}';
    const result = extractJSONArray(text);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return empty array for non-JSON', () => {
    expect(extractJSONArray('no json here')).toEqual([]);
  });

  it('should return empty array for non-array JSON', () => {
    expect(extractJSONArray('{"key": "value"}')).toEqual([]);
  });

  it('should extract array from markdown fence', () => {
    const text = '```json\n[{"id": 1}, {"id": 2}]\n```';
    const result = extractJSONArray(text);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

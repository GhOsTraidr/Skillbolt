import { describe, it, expect } from 'vitest';
import { parseSelectionResponse, parsePruneResponse } from '../src/searcher/parser.js';

describe('parseSelectionResponse', () => {
  const validIds = ['id1', 'id2', 'id3'];

  it('parses legacy array format', () => {
    const result = parseSelectionResponse('["id1", "id2"]', validIds);
    expect(result).toEqual([
      { id: 'id1', reason: '' },
      { id: 'id2', reason: '' },
    ]);
  });

  it('parses new object format with reasons', () => {
    const result = parseSelectionResponse('[{"id":"id1","reason":"match"}]', validIds);
    expect(result).toEqual([{ id: 'id1', reason: 'match' }]);
  });

  it('parses object wrapper with selected array', () => {
    const result = parseSelectionResponse('{"selected":["id1"]}', validIds);
    expect(result).toEqual([{ id: 'id1', reason: '' }]);
  });

  it('parses markdown fenced json', () => {
    const result = parseSelectionResponse('```json\n["id2"]\n```', validIds);
    expect(result).toEqual([{ id: 'id2', reason: '' }]);
  });

  it('filters invalid ids', () => {
    const result = parseSelectionResponse('["id1", "nope"]', validIds);
    expect(result).toEqual([{ id: 'id1', reason: '' }]);
  });

  it('returns empty array for empty or invalid json', () => {
    expect(parseSelectionResponse('[]', validIds)).toEqual([]);
    expect(parseSelectionResponse('{', validIds)).toEqual([]);
  });

  it('returns empty array for non-json text', () => {
    const result = parseSelectionResponse('not a json response', validIds);
    expect(result).toEqual([]);
  });
});

describe('parsePruneResponse', () => {
  const validIds = ['skill1', 'skill2', 'skill3'];

  it('parses selected_skills and eliminated arrays', () => {
    const response = JSON.stringify({
      selected_skills: [{ id: 'skill1', reason: 'top' }],
      eliminated: [{ id: 'skill2', reason: 'dup' }],
    });

    const result = parsePruneResponse(response, validIds);
    expect(result).toEqual({
      selected: [{ id: 'skill1', reason: 'top' }],
      eliminated: [{ id: 'skill2', reason: 'dup' }],
    });
  });

  it('handles missing fields gracefully', () => {
    const response = '{"selected_skills":["skill3"]}';
    const result = parsePruneResponse(response, validIds);
    expect(result).toEqual({
      selected: [{ id: 'skill3', reason: '' }],
      eliminated: [],
    });
  });

  it('returns empty arrays for invalid json', () => {
    const result = parsePruneResponse('not-json', validIds);
    expect(result).toEqual({ selected: [], eliminated: [] });
  });
});

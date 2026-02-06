import { describe, it, expect } from 'vitest';
import {
  buildNodeSelectionPrompt,
  buildSkillSelectionPrompt,
  buildSkillPrunePrompt,
} from '../src/searcher/prompts.js';

describe('prompt builders', () => {
  it('buildNodeSelectionPrompt includes query and child info', () => {
    const messages = buildNodeSelectionPrompt('find tools', [
      { id: 'child-a', name: 'Child A', description: 'Desc A', skillCount: 3 },
      { id: 'child-b', name: 'Child B', description: 'Desc B', skillCount: 5 },
    ]);

    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toContain('find tools');
    expect(messages[0].content).toContain('child-a');
    expect(messages[0].content).toContain('Child A');
    expect(messages[0].content).toContain('3 skills');
  });

  it('buildSkillSelectionPrompt includes skill list', () => {
    const messages = buildSkillSelectionPrompt('do work', [
      { id: 'skill-1', description: 'First skill description' },
      { id: 'skill-2', description: 'Second skill description' },
    ]);

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toContain('do work');
    expect(messages[0].content).toContain('skill-1');
    expect(messages[0].content).toContain('First skill description');
    expect(messages[0].content).toContain('skill-2');
  });

  it('buildSkillPrunePrompt includes full skill details', () => {
    const messages = buildSkillPrunePrompt('refine', [
      { id: 's1', name: 'Skill One', description: 'Desc One', content: 'Content One' },
      { id: 's2', name: 'Skill Two', description: 'Desc Two', content: 'Content Two' },
    ]);

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toContain('refine');
    expect(messages[0].content).toContain('Skill One');
    expect(messages[0].content).toContain('Desc One');
    expect(messages[0].content).toContain('Content One');
    expect(messages[0].content).toContain('Skill Two');
  });
});

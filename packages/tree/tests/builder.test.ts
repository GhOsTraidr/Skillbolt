import { describe, it, expect, vi } from 'vitest';

import type { LLMAdapter, LLMMessage } from '@skillbolt/core';

import { createTreeConfig } from '../src/config.js';
import {
  buildCategoryAssignmentPrompt,
  buildRecursiveSplitPrompt,
} from '../src/builder/prompts.js';
import { assignToRootCategories, splitNodeIntoGroups } from '../src/builder/splitter.js';
import { validateSplitQuality } from '../src/builder/validator.js';
import type { RootCategory, TreeSkill } from '../src/types.js';

const createSkill = (id: string, name = `Skill ${id}`): TreeSkill => ({
  id,
  name,
  description: `${name} description`,
  path: '',
  skillPath: `/skills/${id}/SKILL.md`,
  content: `${name} content`,
});

const createMockLLM = (): LLMAdapter => ({
  complete: vi.fn<ReturnType<LLMAdapter['complete']>, Parameters<LLMAdapter['complete']>>(),
  completeJSON: vi.fn<
    ReturnType<LLMAdapter['completeJSON']>,
    Parameters<LLMAdapter['completeJSON']>
  >(),
});

describe('builder prompts', () => {
  it('buildCategoryAssignmentPrompt returns correct LLMMessage array', () => {
    const skills = [
      { id: 's1', name: 'Alpha', description: 'Alpha desc' },
      { id: 's2', name: 'Beta', description: 'Beta desc' },
    ];
    const categories: RootCategory[] = [
      { id: 'cat-1', name: 'Cat One', description: 'Cat One desc' },
    ];

    const messages = buildCategoryAssignmentPrompt(skills, categories);

    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[0]?.content).toBe('You are a skill taxonomy expert.');
    expect(messages[1]?.role).toBe('user');
    expect(messages[1]?.content).toContain('You are assigning 2 skills');
    expect(messages[1]?.content).toContain('- cat-1: Cat One');
    expect(messages[1]?.content).toContain('1. s1: Alpha - Alpha desc');
    expect(messages[1]?.content).toContain('2. s2: Beta - Beta desc');
    expect(messages[1]?.content).toContain('## Output Format');
  });

  it('buildRecursiveSplitPrompt returns correct messages', () => {
    const skills = [
      { id: 's1', name: 'Alpha', description: 'Alpha desc' },
      { id: 's2', name: 'Beta', description: 'Beta desc' },
    ];
    const context = { parentName: 'Root', parentDescription: 'Root desc', depth: 1 };

    const messages = buildRecursiveSplitPrompt(skills, context, 2, 4);

    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[1]?.role).toBe('user');
    expect(messages[1]?.content).toContain('Parent: Root');
    expect(messages[1]?.content).toContain('Description: Root desc');
    expect(messages[1]?.content).toContain('Depth: 1');
    expect(messages[1]?.content).toContain('Target: 2-4 groups');
    expect(messages[1]?.content).toContain('1. s1: Alpha - Alpha desc');
  });
});

describe('validateSplitQuality', () => {
  it('detects empty groups', () => {
    const result = validateSplitQuality(
      [{ id: 'g1', name: 'Group 1', description: 'desc', skills: [] }],
      2
    );

    expect(result.valid).toBe(false);
    expect(result.warnings.some((warning) => warning.includes('has no skills'))).toBe(true);
  });

  it('detects oversized groups', () => {
    const result = validateSplitQuality(
      [
        {
          id: 'g1',
          name: 'Group 1',
          description: 'desc',
          skills: [
            { id: 's1' },
            { id: 's2' },
            { id: 's3' },
            { id: 's4' },
            { id: 's5' },
            { id: 's6' },
          ],
        },
        { id: 'g2', name: 'Group 2', description: 'desc', skills: [{ id: 's7' }] },
      ],
      4
    );

    expect(result.warnings.some((warning) => warning.includes('oversized'))).toBe(true);
  });

  it('detects singleton groups', () => {
    const result = validateSplitQuality(
      [
        { id: 'g1', name: 'Group 1', description: 'desc', skills: [{ id: 's1' }] },
        { id: 'g2', name: 'Group 2', description: 'desc', skills: [{ id: 's2' }, { id: 's3' }] },
      ],
      3
    );

    expect(result.warnings.some((warning) => warning.includes('only one skill'))).toBe(true);
  });

  it('passes a valid split', () => {
    const result = validateSplitQuality(
      [
        { id: 'g1', name: 'Group 1', description: 'desc', skills: [{ id: 's1' }, { id: 's2' }] },
        { id: 'g2', name: 'Group 2', description: 'desc', skills: [{ id: 's3' }, { id: 's4' }] },
      ],
      4
    );

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when coverage is below 90%', () => {
    const result = validateSplitQuality(
      [
        { id: 'g1', name: 'Group 1', description: 'desc', skills: [{ id: 's1' }, { id: 's2' }] },
        { id: 'g2', name: 'Group 2', description: 'desc', skills: [{ id: 's3' }] },
      ],
      10
    );

    expect(result.valid).toBe(false);
    expect(result.warnings.some((warning) => warning.includes('30.0%'))).toBe(true);
  });
});

describe('builder splitter', () => {
  it('assigns skills to root categories using LLM response', async () => {
    const skills = [createSkill('s1'), createSkill('s2'), createSkill('s3')];
    const categories: RootCategory[] = [
      { id: 'cat-a', name: 'Category A', description: 'Category A desc' },
      { id: 'cat-b', name: 'Category B', description: 'Category B desc' },
    ];
    const llm = createMockLLM();

    const response = {
      assignments: {
        'cat-a': { skill_ids: ['s1'], description: 'Custom A desc' },
        'cat-b': { skill_ids: ['s2'] },
      },
    };

    (llm.completeJSON as (messages: LLMMessage[]) => Promise<unknown>).mockResolvedValue(response);

    const result = await assignToRootCategories(skills, categories, llm);

    const catA = result.get('cat-a');
    const catB = result.get('cat-b');

    expect(catA?.skills.map((skill) => skill.id).sort()).toEqual(['s1', 's3']);
    expect(catA?.description).toBe('Custom A desc');
    expect(catB?.skills.map((skill) => skill.id)).toEqual(['s2']);
    expect(catB?.description).toBe('Category B desc');
  });

  it('splits node into groups using LLM response', async () => {
    const skills = [createSkill('s1'), createSkill('s2'), createSkill('s3')];
    const context = { parentName: 'Root', parentDescription: 'Root desc', depth: 1 };
    const config = createTreeConfig({ branchingFactor: 3 });
    const llm = createMockLLM();

    const response = {
      groups: {
        'group-a': { name: 'Group A', description: 'Group A desc', skill_ids: ['s1'] },
        'group-b': { name: 'Group B', description: 'Group B desc', skill_ids: ['s2'] },
      },
    };

    (llm.completeJSON as (messages: LLMMessage[]) => Promise<unknown>).mockResolvedValue(response);

    const groups = await splitNodeIntoGroups(skills, context, config, llm);

    const groupA = groups.find((group) => group.id === 'group-a');
    const groupB = groups.find((group) => group.id === 'group-b');

    expect(groupA?.skills.map((skill) => skill.id).sort()).toEqual(['s1', 's3']);
    expect(groupA?.name).toBe('Group A');
    expect(groupB?.skills.map((skill) => skill.id)).toEqual(['s2']);
    expect(groupB?.description).toBe('Group B desc');
  });

  it('falls back when LLM fails', async () => {
    const skills = [createSkill('s1'), createSkill('s2')];
    const context = { parentName: 'Root', parentDescription: 'Root desc', depth: 1 };
    const config = createTreeConfig();
    const llm = createMockLLM();

    (llm.completeJSON as (messages: LLMMessage[]) => Promise<unknown>).mockRejectedValue(
      new Error('LLM failure')
    );

    const groups = await splitNodeIntoGroups(skills, context, config, llm);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe('all-skills');
    expect(groups[0]?.skills.map((skill) => skill.id).sort()).toEqual(['s1', 's2']);
  });
});

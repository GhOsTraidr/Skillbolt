import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Searcher } from '../src/searcher/index.js';
import { TreeNode } from '../../tree/src/node/index.js';
import type { TreeNodeData, TreeSkill } from '../../tree/src/types.js';
import type { LLMAdapter } from '@skillbolt/core';

function createSkill(id: string, overrides: Partial<TreeSkill> = {}): TreeSkill {
  return {
    id,
    name: `Skill ${id}`,
    description: `Description ${id}`,
    path: `path/${id}`,
    skillPath: `/skills/${id}/SKILL.md`,
    content: `Content ${id}`,
    ...overrides,
  };
}

function createEarlyStopTree(): TreeNode {
  const rootData: TreeNodeData = {
    id: 'root',
    name: 'Root',
    description: 'Root node',
    depth: 0,
    parentId: null,
    children: [
      {
        id: 'child-a',
        name: 'Child A',
        description: 'Child A node',
        depth: 1,
        parentId: 'root',
        children: [],
        skills: [createSkill('skill-a1'), createSkill('skill-a2')],
      },
    ],
    skills: [],
  };

  return TreeNode.fromData(rootData);
}

function createSelectionTree(): TreeNode {
  const rootData: TreeNodeData = {
    id: 'root',
    name: 'Root',
    description: 'Root node',
    depth: 0,
    parentId: null,
    children: [
      {
        id: 'child-a',
        name: 'Child A',
        description: 'Child A node',
        depth: 1,
        parentId: 'root',
        children: [],
        skills: [createSkill('skill-a1'), createSkill('skill-a2')],
      },
      {
        id: 'child-b',
        name: 'Child B',
        description: 'Child B node',
        depth: 1,
        parentId: 'root',
        children: [],
        skills: [createSkill('skill-b1'), createSkill('skill-b2')],
      },
    ],
    skills: [],
  };

  return TreeNode.fromData(rootData);
}

describe('Searcher', () => {
  let mockLLM: LLMAdapter;

  beforeEach(() => {
    mockLLM = {
      complete: vi.fn(),
      completeJSON: vi.fn(),
    } as unknown as LLMAdapter;
  });

  it('auto-expands and early stops with ordered events', async () => {
    const events: string[] = [];
    const emitterEvents: Array<{ type: string; data: Record<string, unknown> }> = [];

    const tree = createEarlyStopTree();
    const searcher = new Searcher({
      tree,
      llm: mockLLM,
      eventCallback: (event) => {
        events.push(event.type);
        emitterEvents.push({ type: event.type, data: event.data });
      },
    });

    (mockLLM.complete as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('["skill-a1", "skill-a2"]')
      .mockResolvedValueOnce(
        JSON.stringify({
          selected_skills: [{ id: 'skill-a1', reason: 'best match' }],
          eliminated: [{ id: 'skill-a2', reason: 'less relevant' }],
        })
      );

    const result = await searcher.search('find skills');

    expect(result.selectedSkills).toHaveLength(1);
    expect(result.selectedSkills[0]?.id).toBe('skill-a1');
    expect(result.selectedSkills[0]?.reason).toBe('best match');
    expect(result.llmCalls).toBe(2);

    expect(events).toEqual([
      'search_start',
      'node_enter',
      'children_selected',
      'early_stop',
      'skills_selected',
      'prune_start',
      'prune_complete',
      'search_complete',
    ]);

    const childrenSelected = emitterEvents.find((event) => event.type === 'children_selected');
    expect(childrenSelected?.data.autoExpand).toBe(true);
  });

  it('selects children via LLM, explores nodes, and prunes results', async () => {
    const tree = createSelectionTree();
    const searcher = new Searcher({ tree, llm: mockLLM });

    const internals = searcher as unknown as {
      expandThreshold: number;
      earlyStopSkillCount: number;
    };
    internals.expandThreshold = 1;
    internals.earlyStopSkillCount = 0;

    (mockLLM.complete as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('["child-b"]')
      .mockResolvedValueOnce('["skill-b1", "skill-b2"]')
      .mockResolvedValueOnce(
        JSON.stringify({
          selected_skills: [{ id: 'skill-b2', reason: 'top pick' }],
          eliminated: [{ id: 'skill-b1', reason: 'less relevant' }],
        })
      );

    const result = await searcher.search('pick B');

    expect(result.selectedSkills).toEqual([
      expect.objectContaining({ id: 'skill-b2', reason: 'top pick' }),
    ]);
    expect(result.exploredNodes).toEqual(['root', 'child-b']);
    expect(result.selectedPaths).toEqual(['child-b']);
    expect(result.llmCalls).toBe(3);
  });

  it('emits children_selected with autoExpand false when using LLM selection', async () => {
    const tree = createSelectionTree();
    const captured: Array<{ type: string; data: Record<string, unknown> }> = [];

    const searcher = new Searcher({
      tree,
      llm: mockLLM,
      eventCallback: (event) => {
        captured.push({ type: event.type, data: event.data });
      },
    });

    const internals = searcher as unknown as {
      expandThreshold: number;
      earlyStopSkillCount: number;
    };
    internals.expandThreshold = 1;
    internals.earlyStopSkillCount = 0;

    (mockLLM.complete as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('["child-a"]')
      .mockResolvedValueOnce('["skill-a1"]')
      .mockResolvedValueOnce(
        JSON.stringify({
          selected_skills: [{ id: 'skill-a1', reason: 'top' }],
          eliminated: [],
        })
      );

    await searcher.search('pick A');

    const childrenSelected = captured.find((event) => event.type === 'children_selected');
    expect(childrenSelected?.data.autoExpand).toBe(false);
  });
});

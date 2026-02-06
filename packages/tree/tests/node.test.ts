import { describe, it, expect } from 'vitest';

import { TreeNode } from '../src/node/index.js';
import { countTreeNodes, getTreeDepth, getTreeStats } from '../src/node/operations.js';
import type { TreeNodeData, TreeSkill } from '../src/types.js';

const createSkill = (id: string, name = `Skill ${id}`): TreeSkill => ({
  id,
  name,
  description: `${name} description`,
  path: '',
  skillPath: `/skills/${id}/SKILL.md`,
  content: `${name} content`,
});

const createNodeData = (overrides: Partial<TreeNodeData> = {}): TreeNodeData => ({
  id: overrides.id ?? 'node',
  name: overrides.name ?? 'Node',
  description: overrides.description ?? 'Node description',
  depth: overrides.depth ?? 0,
  parentId: overrides.parentId ?? null,
  children: overrides.children ?? [],
  skills: overrides.skills ?? [],
});

describe('TreeNode', () => {
  it('creates a node with expected properties', () => {
    const data = createNodeData({ id: 'root', name: 'Root', depth: 0 });
    const node = new TreeNode(data);

    expect(node.id).toBe('root');
    expect(node.name).toBe('Root');
    expect(node.depth).toBe(0);
    expect(node.parentId).toBeNull();
    expect(node.children).toEqual([]);
    expect(node.skills).toEqual([]);
  });

  it('reports leaf and intermediate states', () => {
    const leaf = new TreeNode(createNodeData({ id: 'leaf' }));
    expect(leaf.isLeaf).toBe(true);
    expect(leaf.isIntermediate).toBe(false);

    const child = new TreeNode(createNodeData({ id: 'child', depth: 1 }));
    const parent = new TreeNode(createNodeData({ id: 'parent' }));
    parent.addChild(child);

    expect(parent.isLeaf).toBe(false);
    expect(parent.isIntermediate).toBe(true);
  });

  it('adds child nodes and sets parentId', () => {
    const parent = new TreeNode(createNodeData({ id: 'parent' }));
    const child = new TreeNode(createNodeData({ id: 'child', depth: 1 }));

    parent.addChild(child);

    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]?.id).toBe('child');
    expect(child.parentId).toBe('parent');
  });

  it('adds skills to a node', () => {
    const node = new TreeNode(createNodeData({ id: 'node' }));
    const skill = createSkill('s1');

    node.addSkill(skill);

    expect(node.skills).toHaveLength(1);
    expect(node.skills[0]).toEqual(skill);
  });

  it('counts all skills in a subtree', () => {
    const root = new TreeNode(
      createNodeData({
        id: 'root',
        skills: [createSkill('s1')],
        children: [
          createNodeData({
            id: 'child-a',
            depth: 1,
            skills: [createSkill('s2'), createSkill('s3')],
            children: [
              createNodeData({
                id: 'grandchild',
                depth: 2,
                skills: [createSkill('s4')],
                children: [],
              }),
            ],
          }),
          createNodeData({ id: 'child-b', depth: 1, skills: [], children: [] }),
        ],
      })
    );

    expect(root.countAllSkills()).toBe(4);
  });

  it('collects all skills in a subtree', () => {
    const root = new TreeNode(
      createNodeData({
        id: 'root',
        skills: [createSkill('s1')],
        children: [
          createNodeData({
            id: 'child-a',
            depth: 1,
            skills: [createSkill('s2')],
            children: [
              createNodeData({
                id: 'grandchild',
                depth: 2,
                skills: [createSkill('s3')],
                children: [],
              }),
            ],
          }),
        ],
      })
    );

    const skills = root.collectAllSkills();
    const ids = skills.map((skill) => skill.id).sort();

    expect(ids).toEqual(['s1', 's2', 's3']);
  });

  it('returns leaf nodes only', () => {
    const root = new TreeNode(
      createNodeData({
        id: 'root',
        children: [
          createNodeData({
            id: 'child-a',
            depth: 1,
            children: [createNodeData({ id: 'grandchild', depth: 2 })],
          }),
          createNodeData({ id: 'child-b', depth: 1 }),
        ],
      })
    );

    const leaves = root.getLeafNodes();
    const leafIds = leaves.map((node) => node.id).sort();

    expect(leafIds).toEqual(['child-b', 'grandchild']);
  });

  it('finds nodes by path', () => {
    const root = new TreeNode(
      createNodeData({
        id: 'root',
        children: [
          createNodeData({
            id: 'child',
            depth: 1,
            children: [createNodeData({ id: 'grandchild', depth: 2 })],
          }),
        ],
      })
    );

    expect(root.findNode('child')?.id).toBe('child');
    expect(root.findNode('child/grandchild')?.id).toBe('grandchild');
    expect(root.findNode('missing')).toBeNull();
  });

  it('serializes to data and back', () => {
    const root = new TreeNode(
      createNodeData({
        id: 'root',
        skills: [createSkill('s1')],
        children: [
          createNodeData({
            id: 'child',
            depth: 1,
            skills: [createSkill('s2')],
            children: [],
          }),
        ],
      })
    );

    const data = root.toData();

    expect(data.id).toBe('root');
    expect(data.children).toHaveLength(1);
    expect(data.skills).toHaveLength(1);

    const roundTrip = TreeNode.fromData(data);
    expect(roundTrip.toData()).toEqual(data);
  });
});

describe('tree operations', () => {
  const tree = new TreeNode(
    createNodeData({
      id: 'root',
      depth: 0,
      skills: [createSkill('s1')],
      children: [
        createNodeData({
          id: 'child-a',
          depth: 1,
          skills: [createSkill('s2'), createSkill('s3')],
          children: [
            createNodeData({
              id: 'grandchild',
              depth: 2,
              skills: [createSkill('s4')],
              children: [],
            }),
          ],
        }),
        createNodeData({ id: 'child-b', depth: 1, skills: [], children: [] }),
      ],
    })
  );

  it('counts tree nodes', () => {
    expect(countTreeNodes(tree)).toBe(4);
  });

  it('computes max depth', () => {
    expect(getTreeDepth(tree)).toBe(2);
  });

  it('computes tree stats', () => {
    const stats = getTreeStats(tree);

    expect(stats.totalSkills).toBe(4);
    expect(stats.totalNodes).toBe(4);
    expect(stats.maxDepth).toBe(2);
    expect(stats.leafNodes).toBe(2);
    expect(stats.avgBranchingFactor).toBe(1.5);
  });
});

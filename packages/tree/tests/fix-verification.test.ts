import { describe, it, expect } from 'vitest';
import { TreeNode } from '../src/node/index.js';

describe('TreeNode children null/undefined handling fix', () => {
  it('should handle undefined children gracefully', () => {
    const node = new TreeNode({
      id: 'test-node',
      name: 'Test Node',
      description: 'Test description',
      depth: 0,
      parentId: null,
      children: undefined as any,
      skills: [],
    });

    expect(node.children).toEqual([]);
    expect(node.isLeaf).toBe(true);
  });

  it('should handle null children gracefully', () => {
    const node = new TreeNode({
      id: 'test-node',
      name: 'Test Node',
      description: 'Test description',
      depth: 0,
      parentId: null,
      children: null as any,
      skills: [],
    });

    expect(node.children).toEqual([]);
    expect(node.isLeaf).toBe(true);
  });

  it('should handle empty array children', () => {
    const node = new TreeNode({
      id: 'test-node',
      name: 'Test Node',
      description: 'Test description',
      depth: 0,
      parentId: null,
      children: [],
      skills: [],
    });

    expect(node.children).toEqual([]);
    expect(node.isLeaf).toBe(true);
  });

  it('should handle normal children array', () => {
    const node = new TreeNode({
      id: 'test-node',
      name: 'Test Node',
      description: 'Test description',
      depth: 0,
      parentId: null,
      children: [
        {
          id: 'child-1',
          name: 'Child 1',
          description: 'Child description',
          depth: 1,
          parentId: 'test-node',
          children: [],
          skills: [],
        },
        {
          id: 'child-2',
          name: 'Child 2',
          description: 'Child description',
          depth: 1,
          parentId: 'test-node',
          children: [],
          skills: [],
        },
      ],
      skills: [],
    });

    expect(node.children.length).toBe(2);
    expect(node.isLeaf).toBe(false);
    expect(node.isIntermediate).toBe(true);
    expect(node.children[0].id).toBe('child-1');
    expect(node.children[1].id).toBe('child-2');
  });

  it('should handle nested nodes with undefined children', () => {
    const node = new TreeNode({
      id: 'parent',
      name: 'Parent',
      description: 'Parent description',
      depth: 0,
      parentId: null,
      children: [
        {
          id: 'child',
          name: 'Child',
          description: 'Child description',
          depth: 1,
          parentId: 'parent',
          children: undefined as any,
          skills: [],
        },
      ],
      skills: [],
    });

    expect(node.children.length).toBe(1);
    expect(node.children[0].children).toEqual([]);
    expect(node.children[0].isLeaf).toBe(true);
  });

  it('should work with fromData static method', () => {
    const node = TreeNode.fromData({
      id: 'test-node',
      name: 'Test Node',
      description: 'Test description',
      depth: 0,
      parentId: null,
      children: undefined as any,
      skills: [],
    });

    expect(node.children).toEqual([]);
    expect(node.id).toBe('test-node');
  });
});
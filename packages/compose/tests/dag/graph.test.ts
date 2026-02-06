import { describe, it, expect } from 'vitest';
import {
  DependencyGraph,
  buildGraphFromNodes,
  createSkillNode,
  SkillType,
  NodeStatus,
} from '../../src/dag/index.js';

describe('DependencyGraph', () => {
  describe('addNode', () => {
    it('adds a node and getNode returns it', () => {
      const graph = new DependencyGraph();
      const node = createSkillNode({
        id: 'node1',
        name: 'Test Node',
        skillType: SkillType.PRIMARY,
      });

      graph.addNode(node);
      const retrieved = graph.getNode('node1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('node1');
      expect(retrieved?.name).toBe('Test Node');
    });

    it('wires edges correctly with dependencies', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      expect(graph.getDependencies('b')).toContain('a');
      expect(graph.getDependents('a')).toContain('b');
    });

    it('getDependents and getDependencies work correctly', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['a'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      expect(graph.getDependents('a')).toEqual(expect.arrayContaining(['b', 'c']));
      expect(graph.getDependencies('b')).toEqual(['a']);
      expect(graph.getDependencies('c')).toEqual(['a']);
    });
  });

  describe('removeNode', () => {
    it('removes a node and returns true', () => {
      const graph = new DependencyGraph();
      const node = createSkillNode({ id: 'node1', name: 'Test' });
      graph.addNode(node);

      const result = graph.removeNode('node1');

      expect(result).toBe(true);
      expect(graph.getNode('node1')).toBeUndefined();
    });

    it('returns false for non-existent node', () => {
      const graph = new DependencyGraph();
      const result = graph.removeNode('nonexistent');

      expect(result).toBe(false);
    });

    it('cleans edges when removing a node', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['b'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      graph.removeNode('b');

      expect(graph.getDependents('a')).not.toContain('b');
      expect(graph.getDependencies('c')).not.toContain('b');
    });
  });

  describe('detectCycle', () => {
    it('returns null for a DAG with no cycle', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['b'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      expect(graph.detectCycle()).toBeNull();
    });

    it('returns non-null array for a cycle A→B→C→A', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A', dependsOn: ['c'] });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['b'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      const cycle = graph.detectCycle();
      expect(cycle).not.toBeNull();
      expect(cycle).toHaveLength(4); // cycle includes start and end node
    });
  });

  describe('topologicalSort', () => {
    it('returns correct order for simple chain A→B→C', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['b'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      const sorted = graph.topologicalSort();

      expect(sorted).toEqual(['a', 'b', 'c']);
    });

    it('returns valid order for diamond A→B, A→C, B→D, C→D', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['a'] });
      const nodeD = createSkillNode({ id: 'd', name: 'D', dependsOn: ['b', 'c'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);
      graph.addNode(nodeD);

      const sorted = graph.topologicalSort();

      expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'));
      expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('c'));
      expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('d'));
      expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('d'));
    });

    it('throws error on cycle', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A', dependsOn: ['c'] });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['b'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      expect(() => graph.topologicalSort()).toThrow();
    });
  });

  describe('getExecutionPhases', () => {
    it('returns 1 phase for single node', () => {
      const graph = new DependencyGraph();
      const node = createSkillNode({ id: 'a', name: 'A' });
      graph.addNode(node);

      const phases = graph.getExecutionPhases();

      expect(phases).toHaveLength(1);
      expect(phases[0].phaseNumber).toBe(1);
      expect(phases[0].nodes).toEqual(['a']);
      expect(phases[0].mode).toBe('sequential');
    });

    it('returns 1 parallel phase for two independent nodes', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B' });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      const phases = graph.getExecutionPhases();

      expect(phases).toHaveLength(1);
      expect(phases[0].mode).toBe('parallel');
      expect(phases[0].nodes).toEqual(expect.arrayContaining(['a', 'b']));
    });

    it('returns 3 sequential phases for chain A→B→C', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['b'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      const phases = graph.getExecutionPhases();

      expect(phases).toHaveLength(3);
      expect(phases[0].nodes).toEqual(['a']);
      expect(phases[1].nodes).toEqual(['b']);
      expect(phases[2].nodes).toEqual(['c']);
      expect(phases.every((p) => p.mode === 'sequential')).toBe(true);
    });

    it('returns 3 phases with parallel phase 2 for diamond', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['a'] });
      const nodeD = createSkillNode({ id: 'd', name: 'D', dependsOn: ['b', 'c'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);
      graph.addNode(nodeD);

      const phases = graph.getExecutionPhases();

      expect(phases).toHaveLength(3);
      expect(phases[0].nodes).toEqual(['a']);
      expect(phases[1].mode).toBe('parallel');
      expect(phases[1].nodes).toEqual(expect.arrayContaining(['b', 'c']));
      expect(phases[2].nodes).toEqual(['d']);
    });
  });

  describe('getReadyNodes', () => {
    it('returns all nodes with no dependencies initially', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B' });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['a'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      const ready = graph.getReadyNodes();

      expect(ready).toEqual(expect.arrayContaining(['a', 'b']));
      expect(ready).not.toContain('c');
    });

    it('returns dependents as ready after dependencies complete', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      graph.updateStatus('a', NodeStatus.COMPLETED);
      const ready = graph.getReadyNodes();

      expect(ready).toContain('b');
    });

    it('does not return running nodes as ready', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A', status: NodeStatus.RUNNING });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      const ready = graph.getReadyNodes();

      expect(ready).not.toContain('b');
    });
  });

  describe('updateStatus', () => {
    it('updates node status and outputPath', () => {
      const graph = new DependencyGraph();
      const node = createSkillNode({ id: 'a', name: 'A' });
      graph.addNode(node);

      graph.updateStatus('a', NodeStatus.COMPLETED, '/path/to/output');

      const updated = graph.getNode('a');
      expect(updated?.status).toBe(NodeStatus.COMPLETED);
      expect(updated?.outputPath).toBe('/path/to/output');
    });
  });

  describe('failNode', () => {
    it('marks node as failed', () => {
      const graph = new DependencyGraph();
      const node = createSkillNode({ id: 'a', name: 'A' });
      graph.addNode(node);

      graph.failNode('a');

      const failed = graph.getNode('a');
      expect(failed?.status).toBe(NodeStatus.FAILED);
    });

    it('cascades skip to dependents', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      graph.failNode('a');

      const nodeAStatus = graph.getNode('a');
      const nodeBStatus = graph.getNode('b');

      expect(nodeAStatus?.status).toBe(NodeStatus.FAILED);
      expect(nodeBStatus?.status).toBe(NodeStatus.SKIPPED);
    });

    it('cascades skip through deep chain A→B→C→D', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });
      const nodeC = createSkillNode({ id: 'c', name: 'C', dependsOn: ['b'] });
      const nodeD = createSkillNode({ id: 'd', name: 'D', dependsOn: ['c'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);
      graph.addNode(nodeD);

      graph.failNode('a');

      expect(graph.getNode('a')?.status).toBe(NodeStatus.FAILED);
      expect(graph.getNode('b')?.status).toBe(NodeStatus.SKIPPED);
      expect(graph.getNode('c')?.status).toBe(NodeStatus.SKIPPED);
      expect(graph.getNode('d')?.status).toBe(NodeStatus.SKIPPED);
    });
  });

  describe('isComplete', () => {
    it('returns true when all nodes are terminal', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A', status: NodeStatus.COMPLETED });
      const nodeB = createSkillNode({ id: 'b', name: 'B', status: NodeStatus.FAILED });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      expect(graph.isComplete()).toBe(true);
    });

    it('returns false when pending nodes exist', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A', status: NodeStatus.COMPLETED });
      const nodeB = createSkillNode({ id: 'b', name: 'B', status: NodeStatus.PENDING });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      expect(graph.isComplete()).toBe(false);
    });
  });

  describe('getStats', () => {
    it('returns correct counts', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({
        id: 'a',
        name: 'A',
        status: NodeStatus.COMPLETED,
        skillType: SkillType.PRIMARY,
      });
      const nodeB = createSkillNode({
        id: 'b',
        name: 'B',
        status: NodeStatus.FAILED,
        skillType: SkillType.HELPER,
      });
      const nodeC = createSkillNode({
        id: 'c',
        name: 'C',
        status: NodeStatus.PENDING,
        skillType: SkillType.PRIMARY,
      });

      graph.addNode(nodeA);
      graph.addNode(nodeB);
      graph.addNode(nodeC);

      const stats = graph.getStats();

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.primary).toBe(2);
      expect(stats.helper).toBe(1);
    });
  });

  describe('toDict', () => {
    it('returns nodes and phases arrays', () => {
      const graph = new DependencyGraph();
      const nodeA = createSkillNode({ id: 'a', name: 'A' });
      const nodeB = createSkillNode({ id: 'b', name: 'B', dependsOn: ['a'] });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      const dict = graph.toDict();

      expect(dict.nodes).toHaveLength(2);
      expect(dict.phases).toHaveLength(2);
      expect(dict.nodes[0].id).toBe('a');
      expect(dict.nodes[1].id).toBe('b');
    });
  });
});

describe('buildGraphFromNodes', () => {
  it('creates graph from raw JSON with snake_case keys', () => {
    const nodesData = [
      {
        id: 'node1',
        name: 'Node 1',
        depends_on: [],
        purpose: 'Test node',
        type: 'primary',
      },
    ];

    const graph = buildGraphFromNodes(nodesData);

    expect(graph.getNode('node1')).toBeDefined();
    expect(graph.getNode('node1')?.name).toBe('Node 1');
  });

  it('accepts camelCase keys', () => {
    const nodesData = [
      {
        id: 'node1',
        name: 'Node 1',
        dependsOn: [],
        purpose: 'Test node',
        skillType: 'primary',
      },
    ];

    const graph = buildGraphFromNodes(nodesData);

    expect(graph.getNode('node1')).toBeDefined();
  });

  it('throws error when id is missing', () => {
    const nodesData = [
      {
        name: 'Node 1',
        depends_on: [],
        purpose: 'Test node',
      },
    ];

    expect(() => buildGraphFromNodes(nodesData)).toThrow('Node data must include id and name');
  });

  it('throws error when name is missing', () => {
    const nodesData = [
      {
        id: 'node1',
        depends_on: [],
        purpose: 'Test node',
      },
    ];

    expect(() => buildGraphFromNodes(nodesData)).toThrow('Node data must include id and name');
  });

  it('builds graph with multiple nodes and dependencies', () => {
    const nodesData = [
      {
        id: 'a',
        name: 'Node A',
        depends_on: [],
        purpose: 'First node',
      },
      {
        id: 'b',
        name: 'Node B',
        depends_on: ['a'],
        purpose: 'Second node',
      },
      {
        id: 'c',
        name: 'Node C',
        depends_on: ['a', 'b'],
        purpose: 'Third node',
      },
    ];

    const graph = buildGraphFromNodes(nodesData);

    expect(graph.getNode('a')).toBeDefined();
    expect(graph.getNode('b')).toBeDefined();
    expect(graph.getNode('c')).toBeDefined();
    expect(graph.getDependencies('b')).toContain('a');
    expect(graph.getDependencies('c')).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('handles optional fields with defaults', () => {
    const nodesData = [
      {
        id: 'node1',
        name: 'Node 1',
      },
    ];

    const graph = buildGraphFromNodes(nodesData);
    const node = graph.getNode('node1');

    expect(node?.dependsOn).toEqual([]);
    expect(node?.purpose).toBe('');
    expect(node?.status).toBe(NodeStatus.PENDING);
    expect(node?.skillType).toBe(SkillType.PRIMARY);
  });
});

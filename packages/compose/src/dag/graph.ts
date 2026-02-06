import { NodeStatus, SkillType, createSkillNode, isTerminal } from './types.js';
import type { ExecutionPhase, SkillNode } from './types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const asRecordOfString = (value: unknown): Record<string, string> => {
  if (!isRecord(value)) {
    return {};
  }

  const entries = Object.entries(value).filter(([, item]) => typeof item === 'string');
  return Object.fromEntries(entries) as Record<string, string>;
};

const resolveSkillType = (value: unknown): SkillType => {
  if (value === SkillType.HELPER || value === 'helper') {
    return SkillType.HELPER;
  }

  return SkillType.PRIMARY;
};

export class DependencyGraph {
  nodes: Map<string, SkillNode>;
  private _adjacency: Map<string, Set<string>>;
  private _reverseAdj: Map<string, Set<string>>;

  constructor() {
    this.nodes = new Map();
    this._adjacency = new Map();
    this._reverseAdj = new Map();
  }

  private ensureAdjacency(nodeId: string): Set<string> {
    const existing = this._adjacency.get(nodeId);
    if (existing) {
      return existing;
    }

    const created = new Set<string>();
    this._adjacency.set(nodeId, created);
    return created;
  }

  private ensureReverseAdj(nodeId: string): Set<string> {
    const existing = this._reverseAdj.get(nodeId);
    if (existing) {
      return existing;
    }

    const created = new Set<string>();
    this._reverseAdj.set(nodeId, created);
    return created;
  }

  private removeNodeEdges(nodeId: string): void {
    const dependencies = this._reverseAdj.get(nodeId);
    if (dependencies) {
      for (const dep of dependencies) {
        this._adjacency.get(dep)?.delete(nodeId);
      }
    }

    const dependents = this._adjacency.get(nodeId);
    if (dependents) {
      for (const dependent of dependents) {
        this._reverseAdj.get(dependent)?.delete(nodeId);
      }
    }

    this._adjacency.delete(nodeId);
    this._reverseAdj.delete(nodeId);
  }

  addNode(node: SkillNode): void {
    if (this.nodes.has(node.id)) {
      this.removeNodeEdges(node.id);
    }

    this.nodes.set(node.id, node);
    this.ensureAdjacency(node.id);
    const reverseAdj = this.ensureReverseAdj(node.id);

    for (const dependency of node.dependsOn) {
      this.ensureAdjacency(dependency).add(node.id);
      reverseAdj.add(dependency);
    }
  }

  removeNode(nodeId: string): boolean {
    if (!this.nodes.has(nodeId)) {
      return false;
    }

    this.nodes.delete(nodeId);
    this.removeNodeEdges(nodeId);
    return true;
  }

  getNode(nodeId: string): SkillNode | undefined {
    return this.nodes.get(nodeId);
  }

  detectCycle(): string[] | null {
    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;

    const colors = new Map<string, number>();
    for (const nodeId of this.nodes.keys()) {
      colors.set(nodeId, WHITE);
    }

    const stack: string[] = [];

    const dfs = (nodeId: string): string[] | null => {
      colors.set(nodeId, GRAY);
      stack.push(nodeId);

      for (const neighbor of this._adjacency.get(nodeId) ?? []) {
        const color = colors.get(neighbor) ?? WHITE;
        if (color === GRAY) {
          const index = stack.indexOf(neighbor);
          if (index >= 0) {
            return [...stack.slice(index), neighbor];
          }
          return [neighbor, nodeId];
        }

        if (color === WHITE) {
          const cycle = dfs(neighbor);
          if (cycle) {
            return cycle;
          }
        }
      }

      stack.pop();
      colors.set(nodeId, BLACK);
      return null;
    };

    for (const nodeId of this.nodes.keys()) {
      if ((colors.get(nodeId) ?? WHITE) === WHITE) {
        const cycle = dfs(nodeId);
        if (cycle) {
          return cycle;
        }
      }
    }

    return null;
  }

  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();

    for (const nodeId of this.nodes.keys()) {
      const dependencies = this._reverseAdj.get(nodeId);
      let count = 0;
      if (dependencies) {
        for (const dep of dependencies) {
          if (this.nodes.has(dep)) {
            count += 1;
          }
        }
      }
      inDegree.set(nodeId, count);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }
      sorted.push(current);
      for (const dependent of this._adjacency.get(current) ?? []) {
        if (!inDegree.has(dependent)) {
          continue;
        }
        const nextDegree = (inDegree.get(dependent) ?? 0) - 1;
        inDegree.set(dependent, nextDegree);
        if (nextDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    if (sorted.length !== this.nodes.size) {
      const cycle = this.detectCycle();
      if (cycle) {
        throw new Error(`Cycle detected in dependency graph: ${cycle.join(' -> ')}`);
      }
      throw new Error('Cycle detected in dependency graph');
    }

    return sorted;
  }

  getExecutionPhases(): ExecutionPhase[] {
    const order = this.topologicalSort();
    const levels = new Map<string, number>();

    for (const nodeId of order) {
      const dependencies = this._reverseAdj.get(nodeId);
      let level = 0;
      if (dependencies) {
        for (const dep of dependencies) {
          const depLevel = levels.get(dep);
          if (depLevel !== undefined) {
            level = Math.max(level, depLevel + 1);
          }
        }
      }
      levels.set(nodeId, level);
    }

    const grouped = new Map<number, string[]>();
    for (const [nodeId, level] of levels) {
      const nodes = grouped.get(level) ?? [];
      nodes.push(nodeId);
      grouped.set(level, nodes);
    }

    const sortedLevels = Array.from(grouped.keys()).sort((a, b) => a - b);
    return sortedLevels.map((level) => {
      const nodes = grouped.get(level) ?? [];
      return {
        phaseNumber: level + 1,
        nodes,
        mode: nodes.length > 1 ? 'parallel' : 'sequential',
      };
    });
  }

  getReadyNodes(): string[] {
    const ready: string[] = [];

    for (const node of this.nodes.values()) {
      if (node.status !== NodeStatus.PENDING) {
        continue;
      }

      const dependencies = this._reverseAdj.get(node.id) ?? new Set<string>();
      let allCompleted = true;
      for (const dependency of dependencies) {
        const depNode = this.nodes.get(dependency);
        if (!depNode || depNode.status !== NodeStatus.COMPLETED) {
          allCompleted = false;
          break;
        }
      }

      if (allCompleted) {
        ready.push(node.id);
      }
    }

    return ready;
  }

  updateStatus(nodeId: string, status: NodeStatus, outputPath?: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return;
    }

    this.nodes.set(nodeId, {
      ...node,
      status,
      outputPath: outputPath !== undefined ? outputPath : node.outputPath,
    });
  }

  failNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) {
      return;
    }

    this.updateStatus(nodeId, NodeStatus.FAILED);
    const queue = [...this.getDependents(nodeId)];
    const visited = new Set(queue);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }

      const node = this.nodes.get(current);
      if (node && !isTerminal(node)) {
        this.updateStatus(current, NodeStatus.SKIPPED);
      }

      for (const dependent of this.getDependents(current)) {
        if (!visited.has(dependent)) {
          visited.add(dependent);
          queue.push(dependent);
        }
      }
    }
  }

  getDependents(nodeId: string): string[] {
    return Array.from(this._adjacency.get(nodeId) ?? new Set<string>());
  }

  getDependencies(nodeId: string): string[] {
    return Array.from(this._reverseAdj.get(nodeId) ?? new Set<string>());
  }

  isComplete(): boolean {
    for (const node of this.nodes.values()) {
      if (!isTerminal(node)) {
        return false;
      }
    }

    return true;
  }

  getStats(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    skipped: number;
    primary: number;
    helper: number;
  } {
    const stats = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      primary: 0,
      helper: 0,
    };

    for (const node of this.nodes.values()) {
      stats.total += 1;
      switch (node.status) {
        case NodeStatus.PENDING:
          stats.pending += 1;
          break;
        case NodeStatus.RUNNING:
          stats.running += 1;
          break;
        case NodeStatus.COMPLETED:
          stats.completed += 1;
          break;
        case NodeStatus.FAILED:
          stats.failed += 1;
          break;
        case NodeStatus.SKIPPED:
          stats.skipped += 1;
          break;
      }

      if (node.skillType === SkillType.HELPER) {
        stats.helper += 1;
      } else {
        stats.primary += 1;
      }
    }

    return stats;
  }

  toDict(): { nodes: object[]; phases: object[] } {
    const nodes = Array.from(this.nodes.values()).map((node) => ({ ...node }));
    const phases = this.getExecutionPhases().map((phase) => ({ ...phase }));
    return { nodes, phases };
  }
}

export function buildGraphFromNodes(nodesData: Record<string, unknown>[]): DependencyGraph {
  const graph = new DependencyGraph();

  for (const nodeData of nodesData) {
    if (!isRecord(nodeData)) {
      continue;
    }

    const id = typeof nodeData.id === 'string' ? nodeData.id : '';
    const name = typeof nodeData.name === 'string' ? nodeData.name : '';

    if (!id || !name) {
      throw new Error('Node data must include id and name');
    }

    const dependsOn = asStringArray(nodeData.depends_on ?? nodeData.dependsOn);
    const purpose = typeof nodeData.purpose === 'string' ? nodeData.purpose : '';
    const outputsSummary =
      typeof nodeData.outputs_summary === 'string'
        ? nodeData.outputs_summary
        : typeof nodeData.outputsSummary === 'string'
          ? nodeData.outputsSummary
          : '';
    const downstreamHint =
      typeof nodeData.downstream_hint === 'string'
        ? nodeData.downstream_hint
        : typeof nodeData.downstreamHint === 'string'
          ? nodeData.downstreamHint
          : '';
    const usageHints = asRecordOfString(nodeData.usage_hints ?? nodeData.usageHints);
    const status =
      typeof nodeData.status === 'string' &&
      Object.values(NodeStatus).includes(nodeData.status as NodeStatus)
        ? (nodeData.status as NodeStatus)
        : NodeStatus.PENDING;
    const outputPath =
      typeof nodeData.output_path === 'string'
        ? nodeData.output_path
        : typeof nodeData.outputPath === 'string'
          ? nodeData.outputPath
          : null;
    const skillType = resolveSkillType(nodeData.type ?? nodeData.skill_type ?? nodeData.skillType);

    graph.addNode(
      createSkillNode({
        id,
        name,
        skillType,
        dependsOn,
        purpose,
        status,
        outputPath,
        outputsSummary,
        downstreamHint,
        usageHints,
      })
    );
  }

  return graph;
}

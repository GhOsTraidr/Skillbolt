import type { TreeNodeData, TreeSkill } from '../types.js';

export class TreeNode {
  id: string;
  name: string;
  description: string;
  depth: number;
  parentId: string | null;
  children: TreeNode[];
  skills: TreeSkill[];

  constructor(data: TreeNodeData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.depth = data.depth;
    this.parentId = data.parentId ?? null;
    this.children = (data.children ?? []).map((child) => TreeNode.fromData(child));
    this.skills = [...data.skills];
  }

  get isLeaf(): boolean {
    return this.children.length === 0;
  }

  get isIntermediate(): boolean {
    return this.children.length > 0;
  }

  countAllSkills(): number {
    return (
      this.skills.length + this.children.reduce((sum, child) => sum + child.countAllSkills(), 0)
    );
  }

  countAllNodes(): number {
    return (
      1 + this.children.reduce((sum, child) => sum + child.countAllNodes(), 0)
    );
  }

  getTreeDepth(): number {
    let maxDepth = this.depth;
    this.children.forEach(child => {
      const childDepth = child.getTreeDepth();
      if (childDepth > maxDepth) {
        maxDepth = childDepth;
      }
    });
    return maxDepth;
  }

  collectAllSkills(): TreeSkill[] {
    const collected: TreeSkill[] = [...this.skills];
    for (const child of this.children) {
      collected.push(...child.collectAllSkills());
    }
    return collected;
  }

  getLeafNodes(): TreeNode[] {
    if (this.isLeaf) {
      return [this];
    }

    const leaves: TreeNode[] = [];
    for (const child of this.children) {
      leaves.push(...child.getLeafNodes());
    }
    return leaves;
  }

  getTreeStats(): {
    totalSkills: number;
    totalNodes: number;
    maxDepth: number;
    avgBranchingFactor: number;
    leafNodes: number;
  } {
    const totalNodes = this.countAllNodes();
    const maxDepth = this.getTreeDepth();
    const totalSkills = this.countAllSkills();
    const leafNodes = this.getLeafNodes().length;

    let totalChildren = 0;
    let branchingNodes = 0;
    const stack: TreeNode[] = [this];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;

      if (current.children.length > 0) {
        branchingNodes += 1;
        totalChildren += current.children.length;
        stack.push(...current.children);
      }
    }

    const avgBranchingFactor = branchingNodes === 0 ? 0 : totalChildren / branchingNodes;

    return {
      totalSkills,
      totalNodes,
      maxDepth,
      avgBranchingFactor,
      leafNodes,
    };
  }

  findNode(path: string): TreeNode | null {
    const parts = path.split('/').filter((part) => part.length > 0);
    if (parts.length === 0) {
      return this;
    }

    let current: TreeNode | null = this;
    for (const part of parts) {
      if (!current) {
        return null;
      }

      const found: TreeNode | undefined = current.children.find((child) => child.id === part);
      if (!found) {
        return null;
      }
      current = found;
    }

    return current;
  }

  addChild(node: TreeNode): void {
    node.parentId = this.id;
    this.children.push(node);
  }

  addSkill(skill: TreeSkill): void {
    this.skills.push(skill);
  }

  toData(): TreeNodeData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      depth: this.depth,
      parentId: this.parentId,
      children: this.children.map((child) => child.toData()),
      skills: [...this.skills],
    };
  }

  static fromData(data: TreeNodeData): TreeNode {
    return new TreeNode(data);
  }
}

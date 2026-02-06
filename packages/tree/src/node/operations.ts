import type { TreeNode } from './index.js';

export function countTreeNodes(node: TreeNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countTreeNodes(child);
  }
  return count;
}

export function getTreeDepth(node: TreeNode): number {
  let maxDepth = node.depth;
  for (const child of node.children) {
    const childDepth = getTreeDepth(child);
    if (childDepth > maxDepth) {
      maxDepth = childDepth;
    }
  }
  return maxDepth;
}

export function getTreeStats(node: TreeNode): {
  totalSkills: number;
  totalNodes: number;
  maxDepth: number;
  avgBranchingFactor: number;
  leafNodes: number;
} {
  const totalNodes = node.countAllNodes();
  const maxDepth = node.getTreeDepth();
  const totalSkills = node.countAllSkills();
  const leafNodes = node.getLeafNodes().length;

  let totalChildren = 0;
  let branchingNodes = 0;
  const stack: TreeNode[] = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

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

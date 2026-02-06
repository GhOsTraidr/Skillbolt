import { TreeNode } from '../node/index.js';

export interface TreeAsciiOptions {
  maxDepth?: number;
  showSkillCount?: boolean;
}

export function renderTreeASCII(node: TreeNode, options: TreeAsciiOptions = {}): string {
  const maxDepth = options.maxDepth ?? Number.POSITIVE_INFINITY;
  const showSkillCount = options.showSkillCount ?? true;
  const lines: string[] = [];

  const formatLabel = (current: TreeNode): string => {
    if (!showSkillCount) {
      return current.name;
    }

    const count = current.countAllSkills();
    return `${current.name} (${count} skills)`;
  };

  const renderNode = (current: TreeNode, prefix: string, isLast: boolean, depth: number) => {
    const connector = depth === 0 ? '' : isLast ? '└── ' : '├── ';
    lines.push(`${prefix}${connector}${formatLabel(current)}`);

    if (depth >= maxDepth) {
      return;
    }

    const nextPrefix = depth === 0 ? '' : `${prefix}${isLast ? '    ' : '│   '}`;

    if (current.children.length > 0) {
      current.children.forEach((child, index) => {
        const childIsLast = index === current.children.length - 1;
        renderNode(child, nextPrefix, childIsLast, depth + 1);
      });
      return;
    }

    if (current.skills.length > 0) {
      current.skills.forEach((skill, index) => {
        const skillIsLast = index === current.skills.length - 1;
        const skillConnector = skillIsLast ? '└── ' : '├── ';
        lines.push(`${nextPrefix}${skillConnector}${skill.name}`);
      });
    }
  };

  renderNode(node, '', true, 0);

  return lines.join('\n');
}

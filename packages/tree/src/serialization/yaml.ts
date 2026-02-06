import yaml from 'yaml';
import fs from 'node:fs/promises';
import path from 'node:path';

import { TreeNode } from '../node/index.js';

export async function saveTreeToYAML(node: TreeNode, filePath: string): Promise<void> {
  const data = node.toData();
  const serialized = yaml.stringify(data);
  const directory = path.dirname(filePath);

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, serialized, 'utf8');
}

export async function loadTreeFromYAML(filePath: string): Promise<TreeNode> {
  const content = await fs.readFile(filePath, 'utf8');
  const data = yaml.parse(content);

  return TreeNode.fromData(data);
}

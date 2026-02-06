import fs from 'node:fs/promises';
import path from 'node:path';

import { TreeNode } from '../node/index.js';

export async function saveTreeToJSON(node: TreeNode, filePath: string): Promise<void> {
  const data = node.toData();
  const serialized = JSON.stringify(data, null, 2);
  const directory = path.dirname(filePath);

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, serialized, 'utf8');
}

export async function loadTreeFromJSON(filePath: string): Promise<TreeNode> {
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content);

  return TreeNode.fromData(data);
}

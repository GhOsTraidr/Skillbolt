import path from 'node:path';

import { TreeNode } from './node/index.js';
import { loadTreeFromJSON } from './serialization/json.js';
import { loadTreeFromYAML } from './serialization/yaml.js';

export * from './types.js';
export { createTreeConfig, DEFAULT_TREE_CONFIG } from './config.js';
export { TreeNode } from './node/index.js';
export { countTreeNodes, getTreeDepth, getTreeStats } from './node/operations.js';
export { TreeBuilder } from './builder/index.js';
export { scanSkillDirectory } from './builder/scanner.js';
export { saveTreeToYAML, loadTreeFromYAML } from './serialization/yaml.js';
export { saveTreeToJSON, loadTreeFromJSON } from './serialization/json.js';
export { renderTreeASCII } from './serialization/ascii.js';
export { saveTreeToHTML } from './serialization/html.js';

export async function loadTree(filePath: string): Promise<TreeNode> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.yaml' || ext === '.yml') {
    return loadTreeFromYAML(filePath);
  }
  if (ext === '.json') {
    return loadTreeFromJSON(filePath);
  }

  const printable = ext || 'unknown';
  throw new Error(`Unsupported tree format: ${printable}`);
}

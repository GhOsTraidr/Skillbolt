import { afterEach, describe, it, expect } from 'vitest';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { TreeNode } from '../src/node/index.js';
import { saveTreeToYAML, loadTreeFromYAML } from '../src/serialization/yaml.js';
import { saveTreeToJSON, loadTreeFromJSON } from '../src/serialization/json.js';
import { renderTreeASCII } from '../src/serialization/ascii.js';
import type { TreeNodeData, TreeSkill } from '../src/types.js';

const createSkill = (id: string, name = `Skill ${id}`): TreeSkill => ({
  id,
  name,
  description: `${name} description`,
  path: '',
  skillPath: `/skills/${id}/SKILL.md`,
  content: `${name} content`,
});

const createTreeData = (): TreeNodeData => ({
  id: 'root',
  name: 'Root',
  description: 'Root description',
  depth: 0,
  parentId: null,
  skills: [createSkill('s1')],
  children: [
    {
      id: 'child-a',
      name: 'Child A',
      description: 'Child A description',
      depth: 1,
      parentId: 'root',
      skills: [createSkill('s2')],
      children: [],
    },
    {
      id: 'child-b',
      name: 'Child B',
      description: 'Child B description',
      depth: 1,
      parentId: 'root',
      skills: [],
      children: [],
    },
  ],
});

const tempPaths: string[] = [];

const createTempPath = (fileName: string): string => {
  const dir = path.join(
    os.tmpdir(),
    `skill-kit-tree-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const filePath = path.join(dir, fileName);
  tempPaths.push(dir);
  return filePath;
};

afterEach(async () => {
  await Promise.all(tempPaths.map((dir) => fs.rm(dir, { recursive: true, force: true })));
  tempPaths.length = 0;
});

describe('YAML serialization', () => {
  it('round-trips tree data through YAML', async () => {
    const tree = new TreeNode(createTreeData());
    const filePath = createTempPath('tree.yaml');

    await saveTreeToYAML(tree, filePath);
    const loaded = await loadTreeFromYAML(filePath);

    expect(loaded.toData()).toEqual(tree.toData());
  });
});

describe('JSON serialization', () => {
  it('round-trips tree data through JSON', async () => {
    const tree = new TreeNode(createTreeData());
    const filePath = createTempPath('tree.json');

    await saveTreeToJSON(tree, filePath);
    const loaded = await loadTreeFromJSON(filePath);

    expect(loaded.toData()).toEqual(tree.toData());
  });
});

describe('ASCII serialization', () => {
  it('renders expected node names and connectors', () => {
    const tree = new TreeNode(createTreeData());
    const output = renderTreeASCII(tree);

    expect(output).toContain('Root');
    expect(output).toContain('Child A');
    expect(output).toContain('Child B');
    expect(output).toContain('Skill s2');
    expect(output).toContain('├──');
    expect(output).toContain('└──');
  });
});

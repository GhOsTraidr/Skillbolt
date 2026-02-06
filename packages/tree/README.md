# @skillbolt/tree

Capability tree builder for Skillbolt. Organizes skills into a hierarchical tree structure using LLM-powered classification.

## Features

- **LLM-powered categorization** — Automatically assigns skills to categories using LLM
- **Configurable branching factor** — Control tree width and depth
- **Parallel BFS building** — Queue-based breadth-first construction with `p-limit` concurrency
- **Multiple output formats** — YAML, JSON, ASCII, HTML serialization
- **Fixed root categories** — Predefined top-level categories for consistency

## Quick Start

```typescript
import { TreeBuilder, createTreeConfig, loadTree } from '@skillbolt/tree';
import { createLLMAdapter } from '@skillbolt/core';

const llm = createLLMAdapter({ model: 'gpt-4o-mini' });
const config = createTreeConfig({ branchingFactor: 8, maxDepth: 6 });
const builder = new TreeBuilder({ llm, config });

const result = await builder.build({
  skillDir: '.claude/skills',
  onProgress: (p) => console.log(p.message),
});

// Load a previously built tree
const tree = await loadTree('tree.yaml');
console.log(tree.countAllSkills());
```

## CLI

```bash
skill tree build --dir .claude/skills --verbose
skill tree show --format ascii
skill tree stats
```

## API

| Export             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `TreeBuilder`      | Main builder class (queue-based BFS with LLM)      |
| `TreeNode`         | Tree node with children, skills, traversal methods |
| `createTreeConfig` | Create config with derived properties              |
| `loadTree`         | Load tree from YAML file                           |
| `renderTreeASCII`  | ASCII visualization                                |
| `saveTreeToJSON`   | JSON serialization                                 |
| `saveTreeToHTML`   | HTML visualization                                 |
| `getTreeStats`     | Node count, skill count, depth                     |

## Configuration

| Option            | Default  | Description              |
| ----------------- | -------- | ------------------------ |
| `branchingFactor` | 8        | Max children per node    |
| `maxDepth`        | 6        | Maximum tree depth       |
| `maxWorkers`      | 4        | Concurrent LLM calls     |
| `rootCategories`  | Built-in | Top-level category names |

## License

MIT

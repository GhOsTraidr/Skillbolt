# @skillbolt/search

Intelligent skill search for Skillbolt. Finds task-relevant skills using LLM-guided multi-level tree traversal.

## Features

- **Multi-level tree descent** — Navigates capability tree with LLM selection at each level
- **Parallel branch search** — Explores multiple branches concurrently
- **Skill pruning** — Deduplication and workflow-stage ranking
- **Early stop optimization** — Stops when enough relevant skills are found
- **Event system** — Real-time progress callbacks

## Quick Start

```typescript
import { Searcher, createSearchConfig } from '@skillbolt/search';
import { loadTree } from '@skillbolt/tree';
import { createLLMAdapter } from '@skillbolt/core';

const llm = createLLMAdapter();
const tree = await loadTree('tree.yaml');
const config = createSearchConfig({ maxSkills: 10 });
const searcher = new Searcher({ llm, tree, config });

const result = await searcher.search('create a landing page');
for (const skill of result.selectedSkills) {
  console.log(`${skill.name}: ${skill.description}`);
}
console.log(`LLM calls: ${result.llmCalls}`);
```

## CLI

```bash
skill skill-search "create a promotional video for my research paper"
skill skill-search "fix login bug" --max-skills 5 --json
```

## API

| Export               | Description                                   |
| -------------------- | --------------------------------------------- |
| `Searcher`           | Main search class with recursive tree descent |
| `createSearchConfig` | Create search configuration                   |
| `SearchResult`       | Query results with selected skills and stats  |
| `SearchEvent`        | Progress event types for real-time tracking   |
| `createEventEmitter` | Simple callback-based event system            |

## Configuration

| Option         | Default | Description                |
| -------------- | ------- | -------------------------- |
| `maxParallel`  | 4       | Concurrent branch searches |
| `pruneEnabled` | true    | Enable dedup and ranking   |
| `temperature`  | 0.3     | LLM sampling temperature   |
| `maxSkills`    | 10      | Maximum skills to return   |

## License

MIT

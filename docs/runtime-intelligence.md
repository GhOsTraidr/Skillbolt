# Runtime Intelligence

Skillbolt goes beyond skill authoring — it adds an intelligent runtime layer that discovers, plans, and executes skills automatically. This guide covers the four core runtime components.

## Table of Contents

- [Capability Tree](#capability-tree)
- [Intelligent Search](#intelligent-search)
- [DAG Orchestration & Execution](#dag-orchestration--execution)
- [Visual Dashboard](#visual-dashboard)
- [Configuration Reference](#configuration-reference)

## Capability Tree

The Capability Tree organizes hundreds of skills into a navigable hierarchy using LLM-powered classification. Instead of flat lists, skills are grouped into semantic categories that make discovery intuitive.

### How It Works

1. **Scan** — Collects all installed skills and their metadata
2. **Classify** — Uses an LLM to assign each skill to semantic categories
3. **Build** — Constructs a tree with configurable branching factor and depth
4. **Persist** — Caches the tree for fast subsequent lookups

### Commands

```bash
# Build or rebuild the capability tree
skill tree build --verbose

# Display the tree structure
skill tree show --format ascii
```

### Example Output

```
root
├── Development
│   ├── Code Quality
│   │   ├── git-commit-helper
│   │   ├── code-review
│   │   └── lint-fixer
│   ├── Testing
│   │   ├── unit-test-writer
│   │   └── e2e-scaffold
│   └── Documentation
│       ├── readme-generator
│       └── api-doc-writer
├── DevOps
│   ├── deploy-to-aws
│   ├── docker-compose
│   └── ci-pipeline
└── Data & AI
    ├── data-pipeline
    └── model-training
```

### Configuration

In `.skillboltrc.json`:

```json
{
  "tree": {
    "branchingFactor": 8,
    "maxDepth": 6,
    "maxWorkers": 4
  }
}
```

| Option            | Type   | Default | Description                              |
| ----------------- | ------ | ------- | ---------------------------------------- |
| `branchingFactor` | number | `8`     | Maximum children per node                |
| `maxDepth`        | number | `6`     | Maximum tree depth                       |
| `maxWorkers`      | number | `4`     | Parallel LLM calls during classification |

## Intelligent Search

Intelligent Search finds the right skills for any task via multi-level tree traversal with automatic pruning and LLM-powered ranking.

### How It Works

1. **Query** — Parse natural language task description
2. **Traverse** — Walk the capability tree top-down
3. **Prune** — Discard irrelevant branches early using LLM relevance scoring
4. **Rank** — Score remaining skills by match quality
5. **Return** — Deliver the top-N most relevant skills

### Commands

```bash
# Search for skills matching a task
skill skill-search "create a promotional video for my research paper"

# Search with limit
skill skill-search "deploy to AWS" --max-results 5
```

### Example Output

```
Searching capability tree...

  Traversing: root → DevOps → Deployment  ✓
  Traversing: root → Data & AI            ✗ (pruned)
  Traversing: root → Development          ✗ (pruned)

Results (2 skills found):

  1. deploy-to-aws        score: 0.94  "Deploy applications to AWS"
  2. ci-pipeline           score: 0.71  "Set up CI/CD pipelines"
```

### Configuration

In `.skillboltrc.json`:

```json
{
  "search": {
    "maxParallel": 4,
    "pruneEnabled": true,
    "maxSkills": 10
  }
}
```

| Option         | Type    | Default | Description                         |
| -------------- | ------- | ------- | ----------------------------------- |
| `maxParallel`  | number  | `4`     | Parallel LLM calls during traversal |
| `pruneEnabled` | boolean | `true`  | Enable early branch pruning         |
| `maxSkills`    | number  | `10`    | Maximum skills to return            |

## DAG Orchestration & Execution

DAG (Directed Acyclic Graph) orchestration auto-generates parallel execution plans from natural language task descriptions, then runs them as multi-phase workflows.

### How It Works

1. **Plan** — LLM decomposes the task into sub-steps and maps each to a skill
2. **Graph** — Build a dependency graph between steps
3. **Schedule** — Group independent steps into parallel phases
4. **Execute** — Run each phase concurrently with configurable limits
5. **Track** — Record execution time, token usage, and cost per step

### Commands

```bash
# Run a task with DAG orchestration
skill run "create a promotional video for my research paper" \
  --skills video-editor,social-media-poster \
  --mode dag

# Dry-run to preview the execution plan
skill run "deploy and test my app" \
  --skills deploy-to-aws,e2e-scaffold \
  --mode dag --dry-run
```

### Example Execution Plan

```
DAG Plan: "create a promotional video"

  Phase 1 (parallel):
    ├── [video-editor]         Extract key findings from paper
    └── [social-media-poster]  Generate promotional copy

  Phase 2 (sequential):
    └── [video-editor]         Compose video with copy overlay

  Estimated cost: ~$0.12 (3 LLM calls)
```

### Configuration

In `.skillboltrc.json`:

```json
{
  "execute": {
    "maxConcurrent": 6,
    "nodeTimeout": 600,
    "runsDir": "runs"
  }
}
```

| Option          | Type   | Default  | Description                            |
| --------------- | ------ | -------- | -------------------------------------- |
| `maxConcurrent` | number | `6`      | Maximum parallel skill executions      |
| `nodeTimeout`   | number | `600`    | Per-node timeout in seconds            |
| `runsDir`       | string | `"runs"` | Directory for execution logs and state |

## Visual Dashboard

The Visual Dashboard provides a real-time web interface for managing and monitoring skill workflows.

### Features

- **Task Input** — Submit tasks directly from the browser
- **DAG Viewer** — Interactive graph showing execution plan and progress
- **Log Stream** — Real-time output from each skill execution
- **Run History** — Browse past executions with cost and timing data

### Commands

```bash
# Launch the dashboard
skill gui

# Launch on a custom port
skill gui --port 9000
```

The dashboard opens automatically at `http://localhost:8765`.

### Configuration

In `.skillboltrc.json`:

```json
{
  "gui": {
    "port": 8765,
    "openBrowser": true
  }
}
```

| Option        | Type    | Default | Description                      |
| ------------- | ------- | ------- | -------------------------------- |
| `port`        | number  | `8765`  | HTTP port for the dashboard      |
| `openBrowser` | boolean | `true`  | Auto-open browser on `skill gui` |

## Configuration Reference

All runtime intelligence settings live under their respective keys in `.skillboltrc.json`:

```json
{
  "tree": {
    "branchingFactor": 8,
    "maxDepth": 6,
    "maxWorkers": 4
  },
  "search": {
    "maxParallel": 4,
    "pruneEnabled": true,
    "maxSkills": 10
  },
  "execute": {
    "maxConcurrent": 6,
    "nodeTimeout": 600,
    "runsDir": "runs"
  },
  "gui": {
    "port": 8765,
    "openBrowser": true
  }
}
```

See [Configuration Guide](./configuration.md) for the full configuration reference.

## See Also

- [Getting Started](./getting-started.md) — Installation and first steps
- [Command Reference](./commands.md) — Complete CLI documentation
- [Configuration Guide](./configuration.md) — All configuration options

# @skillbolt/execute

Execution engine for Skillbolt. Runs tasks via AI agent SDKs with isolated sessions, DAG orchestration, and log streaming.

## Features

- **RunContext** — Isolated run directories with skill copying, file staging, meta/result tracking
- **SkillOrchestrator** — Phase-based parallel execution with plan generation and visualization
- **AgentClient abstraction** — Pluggable agent backends (Mock, Claude, custom)
- **Prompt builders** — Isolated and direct executor prompt generation
- **Summary extraction** — Parse `<execution_summary>` tags from agent responses
- **Run management** — List, get, and clean up old runs

## Quick Start

```typescript
import { SkillOrchestrator, RunContext, MockAgentClient } from '@skillbolt/execute';

const runContext = RunContext.create('fix the login bug', { mode: 'dag' });

const orchestrator = new SkillOrchestrator({
  maxConcurrent: 6,
  nodeTimeout: 600,
  runContext,
});

const result = await orchestrator.runWithVisualizer({
  task: 'fix the login bug',
  skillNames: ['debugger', 'test-writer'],
  visualizer, // implements VisualizerProtocol
});

console.log(result.status); // 'completed' | 'partial' | 'failed'
```

## CLI

```bash
skill run "fix the login bug" --skills debugger,test-writer --mode dag
skill run "migrate database" --plan-only
skill run "generate report" --mode freestyle
```

## Execution Modes

| Mode        | Description                                        |
| ----------- | -------------------------------------------------- |
| `dag`       | Auto-generate DAG plan, execute in parallel phases |
| `freestyle` | Agent chooses which skills to use                  |
| `direct`    | Single skill execution                             |
| `baseline`  | No skills, agent works directly                    |

## API

| Export                        | Description                              |
| ----------------------------- | ---------------------------------------- |
| `SkillOrchestrator`           | Main orchestrator with plan→execute flow |
| `RunContext`                  | Isolated run directory management        |
| `RunManager`                  | List, get, cleanup runs                  |
| `MockAgentClient`             | Testing client with canned responses     |
| `ClaudeAgentClient`           | Claude Agent SDK client (stub)           |
| `buildIsolatedExecutorPrompt` | Build prompt for skill execution         |
| `buildDirectExecutorPrompt`   | Build prompt for direct execution        |
| `extractExecutionSummary`     | Parse execution results                  |

## License

MIT

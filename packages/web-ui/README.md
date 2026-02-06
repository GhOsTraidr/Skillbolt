# @skillbolt/web-ui

Web GUI for Skillbolt. Visual interface for skill discovery, plan review, and execution monitoring.

## Features

- **Dark-themed UI** — Clean, modern design with CSS custom properties
- **WebSocket real-time updates** — Live state sync between server and client
- **DAG visualization** — SVG-based node graph with status colors and animations
- **Log viewer** — Auto-scrolling, level-colored log panel
- **State machine** — `idle → searching → reviewing → planning → executing → complete`
- **No framework** — Vanilla HTML/CSS/JS frontend, zero build step

## Quick Start

```bash
# Via CLI
skill gui

# With options
skill gui --port 8765 --task "fix the login bug" --skills debugger
```

```typescript
// Programmatic usage
import { startServer } from '@skillbolt/web-ui';

await startServer({
  port: 8765,
  openBrowser: true,
  task: 'fix the login bug',
  presetSkills: ['debugger', 'test-writer'],
});
```

## Architecture

- **Server**: Node.js `http` module + `ws` WebSocket
- **Frontend**: Vanilla HTML/CSS/JS served as static files
- **State**: Immutable state updates broadcast via WebSocket
- **Visualizer**: Bridges `SkillOrchestrator` events to WebSocket messages

## API

| Export               | Description                                     |
| -------------------- | ----------------------------------------------- |
| `startServer`        | Launch HTTP + WebSocket server                  |
| `UnifiedService`     | Coordinates state, search, and orchestration    |
| `WebVisualizer`      | Implements `VisualizerProtocol` for web display |
| `createInitialState` | Create default UI state                         |
| `updatePhase`        | State machine transition                        |
| `addLog`             | Append log entry to state                       |

## Components

| File                              | Description                         |
| --------------------------------- | ----------------------------------- |
| `public/index.html`               | Single-page app shell               |
| `public/style.css`                | Dark theme styles                   |
| `public/app.js`                   | WebSocket client + state management |
| `public/components/task-input.js` | Task input with textarea            |
| `public/components/dag-viewer.js` | SVG DAG visualization               |
| `public/components/log-viewer.js` | Auto-scrolling log panel            |

## License

MIT

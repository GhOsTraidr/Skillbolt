# OpenClaw Integration Guide

Skillbolt provides first-class integration with [OpenClaw](https://github.com/openclaw/openclaw), the popular self-hosted AI assistant platform with 180K+ GitHub stars. This guide covers everything you need to connect your Skillbolt skills to OpenClaw's 13+ messaging channels.

## Overview

The `@skillbolt/openclaw` package enables:

- **Skill Sync** — Push/pull skills between Skillbolt and OpenClaw workspace
- **Gateway Communication** — Connect to OpenClaw's gateway via WebSocket JSON-RPC
- **Agent Execution** — Execute skills through OpenClaw's agent runtime
- **Channel Visualization** — Send progress updates to messaging channels (WhatsApp, Telegram, Discord, etc.)
- **Analytics** — Track execution metrics and costs

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Skillbolt CLI                       │
│              skill openclaw <command>                 │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │   @skillbolt/openclaw   │
          │                         │
          │  ┌───────┐ ┌────────┐  │
          │  │detect │ │ config │  │
          │  └───────┘ └────────┘  │
          │  ┌───────────────────┐ │
          │  │   gateway-client  │ │
          │  │   (WebSocket RPC) │ │
          │  └─────────┬─────────┘ │
          │  ┌─────────┴─────────┐ │
          │  │   agent-client    │ │
          │  └───────────────────┘ │
          │  ┌────────┐ ┌───────┐ │
          │  │  push  │ │ pull  │ │
          │  └────────┘ └───────┘ │
          │  ┌───────────────────┐ │
          │  │channel-visualizer │ │
          │  └───────────────────┘ │
          │  ┌───────────────────┐ │
          │  │    analytics      │ │
          │  └───────────────────┘ │
          └────────────┬───────────┘
                       │ WebSocket
          ┌────────────┴────────────┐
          │    OpenClaw Gateway      │
          │    (localhost:18789)     │
          └────────────┬────────────┘
                       │
     ┌─────────┬───────┴───────┬──────────┐
     │         │               │          │
  WhatsApp  Telegram      Discord     Signal  ...
```

## Prerequisites

1. **OpenClaw installed** — `npm install -g openclaw` or via the [installer](https://openclaw.ai)
2. **Gateway running** — `openclaw gateway run` (default port: 18789)
3. **Skillbolt installed** — `npm install -g @skillbolt/cli`

Verify your setup:

```bash
# Check OpenClaw is available
skill openclaw status
```

## CLI Commands

### `skill openclaw status`

Check OpenClaw installation and gateway connectivity.

```bash
skill openclaw status
```

Output includes:
- OpenClaw CLI version and path
- Gateway connection status
- Connected channels
- Skills directory location

### `skill openclaw push`

Push skills from your Skillbolt workspace to OpenClaw.

```bash
# Push all skills
skill openclaw push --all

# Push specific skills
skill openclaw push ./skills/git-helper ./skills/code-review

# Dry run (preview without writing)
skill openclaw push --all --dry-run

# Skip format conversion
skill openclaw push --all --no-convert

# Overwrite existing skills
skill openclaw push --all --overwrite
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--all` | Push all skills in the workspace |
| `--dry-run` | Preview changes without writing files |
| `--no-convert` | Skip SKILL.md to OpenClaw format conversion |
| `--overwrite` | Overwrite existing skills in OpenClaw workspace |

### `skill openclaw pull`

Pull skills from OpenClaw workspace into Skillbolt.

```bash
# Pull all skills
skill openclaw pull --all

# Dry run
skill openclaw pull --all --dry-run

# Overwrite existing local skills
skill openclaw pull --all --overwrite
```

**Flags:** Same as `push`.

## Programmatic API

### Detection

```typescript
import { detectOpenClaw, isOpenClawAvailable, getOpenClawSkillsDir } from '@skillbolt/openclaw';

// Full environment detection
const env = await detectOpenClaw();
// env.available: boolean
// env.version: string | undefined
// env.cliPath: string | undefined
// env.gatewayRunning: boolean
// env.skillsDir: string | undefined
// env.configPath: string | undefined

// Quick check
const available = await isOpenClawAvailable();

// Get skills directory
const skillsDir = await getOpenClawSkillsDir();
```

### Configuration

```typescript
import { resolveOpenClawConfig, DEFAULT_OPENCLAW_CONFIG } from '@skillbolt/openclaw';

const config = resolveOpenClawConfig({
  gatewayUrl: 'ws://localhost:18789',
  autoSync: true,
  channels: ['telegram', 'discord'],
});
```

### Gateway Client

```typescript
import { OpenClawGatewayClient } from '@skillbolt/openclaw';

const client = new OpenClawGatewayClient({
  url: 'ws://localhost:18789',
  timeout: 30000,
  reconnect: true,
  maxReconnectAttempts: 5,
});

await client.connect();

// Get gateway status
const status = await client.getStatus();

// List connected channels
const channels = await client.getChannels();

// Send RPC request
const result = await client.request('agent.execute', { skill: 'my-skill', input: '...' });

client.disconnect();
```

### Agent Client

```typescript
import { OpenClawAgentClient } from '@skillbolt/openclaw';

const agent = new OpenClawAgentClient({
  gatewayUrl: 'ws://localhost:18789',
});

const result = await agent.execute({
  skill: 'git-commit-helper',
  input: 'commit my changes with a good message',
});

console.log(result.output);
console.log(result.tokensUsed);
console.log(result.cost);
```

### Skill Sync

```typescript
import { pushSkills, pullSkills } from '@skillbolt/openclaw';

// Push
const pushResult = await pushSkills({
  all: true,
  overwrite: true,
  dryRun: false,
  convert: true,
});
console.log(`Pushed ${pushResult.pushed} skills, skipped ${pushResult.skipped}`);

// Pull
const pullResult = await pullSkills({
  all: true,
  overwrite: false,
});
console.log(`Pulled ${pullResult.pulled} skills`);
```

### Channel Visualizer

Send execution progress to messaging channels:

```typescript
import { ChannelVisualizer } from '@skillbolt/openclaw';

const visualizer = new ChannelVisualizer({
  gatewayUrl: 'ws://localhost:18789',
  channel: 'telegram',
  chatId: '123456',
  throttleMs: 1000, // Throttle updates to 1/sec
});

await visualizer.sendProgress({ phase: 'planning', message: 'Analyzing task...' });
await visualizer.sendProgress({ phase: 'executing', message: 'Running skill...', percent: 50 });
await visualizer.sendComplete({ output: 'Done!', tokensUsed: 1500 });
```

### Analytics

```typescript
import { toExecutionMetrics } from '@skillbolt/openclaw';
import type { OpenClawExecutionEvent } from '@skillbolt/openclaw';

const events: OpenClawExecutionEvent[] = [
  { type: 'start', skill: 'git-helper', timestamp: Date.now() },
  { type: 'complete', skill: 'git-helper', timestamp: Date.now() + 5000, tokens: 1200, cost: 0.003 },
];

const metrics = toExecutionMetrics(events);
// metrics.totalDuration, metrics.totalTokens, metrics.totalCost, metrics.status
```

## Configuration Reference

Add to your `.skillboltrc.json`:

```json
{
  "openclaw": {
    "gatewayUrl": "ws://localhost:18789",
    "autoSync": true,
    "channels": ["telegram", "discord", "whatsapp", "slack", "signal"],
    "skillsDir": "~/.openclaw/skills",
    "timeout": 30000,
    "reconnect": true,
    "maxReconnectAttempts": 5
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `gatewayUrl` | string | `ws://localhost:18789` | WebSocket URL for the OpenClaw gateway |
| `autoSync` | boolean | `false` | Automatically sync skills on changes |
| `channels` | string[] | `[]` | Channels to send visualizer updates to |
| `skillsDir` | string | auto-detected | Path to OpenClaw skills directory |
| `timeout` | number | `30000` | RPC request timeout in milliseconds |
| `reconnect` | boolean | `true` | Auto-reconnect on connection loss |
| `maxReconnectAttempts` | number | `5` | Max reconnection attempts |

## Troubleshooting

### "OpenClaw not found"

Ensure OpenClaw is installed and on your PATH:

```bash
which openclaw
openclaw --version
```

If not installed: `npm install -g openclaw`

### "Gateway not running"

Start the gateway:

```bash
openclaw gateway run --port 18789
```

Or via the OpenClaw Mac app (menubar).

### "Connection refused"

Check the gateway port:

```bash
ss -ltnp | grep 18789
# or on macOS:
lsof -i :18789
```

Ensure `gatewayUrl` in your config matches the actual port.

### "Skills not syncing"

1. Verify the skills directory: `skill openclaw status`
2. Check file permissions on the OpenClaw skills directory
3. Try with `--overwrite` flag: `skill openclaw push --all --overwrite`

### "Channel visualizer not sending"

1. Confirm the channel is connected: `openclaw channels status --probe`
2. Check the channel name matches exactly (e.g., `telegram` not `Telegram`)
3. Verify the chat ID is correct for the target conversation

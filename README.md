<div align="center">

<img src="./figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## A universal skill ecosystem for AI agents.

<small>Build once. Reuse everywhere. Run skills across Claude Code, Cursor, OpenClaw, and more.</small>

</div>

<p><b>🎨 Works with any AI agent that supports skill/instruction files</b></p>

<table>
<tr>

<td align="center" width="100">
  <a href="https://docs.anthropic.com/en/docs/claude-code">
    <img src="https://cdn.simpleicons.org/claude/D97757" width="48" height="48" alt="Claude Code" />
  </a><br/>
  <sub>
    <a href="https://docs.anthropic.com/en/docs/claude-code"><b>Claude Code</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://cursor.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/cursor/FFFFFF">
      <img src="https://cdn.simpleicons.org/cursor/000000" width="48" height="48" alt="Cursor" />
    </picture>
  </a><br/>
  <sub>
    <a href="https://cursor.com"><b>Cursor</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://github.com/openai/codex">
    <img src="https://github.com/openai.png?size=200" width="48" height="48" alt="Codex CLI" />
  </a><br/>
  <sub>
    <a href="https://github.com/openai/codex"><b>Codex CLI</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://continue.dev">
    <img src="https://github.com/continuedev.png?size=200" width="48" height="48" alt="Continue" />
  </a><br/>
  <sub>
    <a href="https://continue.dev"><b>Continue</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://openclaw.ai">
    <img src="https://github.com/openclaw.png?size=200" width="48" height="48" alt="OpenClaw" />
  </a><br/>
  <sub>
    <a href="https://openclaw.ai"><b>OpenClaw</b></a>
  </sub>
</td>

<td align="center" width="100">
  <sub><b>+ Custom<br/>Agents</b></sub>
</td>

</tr>
</table>

<div align="center">

<br/>

[🇨🇳 中文](./README.zh-CN.md) •
[🇯🇵 日本語](./docs/i18n/README.ja.md) •
[🇰🇷 한국어](./docs/i18n/README.ko.md) •
[🇪🇸 Español](./docs/i18n/README.es.md) •
[🇫🇷 Français](./docs/i18n/README.fr.md) •
[🇩🇪 Deutsch](./docs/i18n/README.de.md) •
[🇧🇷 Português](./docs/i18n/README.pt-br.md)<br/>
[🇷🇺 Русский](./docs/i18n/README.ru.md) •
[🇸🇦 العربية](./docs/i18n/README.ar.md) •
[🇮🇹 Italiano](./docs/i18n/README.it.md) •
[🇻🇳 Tiếng Việt](./docs/i18n/README.vi.md) •
[🇹🇷 Türkçe](./docs/i18n/README.tr.md)

<br/>

<p align="center">
  <a href="https://www.npmjs.com/package/@skillbolt/cli"><img src="https://img.shields.io/npm/v/@skillbolt/cli?style=flat-square&logo=npm&logoColor=white&color=CB3837" alt="npm"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Join%20Chat-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Follow-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Group-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 Scan to join WeChat Group</summary>
<br/>
<img src="./assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) 

</div>

</div>

<br/>

## 📖 What is a Skill?

A **Skill** is a portable instruction file for AI agents. It defines triggers, workflows, and parameters:

```markdown
---
name: git-commit-helper
description: Activate when user asks to "commit changes" or "create a commit"
triggers:
  - commit changes
  - create commit
---

## Workflow

1. Stage changes with `git add`
2. Generate commit message based on diff
3. Create commit with `git commit`
```

> **Skills are just markdown.** Easy to write, easy to share, version-controlled with your code.

<br/>

## 🤔 What Problem Does Skillbolt Solve?

Every time you use an AI coding assistant, you repeat the same instructions — _"follow conventional commits"_, _"use our code style"_, _"check for security issues"_...

**Your AI forgets. Every. Single. Time.**

Skillbolt fixes this by turning your instructions into **reusable Skills** — and then goes further with LLM-powered discovery and intelligent execution:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Create</h3>
<p>Author skills once as portable markdown files. Works with Claude Code, Cursor, Codex, and more.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Discover</h3>
<p>LLM-powered capability tree + intelligent search finds the right skills for any task automatically.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Execute</h3>
<p>Auto-generated DAG plans orchestrate multi-skill workflows with parallel execution and cost tracking.</p>
</td>
</tr>
</table>

<br/>

## ✨ Features

**Skill lifecycle**

- ⚡ **CLI-first workflow** — create, validate, package, and publish Skills
- 🧬 **Skill distillation** — extract reusable Skills from agent conversations
- 📦 **Modular packages** — use the full stack or only what you need

**Discovery & routing**

- 🌳 **Capability taxonomy** — organize hundreds of Skills into a navigable tree
- 🔍 **Intelligent retrieval** — fast matching with pruning + ranking across tree levels

**Orchestration & visibility**

- 📊 **DAG planning** — compose Skills into parallelizable execution plans
- 🖥️ **Web dashboard** — run status, logs, and DAG viewer in real time
- 🐾 **OpenClaw sync** — share Skills across multi-channel agent surfaces

<br/>

## 🚀 Quick Start

### 1. Install

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Other package managers</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (no install)
```

</details>

### 2. Configure

Set your LLM provider so Skillbolt can power intelligent features:

```bash
export LLM_API_KEY=sk-...                  # Your OpenAI or Anthropic key
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Optional: project-level config</summary>

Create `.skillboltrc.json` in your project root:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

See **[Configuration Guide](./docs/configuration.md)** for all options.

</details>

### 3. Create Your First Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Discover & Install Skills

```bash
skill search git                           # Browse marketplace
skill install github:skillbolt/git-master  # Install from GitHub
```

### 5. Validate

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Documentation

📖 **[Browse Full Documentation](./docs)** — All guides, references, and architecture docs on GitHub

### Getting Started

- **[Installation Guide](./docs/getting-started.md)** — Prerequisites, setup & your first Skillbolt project
- **[SKILL.md Format](./docs/skill-format.md)** — Skill file specification — triggers, workflows, parameters & metadata
- **[Command Reference](./docs/commands.md)** — Complete documentation for all 20+ CLI commands
- **[Configuration](./docs/configuration.md)** — Environment variables, `.skillboltrc.json` & LLM provider settings

### Core Concepts

- **[Runtime Intelligence](./docs/runtime-intelligence.md)** — Capability trees, intelligent search, DAG orchestration & visual dashboard
- **[Capability Trees](./docs/runtime-intelligence.md#capability-tree)** — LLM-powered classification organizes hundreds of skills into navigable hierarchies
- **[Intelligent Search](./docs/runtime-intelligence.md#intelligent-search)** — Multi-level tree traversal with automatic pruning finds the best skills for any task
- **[DAG Orchestration](./docs/runtime-intelligence.md#dag-orchestration--execution)** — Compose skills into parallelizable execution plans from natural language descriptions
- **[Skill Distillation](./docs/skill-format.md#distillation)** — Extract reusable skills from real AI conversation history

### Architecture & Integration

- **[API Reference](./docs/api-reference.md)** — Programmatic usage for building custom integrations and pipelines
- **[Package Architecture](./docs/api-reference.md#packages)** — 17 modular packages — use the full CLI or pick individual components
- **[OpenClaw Integration](./docs/openclaw-integration.md)** — Sync and share skills across 13+ messaging channels via the OpenClaw gateway
- **[Cross-Platform Support](./docs/skill-format.md#platforms)** — Write once, run on Claude Code, Cursor, Codex CLI, Continue & more

### Development

- **[Contributing](./CONTRIBUTING.md)** — Development setup, build instructions, testing & PR workflow
- **[GitHub Issues](https://github.com/TacoSkill/Skill-Kit/issues)** — Bug reports, feature requests & roadmap discussions
- **[Discord Community](https://discord.gg/C943yGQp)** — Get help, share skills & connect with other developers


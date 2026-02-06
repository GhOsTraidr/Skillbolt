<div align="center">

<img src="./figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## AI Agent 技能的通用生态系统

<small>一次构建，处处复用。在 Claude Code、Cursor、OpenClaw 等平台运行技能。</small>

</div>

<p><b>🎨 支持任何兼容技能/指令文件的 AI 编程助手</b></p>

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
  <sub><b>+ 自定义<br/>Agent</b></sub>
</td>

</tr>
</table>

<div align="center">

<br/>

[🇬🇧 English](./README.md) •
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
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-加入讨论-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-关注我们-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/微信-交流群-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 扫码加入微信交流群</summary>
<br/>
<img src="./assets/skill_wechat.JPG" alt="微信群二维码" width="200">
</details>

<br/>

[快速开始](#-快速开始) • [核心特性](#-核心特性) • [文档](#-文档)

</div>

</div>

<br/>

## 📖 什么是 Skill？

**Skill** 是 AI Agent 的可移植指令文件。它定义触发器、工作流和参数：

```markdown
---
name: git-commit-helper
description: 当用户要求"提交代码"或"创建提交"时激活
triggers:
  - commit changes
  - create commit
  - 提交代码
---

## 工作流程

1. 使用 `git add` 暂存更改
2. 根据 diff 生成提交信息
3. 使用 `git commit` 创建提交
```

> **Skill 就是 Markdown。** 易于编写，易于分享，与代码一起版本控制。

<br/>

## 🤔 Skillbolt 解决什么问题？

每次使用 AI 编程助手，你都在重复同样的指令 — _"请遵循 conventional commits 规范"_、_"使用我们的代码风格"_、_"提交前检查安全问题"_...

**你的 AI 每次都会忘记。**

Skillbolt 将你的指令转化为**可复用的 Skills** — 并通过 LLM 驱动的发现和智能执行更进一步：

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 创建</h3>
<p>将技能编写为可移植的 Markdown 文件。适用于 Claude Code、Cursor、Codex 等。</p>
</td>
<td width="33%" align="center">
<h3>🧠 发现</h3>
<p>LLM 驱动的能力树 + 智能搜索，自动为任何任务找到合适的技能。</p>
</td>
<td width="33%" align="center">
<h3>🚀 执行</h3>
<p>自动生成 DAG 计划，编排多技能工作流，并行执行并追踪成本。</p>
</td>
</tr>
</table>

<br/>

## ✨ 核心特性

**技能生命周期**

- ⚡ **CLI 优先工作流** — 创建、验证、打包和发布技能
- 🧬 **技能蒸馏** — 从 AI 对话中提取可复用技能
- 📦 **模块化包** — 使用完整功能或按需引入

**发现与路由**

- 🌳 **能力分类体系** — 将数百个技能组织成可导航的树结构
- 🔍 **智能检索** — 快速匹配，支持剪枝和跨层级排序

**编排与可视化**

- 📊 **DAG 规划** — 将技能组合成可并行的执行计划
- 🖥️ **Web 仪表盘** — 实时查看运行状态、日志和 DAG 视图
- 🐾 **OpenClaw 同步** — 跨多渠道 Agent 共享技能

<br/>

## 🚀 快速开始

### 1. 安装

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>其他包管理器</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx（无需安装）
```

</details>

### 2. 配置

设置 LLM 提供商，以启用 Skillbolt 的智能功能：

```bash
export LLM_API_KEY=sk-...                  # 你的 OpenAI 或 Anthropic 密钥
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>可选：项目级配置</summary>

在项目根目录创建 `.skillboltrc.json`：

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

详见 **[配置指南](./docs/configuration.md)**。

</details>

### 3. 创建你的第一个 Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. 发现和安装 Skills

```bash
skill search git                           # 浏览市场
skill install github:skillbolt/git-master  # 从 GitHub 安装
```

### 5. 验证

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 文档

📖 **[浏览完整文档](./docs)** — 所有指南、参考手册和架构文档

### 快速入门

- **[安装指南](./docs/getting-started.md)** — 环境准备、安装配置与第一个 Skillbolt 项目
- **[SKILL.md 格式](./docs/skill-format.md)** — Skill 文件规范 — 触发器、工作流、参数与元数据
- **[命令参考](./docs/commands.md)** — 全部 20+ CLI 命令的完整文档
- **[配置指南](./docs/configuration.md)** — 环境变量、`.skillboltrc.json` 与 LLM 提供商配置

### 核心概念

- **[运行时智能](./docs/runtime-intelligence.md)** — 能力树、智能搜索、DAG 编排与可视化面板
- **[能力树](./docs/runtime-intelligence.md#capability-tree)** — LLM 驱动的分类系统，将数百个技能组织成可导航的层级结构
- **[智能搜索](./docs/runtime-intelligence.md#intelligent-search)** — 多层树遍历 + 自动剪枝，为任何任务精准匹配最佳技能
- **[DAG 编排](./docs/runtime-intelligence.md#dag-orchestration--execution)** — 从自然语言描述自动生成可并行的技能执行计划
- **[技能蒸馏](./docs/skill-format.md#distillation)** — 从真实的 AI 对话历史中提取可复用技能

### 架构与集成

- **[API 参考](./docs/api-reference.md)** — 编程接口，用于构建自定义集成和工作流管道
- **[包架构](./docs/api-reference.md#packages)** — 17 个模块化包 — 使用完整 CLI 或按需引入单个组件
- **[OpenClaw 集成](./docs/openclaw-integration.md)** — 通过 OpenClaw 网关跨 13+ 消息渠道同步和共享技能
- **[跨平台支持](./docs/skill-format.md#platforms)** — 一次编写，在 Claude Code、Cursor、Codex CLI、Continue 等平台运行

### 开发

- **[贡献指南](./CONTRIBUTING.md)** — 开发环境搭建、构建说明、测试与 PR 流程
- **[GitHub Issues](https://github.com/TacoSkill/Skill-Kit/issues)** — Bug 报告、功能建议与路线图讨论
- **[Discord 社区](https://discord.gg/u34Tg5pQ)** — 获取帮助、分享技能、与开发者交流

<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## AIエージェントのためのユニバーサルスキルエコシステム

<small>一度構築すれば、どこでも再利用。Claude Code、Cursor、OpenClawなどでスキルを実行。</small>

</div>

<p><b>🎨 スキル/インストラクションファイルをサポートするすべてのAIエージェントで動作</b></p>

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
  <sub><b>+ カスタム<br/>エージェント</b></sub>
</td>

</tr>
</table>

<div align="center">

<br/>

[🇬🇧 English](../../README.md) •
[🇨🇳 中文](../../README.zh-CN.md) •
[🇯🇵 日本語](./README.ja.md) •
[🇰🇷 한국어](./README.ko.md) •
[🇪🇸 Español](./README.es.md) •
[🇫🇷 Français](./README.fr.md) •
[🇩🇪 Deutsch](./README.de.md) •
[🇧🇷 Português](./README.pt-br.md)<br/>
[🇷🇺 Русский](./README.ru.md) •
[🇸🇦 العربية](./README.ar.md) •
[🇮🇹 Italiano](./README.it.md) •
[🇻🇳 Tiếng Việt](./README.vi.md) •
[🇹🇷 Türkçe](./README.tr.md)

<br/>

<p align="center">
  <a href="https://www.npmjs.com/package/@skillbolt/cli"><img src="https://img.shields.io/npm/v/@skillbolt/cli?style=flat-square&logo=npm&logoColor=white&color=CB3837" alt="npm"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-参加する-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-フォロー-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-グループ-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 WeChatグループに参加</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[クイックスタート](#-クイックスタート) • [機能](#-機能) • [ドキュメント](#-ドキュメント)

</div>

</div>

<br/>

## 📖 スキルとは？

**スキル**はAIエージェント用のポータブルな指示ファイルです。トリガー、ワークフロー、パラメータを定義します：

```markdown
---
name: git-commit-helper
description: ユーザーが「変更をコミット」または「コミットを作成」と言ったときに起動
triggers:
  - commit changes
  - create commit
---

## ワークフロー

1. `git add`で変更をステージング
2. diffに基づいてコミットメッセージを生成
3. `git commit`でコミットを作成
```

> **スキルはただのMarkdownです。** 書きやすく、共有しやすく、コードと一緒にバージョン管理できます。

<br/>

## 🤔 Skillboltはどんな問題を解決しますか？

AIコーディングアシスタントを使うたびに、同じ指示を繰り返していませんか — _「conventional commitsに従って」_、_「チームのコードスタイルを使って」_、_「セキュリティの問題をチェックして」_...

**AIは毎回忘れます。**

Skillboltはあなたの指示を**再利用可能なスキル**に変換し、LLM駆動の発見とインテリジェントな実行でさらに先へ進みます：

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 作成</h3>
<p>ポータブルなMarkdownファイルとしてスキルを一度作成。Claude Code、Cursor、Codexなどで動作。</p>
</td>
<td width="33%" align="center">
<h3>🧠 発見</h3>
<p>LLM駆動の能力ツリー＋インテリジェント検索が、あらゆるタスクに最適なスキルを自動的に発見。</p>
</td>
<td width="33%" align="center">
<h3>🚀 実行</h3>
<p>自動生成されたDAGプランがマルチスキルワークフローを並列実行し、コストを追跡。</p>
</td>
</tr>
</table>

<br/>

## ✨ 機能

**スキルライフサイクル**

- ⚡ **CLIファーストワークフロー** — スキルの作成、検証、パッケージング、公開
- 🧬 **スキル蒸留** — AI会話から再利用可能なスキルを抽出
- 📦 **モジュラーパッケージ** — フルスタックまたは必要な部分だけを使用

**発見とルーティング**

- 🌳 **能力分類体系** — 数百のスキルをナビゲート可能なツリーに整理
- 🔍 **インテリジェント検索** — プルーニングとレベル間ランキングによる高速マッチング

**オーケストレーションと可視性**

- 📊 **DAGプランニング** — スキルを並列実行可能な計画に構成
- 🖥️ **Webダッシュボード** — 実行状態、ログ、DAGビューアをリアルタイムで表示
- 🐾 **OpenClaw同期** — マルチチャネルエージェント間でスキルを共有

<br/>

## 🚀 クイックスタート

### 1. インストール

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>その他のパッケージマネージャー</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx（インストール不要）
```

</details>

### 2. 設定

Skillboltのインテリジェント機能を有効にするためにLLMプロバイダーを設定：

```bash
export LLM_API_KEY=sk-...                  # OpenAIまたはAnthropicのキー
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>オプション：プロジェクトレベルの設定</summary>

プロジェクトルートに`.skillboltrc.json`を作成：

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

詳細は**[設定ガイド](../configuration.md)**を参照。

</details>

### 3. 最初のスキルを作成

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. スキルを発見・インストール

```bash
skill search git                           # マーケットプレイスを閲覧
skill install github:skillbolt/git-master  # GitHubからインストール
```

### 5. 検証

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 ドキュメント

📖 **[ドキュメント一覧](../)** — すべてのガイド、リファレンス、アーキテクチャドキュメント

### はじめに

- **[インストールガイド](../getting-started.md)** — 前提条件、セットアップ、最初のSkillboltプロジェクト
- **[SKILL.mdフォーマット](../skill-format.md)** — スキルファイル仕様 — トリガー、ワークフロー、パラメータ、メタデータ
- **[コマンドリファレンス](../commands.md)** — 20以上のCLIコマンドの完全なドキュメント
- **[設定](../configuration.md)** — 環境変数、`.skillboltrc.json`、LLMプロバイダー設定

### コアコンセプト

- **[ランタイムインテリジェンス](../runtime-intelligence.md)** — 能力ツリー、インテリジェント検索、DAGオーケストレーション、ビジュアルダッシュボード
- **[能力ツリー](../runtime-intelligence.md#capability-tree)** — LLM駆動の分類が数百のスキルをナビゲート可能な階層に整理
- **[インテリジェント検索](../runtime-intelligence.md#intelligent-search)** — 自動プルーニング付きマルチレベルツリー走査
- **[DAGオーケストレーション](../runtime-intelligence.md#dag-orchestration--execution)** — 自然言語から並列実行可能な計画を自動生成
- **[スキル蒸留](../skill-format.md#distillation)** — 実際のAI会話履歴から再利用可能なスキルを抽出

### アーキテクチャと統合

- **[APIリファレンス](../api-reference.md)** — カスタム統合とパイプライン構築のためのプログラマティック使用法
- **[パッケージアーキテクチャ](../api-reference.md#packages)** — 17のモジュラーパッケージ — フルCLIまたは個別コンポーネント
- **[OpenClaw統合](../openclaw-integration.md)** — OpenClawゲートウェイ経由で13以上のメッセージングチャネルでスキルを同期・共有
- **[クロスプラットフォームサポート](../skill-format.md#platforms)** — 一度書けば、Claude Code、Cursor、Codex CLI、Continueなどで実行

### 開発

- **[コントリビューティング](../../CONTRIBUTING.md)** — 開発環境セットアップ、ビルド手順、テスト、PRワークフロー
- **[GitHub Issues](https://github.com/TacoSkill/Skill-Kit/issues)** — バグ報告、機能リクエスト、ロードマップ議論
- **[Discordコミュニティ](https://discord.gg/u34Tg5pQ)** — ヘルプ、スキル共有、開発者との交流

<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## Ein universelles Skill-Ökosystem für KI-Agenten

<small>Einmal erstellen. Überall wiederverwenden. Skills auf Claude Code, Cursor, OpenClaw und mehr ausführen.</small>

</div>

<p><b>🎨 Funktioniert mit jedem KI-Agenten, der Skill-/Instruktionsdateien unterstützt</b></p>

<table>
<tr>

<td align="center" width="100">
  <a href="https://docs.anthropic.com/en/docs/claude-code">
    <img src="https://cdn.simpleicons.org/claude/D97757" width="48" height="48" alt="Claude Code" />
  </a><br/>
  <sub><a href="https://docs.anthropic.com/en/docs/claude-code"><b>Claude Code</b></a></sub>
</td>

<td align="center" width="100">
  <a href="https://cursor.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/cursor/FFFFFF">
      <img src="https://cdn.simpleicons.org/cursor/000000" width="48" height="48" alt="Cursor" />
    </picture>
  </a><br/>
  <sub><a href="https://cursor.com"><b>Cursor</b></a></sub>
</td>

<td align="center" width="100">
  <a href="https://github.com/openai/codex">
    <img src="https://github.com/openai.png?size=200" width="48" height="48" alt="Codex CLI" />
  </a><br/>
  <sub><a href="https://github.com/openai/codex"><b>Codex CLI</b></a></sub>
</td>

<td align="center" width="100">
  <a href="https://continue.dev">
    <img src="https://github.com/continuedev.png?size=200" width="48" height="48" alt="Continue" />
  </a><br/>
  <sub><a href="https://continue.dev"><b>Continue</b></a></sub>
</td>

<td align="center" width="100">
  <a href="https://openclaw.ai">
    <img src="https://github.com/openclaw.png?size=200" width="48" height="48" alt="OpenClaw" />
  </a><br/>
  <sub><a href="https://openclaw.ai"><b>OpenClaw</b></a></sub>
</td>

<td align="center" width="100">
  <sub><b>+ Eigene<br/>Agenten</b></sub>
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
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Beitreten-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Folgen-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Gruppe-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 WeChat-Gruppe beitreten</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Schnellstart](#-schnellstart) • [Funktionen](#-funktionen) • [Dokumentation](#-dokumentation)

</div>

</div>

<br/>

## 📖 Was ist ein Skill?

Ein **Skill** ist eine portable Instruktionsdatei für KI-Agenten. Er definiert Trigger, Workflows und Parameter:

```markdown
---
name: git-commit-helper
description: Aktiviert sich wenn der Benutzer "Änderungen committen" oder "Commit erstellen" anfordert
triggers:
  - commit changes
  - create commit
---

## Workflow

1. Änderungen mit `git add` stagen
2. Commit-Nachricht basierend auf diff generieren
3. Commit mit `git commit` erstellen
```

> **Skills sind einfach Markdown.** Leicht zu schreiben, leicht zu teilen, versioniert mit deinem Code.

<br/>

## 🤔 Welches Problem löst Skillbolt?

Jedes Mal wenn du einen KI-Coding-Assistenten verwendest, wiederholst du die gleichen Anweisungen — _"folge conventional commits"_, _"verwende unseren Code-Style"_, _"prüfe auf Sicherheitsprobleme"_...

**Deine KI vergisst. Jedes. Mal.**

Skillbolt verwandelt deine Anweisungen in **wiederverwendbare Skills** — und geht mit LLM-gesteuerter Erkennung und intelligenter Ausführung noch weiter:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Erstellen</h3>
<p>Schreibe Skills einmal als portable Markdown-Dateien. Funktioniert mit Claude Code, Cursor, Codex und mehr.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Entdecken</h3>
<p>LLM-gesteuerter Fähigkeitsbaum + intelligente Suche findet automatisch die richtigen Skills.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Ausführen</h3>
<p>Auto-generierte DAG-Pläne orchestrieren Multi-Skill-Workflows mit paralleler Ausführung und Kostenverfolgung.</p>
</td>
</tr>
</table>

<br/>

## ✨ Funktionen

**Skill-Lebenszyklus**

- ⚡ **CLI-first Workflow** — Skills erstellen, validieren, verpacken und veröffentlichen
- 🧬 **Skill-Destillation** — Wiederverwendbare Skills aus KI-Konversationen extrahieren
- 📦 **Modulare Pakete** — Nutze den vollen Stack oder nur was du brauchst

**Entdeckung und Routing**

- 🌳 **Fähigkeits-Taxonomie** — Organisiere hunderte Skills in einem navigierbaren Baum
- 🔍 **Intelligente Suche** — Schnelles Matching mit Pruning und Level-übergreifendem Ranking

**Orchestrierung und Sichtbarkeit**

- 📊 **DAG-Planung** — Komponiere Skills zu parallelisierbaren Ausführungsplänen
- 🖥️ **Web-Dashboard** — Ausführungsstatus, Logs und DAG-Viewer in Echtzeit
- 🐾 **OpenClaw-Sync** — Teile Skills über Multi-Channel-Agent-Oberflächen

<br/>

## 🚀 Schnellstart

### 1. Installieren

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Andere Paketmanager</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (keine Installation)
```

</details>

### 2. Konfigurieren

Konfiguriere deinen LLM-Anbieter um intelligente Funktionen zu aktivieren:

```bash
export LLM_API_KEY=sk-...                  # Dein OpenAI oder Anthropic Schlüssel
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Optional: Projekt-level Konfiguration</summary>

Erstelle `.skillboltrc.json` im Projektstamm:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Siehe **[Konfigurationsanleitung](../configuration.md)** für alle Optionen.

</details>

### 3. Erstelle deinen ersten Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Entdecke und installiere Skills

```bash
skill search git                           # Marktplatz durchsuchen
skill install github:skillbolt/git-master  # Von GitHub installieren
```

### 5. Validieren

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Dokumentation

📖 **[Vollständige Dokumentation ansehen](../)** — Alle Anleitungen, Referenzen und Architektur-Dokumente

### Erste Schritte

- **[Installationsanleitung](../getting-started.md)** — Voraussetzungen, Setup und dein erstes Skillbolt-Projekt
- **[SKILL.md Format](../skill-format.md)** — Skill-Dateispezifikation — Trigger, Workflows, Parameter und Metadaten
- **[Befehlsreferenz](../commands.md)** — Vollständige Dokumentation der 20+ CLI-Befehle
- **[Konfiguration](../configuration.md)** — Umgebungsvariablen, `.skillboltrc.json` und LLM-Anbieter-Einstellungen

### Kernkonzepte

- **[Laufzeit-Intelligenz](../runtime-intelligence.md)** — Fähigkeitsbäume, intelligente Suche, DAG-Orchestrierung und visuelles Dashboard
- **[Fähigkeitsbäume](../runtime-intelligence.md#capability-tree)** — LLM-gesteuerte Klassifikation organisiert hunderte Skills in navigierbare Hierarchien
- **[Intelligente Suche](../runtime-intelligence.md#intelligent-search)** — Multi-Level Baumdurchquerung mit automatischem Pruning
- **[DAG-Orchestrierung](../runtime-intelligence.md#dag-orchestration--execution)** — Generiert parallele Ausführungspläne aus natürlicher Sprache
- **[Skill-Destillation](../skill-format.md#distillation)** — Extrahiert wiederverwendbare Skills aus echtem KI-Konversationsverlauf

### Architektur und Integration

- **[API-Referenz](../api-reference.md)** — Programmatische Nutzung für benutzerdefinierte Integrationen und Pipelines
- **[Paket-Architektur](../api-reference.md#packages)** — 17 modulare Pakete — nutze die volle CLI oder einzelne Komponenten
- **[OpenClaw-Integration](../openclaw-integration.md)** — Synchronisiere und teile Skills über 13+ Messaging-Kanäle via OpenClaw-Gateway
- **[Plattformübergreifende Unterstützung](../skill-format.md#platforms)** — Einmal schreiben, auf Claude Code, Cursor, Codex CLI, Continue und mehr ausführen

### Entwicklung

- **[Mitwirken](../../CONTRIBUTING.md)** — Entwicklungsumgebung einrichten, Build-Anweisungen, Tests und PR-Workflow
- **[GitHub Issues](https://github.com/TacoSkill/Skill-Kit/issues)** — Bug-Reports, Feature-Anfragen und Roadmap-Diskussionen
- **[Discord-Community](https://discord.gg/u34Tg5pQ)** — Hilfe erhalten, Skills teilen und mit anderen Entwicklern verbinden

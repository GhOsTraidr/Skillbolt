<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## Un ecosistema universale di skill per agenti IA.

<small>Crea una volta. Riusa ovunque. Esegui skill su Claude Code, Cursor, OpenClaw e altri.</small>

</div>

<p><b>🎨 Funziona con qualsiasi agente IA che supporta file skill/istruzioni</b></p>

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
  <sub><b>+ Agenti<br/>Personalizzati</b></sub>
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
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="Licenza"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-benvenute-brightgreen?style=flat-square" alt="PRs Benvenute"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Unisciti-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Seguici-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Gruppo-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 Scansiona per unirti al Gruppo WeChat</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Guida Rapida](#-guida-rapida) • [Caratteristiche](#-caratteristiche) • [Documentazione](#-documentazione)

</div>

</div>

<br/>

## 📖 Cos'è una Skill?

Una **Skill** è un file di istruzioni portabile per agenti IA. Definisce trigger, workflow e parametri:

```markdown
---
name: git-commit-helper
description: Attiva quando l'utente chiede di "committare le modifiche" o "creare un commit"
triggers:
  - commit changes
  - create commit
---

## Workflow

1. Prepara le modifiche con `git add`
2. Genera il messaggio di commit basato sul diff
3. Crea il commit con `git commit`
```

> **Le Skill sono solo markdown.** Facili da scrivere, facili da condividere, versionabili con il tuo codice.

<br/>

## 🤔 Quale Problema Risolve Skillbolt?

Ogni volta che usi un assistente di codifica IA, ripeti le stesse istruzioni — _"segui conventional commits"_, _"usa il nostro stile di codice"_, _"controlla problemi di sicurezza"_...

**La tua IA dimentica. Ogni. Singola. Volta.**

Skillbolt risolve questo trasformando le tue istruzioni in **Skill riutilizzabili** — e va oltre con scoperta alimentata da LLM ed esecuzione intelligente:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Crea</h3>
<p>Crea skill una volta come file markdown portabili. Funziona con Claude Code, Cursor, Codex e altri.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Scopri</h3>
<p>Albero delle capacità alimentato da LLM + ricerca intelligente trova automaticamente le skill giuste per qualsiasi attività.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Esegui</h3>
<p>Piani DAG auto-generati orchestrano workflow multi-skill con esecuzione parallela e tracciamento dei costi.</p>
</td>
</tr>
</table>

<br/>

## ✨ Caratteristiche

**Ciclo di vita delle Skill**

- ⚡ **Workflow CLI-first** — crea, valida, impacchetta e pubblica Skill
- 🧬 **Distillazione skill** — estrai Skill riutilizzabili dalle conversazioni con gli agenti
- 📦 **Pacchetti modulari** — usa lo stack completo o solo ciò che ti serve

**Scoperta e routing**

- 🌳 **Tassonomia delle capacità** — organizza centinaia di Skill in un albero navigabile
- 🔍 **Recupero intelligente** — matching rapido con potatura + ranking attraverso i livelli dell'albero

**Orchestrazione e visibilità**

- 📊 **Pianificazione DAG** — componi Skill in piani di esecuzione parallelizzabili
- 🖥️ **Dashboard web** — stato di esecuzione, log e visualizzatore DAG in tempo reale
- 🐾 **Sincronizzazione OpenClaw** — condividi Skill attraverso superfici di agenti multi-canale

<br/>

## 🚀 Guida Rapida

### 1. Installa

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Altri gestori di pacchetti</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (senza installazione)
```

</details>

### 2. Configura

Imposta il tuo provider LLM affinché Skillbolt possa alimentare le funzionalità intelligenti:

```bash
export LLM_API_KEY=sk-...                  # La tua chiave OpenAI o Anthropic
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Opzionale: configurazione a livello di progetto</summary>

Crea `.skillboltrc.json` nella root del tuo progetto:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Consulta la **[Guida alla Configurazione](../configuration.md)** per tutte le opzioni.

</details>

### 3. Crea la Tua Prima Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Scopri e Installa Skill

```bash
skill search git                           # Sfoglia il marketplace
skill install github:skillbolt/git-master  # Installa da GitHub
```

### 5. Valida

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Documentazione

📖 **[Esplora la Documentazione Completa](../index.md)** — Tutte le guide, i riferimenti e la documentazione dell'architettura su GitHub

### Per Iniziare

- **[Guida all'Installazione](../getting-started.md)** — Prerequisiti, configurazione e il tuo primo progetto Skillbolt
- **[Formato SKILL.md](../skill-format.md)** — Specifica del file skill — trigger, workflow, parametri e metadati
- **[Riferimento Comandi](../commands.md)** — Documentazione completa per tutti i 20+ comandi CLI
- **[Configurazione](../configuration.md)** — Variabili d'ambiente, `.skillboltrc.json` e impostazioni del provider LLM

### Concetti Fondamentali

- **[Intelligenza Runtime](../runtime-intelligence.md)** — Alberi delle capacità, ricerca intelligente, orchestrazione DAG e dashboard visuale
- **[Alberi delle Capacità](../runtime-intelligence.md#capability-tree)** — La classificazione alimentata da LLM organizza centinaia di skill in gerarchie navigabili
- **[Ricerca Intelligente](../runtime-intelligence.md#intelligent-search)** — Attraversamento multi-livello dell'albero con potatura automatica trova le migliori skill per qualsiasi attività
- **[Orchestrazione DAG](../runtime-intelligence.md#dag-orchestration--execution)** — Componi skill in piani di esecuzione parallelizzabili da descrizioni in linguaggio naturale
- **[Distillazione Skill](../skill-format.md#distillation)** — Estrai skill riutilizzabili dalla cronologia reale delle conversazioni IA

### Architettura e Integrazione

- **[Riferimento API](../api-reference.md)** — Utilizzo programmatico per costruire integrazioni e pipeline personalizzate
- **[Architettura dei Pacchetti](../api-reference.md#packages)** — 17 pacchetti modulari — usa la CLI completa o scegli componenti individuali
- **[Integrazione OpenClaw](../openclaw-integration.md)** — Sincronizza e condividi skill attraverso 13+ canali di messaggistica via gateway OpenClaw
- **[Supporto Cross-Platform](../skill-format.md#platforms)** — Scrivi una volta, esegui su Claude Code, Cursor, Codex CLI, Continue e altri

### Sviluppo

- **[Contribuire](../../CONTRIBUTING.md)** — Setup di sviluppo, istruzioni di build, testing e workflow PR
- **[Issues GitHub](https://github.com/TacoSkill/Skill-Kit/issues)** — Segnalazioni bug, richieste funzionalità e discussioni sulla roadmap
- **[Comunità Discord](https://discord.gg/u34Tg5pQ)** — Ottieni aiuto, condividi skill e connettiti con altri sviluppatori

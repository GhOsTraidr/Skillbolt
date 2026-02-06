<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## Um ecossistema universal de habilidades para agentes de IA.

<small>Crie uma vez. Reutilize em qualquer lugar. Execute habilidades no Claude Code, Cursor, OpenClaw e mais.</small>

</div>

<p><b>🎨 Funciona com qualquer agente de IA que suporte arquivos de habilidade/instrução</b></p>

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
  <sub><b>+ Agentes<br/>Personalizados</b></sub>
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
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="Licença"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Bem-vindos"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Entrar-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Seguir-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Grupo-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 Escaneie para entrar no Grupo WeChat</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Início Rápido](#-início-rápido) • [Recursos](#-recursos) • [Documentação](#-documentação)

</div>

</div>

<br/>

## 📖 O que é uma Skill?

Uma **Skill** é um arquivo de instrução portátil para agentes de IA. Define gatilhos, fluxos de trabalho e parâmetros:

```markdown
---
name: git-commit-helper
description: Ativar quando usuário pedir para "commitar alterações" ou "criar um commit"
triggers:
  - commit changes
  - create commit
---

## Fluxo de Trabalho

1. Preparar alterações com `git add`
2. Gerar mensagem de commit baseada no diff
3. Criar commit com `git commit`
```

> **Skills são apenas markdown.** Fáceis de escrever, fáceis de compartilhar, versionadas com seu código.

<br/>

## 🤔 Qual Problema o Skillbolt Resolve?

Toda vez que você usa um assistente de codificação IA, repete as mesmas instruções — _"siga conventional commits"_, _"use nosso estilo de código"_, _"verifique problemas de segurança"_...

**Sua IA esquece. Toda. Vez.**

Skillbolt resolve isso transformando suas instruções em **Skills reutilizáveis** — e vai além com descoberta alimentada por LLM e execução inteligente:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Criar</h3>
<p>Crie skills uma vez como arquivos markdown portáteis. Funciona com Claude Code, Cursor, Codex e mais.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Descobrir</h3>
<p>Árvore de capacidades + busca inteligente alimentada por LLM encontra as skills certas automaticamente.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Executar</h3>
<p>Planos DAG auto-gerados orquestram fluxos de trabalho multi-skill com execução paralela e rastreamento de custos.</p>
</td>
</tr>
</table>

<br/>

## ✨ Recursos

**Ciclo de vida da Skill**

- ⚡ **Fluxo de trabalho CLI-first** — criar, validar, empacotar e publicar Skills
- 🧬 **Destilação de skills** — extrair Skills reutilizáveis de conversas com agentes
- 📦 **Pacotes modulares** — use a stack completa ou apenas o que precisa

**Descoberta e roteamento**

- 🌳 **Taxonomia de capacidades** — organize centenas de Skills em uma árvore navegável
- 🔍 **Recuperação inteligente** — correspondência rápida com poda + ranking entre níveis da árvore

**Orquestração e visibilidade**

- 📊 **Planejamento DAG** — componha Skills em planos de execução paralelizáveis
- 🖥️ **Painel web** — status de execução, logs e visualizador DAG em tempo real
- 🐾 **Sincronização OpenClaw** — compartilhe Skills em múltiplos canais de agentes

<br/>

## 🚀 Início Rápido

### 1. Instalar

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Outros gerenciadores de pacotes</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (sem instalação)
```

</details>

### 2. Configurar

Configure seu provedor LLM para que o Skillbolt possa alimentar recursos inteligentes:

```bash
export LLM_API_KEY=sk-...                  # Sua chave OpenAI ou Anthropic
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Opcional: configuração a nível de projeto</summary>

Crie `.skillboltrc.json` na raiz do seu projeto:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Veja o **[Guia de Configuração](../configuration.md)** para todas as opções.

</details>

### 3. Crie Sua Primeira Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Descubra e Instale Skills

```bash
skill search git                           # Navegue pelo marketplace
skill install github:skillbolt/git-master  # Instale do GitHub
```

### 5. Validar

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Documentação

📖 **[Navegue pela Documentação Completa](../index.md)** — Todos os guias, referências e documentação de arquitetura no GitHub

### Começando

- **[Guia de Instalação](../getting-started.md)** — Pré-requisitos, configuração e seu primeiro projeto Skillbolt
- **[Formato SKILL.md](../skill-format.md)** — Especificação do arquivo skill — gatilhos, fluxos de trabalho, parâmetros e metadados
- **[Referência de Comandos](../commands.md)** — Documentação completa para todos os 20+ comandos CLI
- **[Configuração](../configuration.md)** — Variáveis de ambiente, `.skillboltrc.json` e configurações do provedor LLM

### Conceitos Principais

- **[Inteligência de Runtime](../runtime-intelligence.md)** — Árvores de capacidades, busca inteligente, orquestração DAG e painel visual
- **[Árvores de Capacidades](../runtime-intelligence.md#capability-tree)** — Classificação alimentada por LLM organiza centenas de skills em hierarquias navegáveis
- **[Busca Inteligente](../runtime-intelligence.md#intelligent-search)** — Travessia multinível da árvore com poda automática encontra as melhores skills para qualquer tarefa
- **[Orquestração DAG](../runtime-intelligence.md#dag-orchestration--execution)** — Componha skills em planos de execução paralelizáveis a partir de descrições em linguagem natural
- **[Destilação de Skills](../skill-format.md#distillation)** — Extraia skills reutilizáveis do histórico real de conversas com IA

### Arquitetura e Integração

- **[Referência da API](../api-reference.md)** — Uso programático para construir integrações e pipelines personalizados
- **[Arquitetura de Pacotes](../api-reference.md#packages)** — 17 pacotes modulares — use a CLI completa ou escolha componentes individuais
- **[Integração OpenClaw](../openclaw-integration.md)** — Sincronize e compartilhe skills em 13+ canais de mensagens via gateway OpenClaw
- **[Suporte Cross-Platform](../skill-format.md#platforms)** — Escreva uma vez, execute no Claude Code, Cursor, Codex CLI, Continue e mais

### Desenvolvimento

- **[Contribuindo](../../CONTRIBUTING.md)** — Configuração de desenvolvimento, instruções de build, testes e fluxo de PR
- **[Issues no GitHub](https://github.com/TacoSkill/Skill-Kit/issues)** — Relatórios de bugs, solicitações de recursos e discussões do roadmap
- **[Comunidade Discord](https://discord.gg/u34Tg5pQ)** — Obtenha ajuda, compartilhe skills e conecte-se com outros desenvolvedores

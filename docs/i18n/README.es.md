<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## Un ecosistema universal de habilidades para agentes de IA

<small>Construye una vez. Reutiliza en todas partes. Ejecuta habilidades en Claude Code, Cursor, OpenClaw y más.</small>

</div>

<p><b>🎨 Funciona con cualquier agente de IA que soporte archivos de habilidades/instrucciones</b></p>

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
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Únete-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Seguir-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Grupo-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 Únete al grupo de WeChat</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Inicio Rápido](#-inicio-rápido) • [Características](#-características) • [Documentación](#-documentación)

</div>

</div>

<br/>

## 📖 ¿Qué es una Skill?

Una **Skill** es un archivo de instrucciones portátil para agentes de IA. Define triggers, flujos de trabajo y parámetros:

```markdown
---
name: git-commit-helper
description: Se activa cuando el usuario pide "hacer commit" o "crear un commit"
triggers:
  - commit changes
  - create commit
---

## Flujo de trabajo

1. Preparar cambios con `git add`
2. Generar mensaje de commit basado en el diff
3. Crear commit con `git commit`
```

> **Las Skills son solo markdown.** Fáciles de escribir, fáciles de compartir, versionadas con tu código.

<br/>

## 🤔 ¿Qué problema resuelve Skillbolt?

Cada vez que usas un asistente de codificación IA, repites las mismas instrucciones — _"sigue conventional commits"_, _"usa el estilo de código del equipo"_, _"verifica problemas de seguridad"_...

**Tu IA olvida. Cada. Vez.**

Skillbolt transforma tus instrucciones en **Skills reutilizables** — y va más allá con descubrimiento potenciado por LLM y ejecución inteligente:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Crear</h3>
<p>Escribe habilidades una vez como archivos markdown portátiles. Funciona con Claude Code, Cursor, Codex y más.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Descubrir</h3>
<p>Árbol de capacidades + búsqueda inteligente potenciada por LLM encuentra las habilidades correctas automáticamente.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Ejecutar</h3>
<p>Los planes DAG auto-generados orquestan flujos de trabajo multi-skill con ejecución paralela y seguimiento de costos.</p>
</td>
</tr>
</table>

<br/>

## ✨ Características

**Ciclo de vida de Skills**

- ⚡ **Flujo de trabajo CLI-first** — crear, validar, empaquetar y publicar Skills
- 🧬 **Destilación de Skills** — extraer Skills reutilizables de conversaciones con IA
- 📦 **Paquetes modulares** — usa el stack completo o solo lo que necesites

**Descubrimiento y enrutamiento**

- 🌳 **Taxonomía de capacidades** — organiza cientos de Skills en un árbol navegable
- 🔍 **Recuperación inteligente** — coincidencia rápida con poda y ranking entre niveles

**Orquestación y visibilidad**

- 📊 **Planificación DAG** — compone Skills en planes de ejecución paralelizables
- 🖥️ **Dashboard web** — estado de ejecución, logs y visor DAG en tiempo real
- 🐾 **Sincronización OpenClaw** — comparte Skills entre superficies de agentes multicanal

<br/>

## 🚀 Inicio Rápido

### 1. Instalar

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Otros gestores de paquetes</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (sin instalación)
```

</details>

### 2. Configurar

Configura tu proveedor LLM para habilitar las funciones inteligentes de Skillbolt:

```bash
export LLM_API_KEY=sk-...                  # Tu clave de OpenAI o Anthropic
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Opcional: configuración a nivel de proyecto</summary>

Crea `.skillboltrc.json` en la raíz de tu proyecto:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Ver **[Guía de Configuración](../configuration.md)** para todas las opciones.

</details>

### 3. Crea tu primera Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Descubre e instala Skills

```bash
skill search git                           # Explora el marketplace
skill install github:skillbolt/git-master  # Instala desde GitHub
```

### 5. Valida

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Documentación

📖 **[Ver documentación completa](../)** — Todas las guías, referencias y documentos de arquitectura

### Primeros pasos

- **[Guía de instalación](../getting-started.md)** — Requisitos previos, configuración y tu primer proyecto Skillbolt
- **[Formato SKILL.md](../skill-format.md)** — Especificación del archivo de skill — triggers, flujos de trabajo, parámetros y metadatos
- **[Referencia de comandos](../commands.md)** — Documentación completa de los 20+ comandos CLI
- **[Configuración](../configuration.md)** — Variables de entorno, `.skillboltrc.json` y configuración del proveedor LLM

### Conceptos principales

- **[Inteligencia en tiempo de ejecución](../runtime-intelligence.md)** — Árboles de capacidades, búsqueda inteligente, orquestación DAG y dashboard visual
- **[Árboles de capacidades](../runtime-intelligence.md#capability-tree)** — La clasificación potenciada por LLM organiza cientos de skills en jerarquías navegables
- **[Búsqueda inteligente](../runtime-intelligence.md#intelligent-search)** — Recorrido de árbol multinivel con poda automática
- **[Orquestación DAG](../runtime-intelligence.md#dag-orchestration--execution)** — Genera planes de ejecución paralela desde lenguaje natural
- **[Destilación de Skills](../skill-format.md#distillation)** — Extrae skills reutilizables del historial real de conversaciones con IA

### Arquitectura e integración

- **[Referencia de API](../api-reference.md)** — Uso programático para construir integraciones y pipelines personalizados
- **[Arquitectura de paquetes](../api-reference.md#packages)** — 17 paquetes modulares — usa el CLI completo o componentes individuales
- **[Integración OpenClaw](../openclaw-integration.md)** — Sincroniza y comparte skills en 13+ canales de mensajería via gateway OpenClaw
- **[Soporte multiplataforma](../skill-format.md#platforms)** — Escribe una vez, ejecuta en Claude Code, Cursor, Codex CLI, Continue y más

### Desarrollo

- **[Contribuir](../../CONTRIBUTING.md)** — Configuración del entorno de desarrollo, instrucciones de build, testing y flujo de PR
- **[GitHub Issues](https://github.com/TacoSkill/Skill-Kit/issues)** — Reportes de bugs, solicitudes de funciones y discusiones del roadmap
- **[Comunidad Discord](https://discord.gg/u34Tg5pQ)** — Obtén ayuda, comparte skills y conecta con otros desarrolladores

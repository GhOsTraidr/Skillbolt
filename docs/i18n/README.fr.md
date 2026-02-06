<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## Un écosystème universel de compétences pour les agents IA

<small>Construisez une fois. Réutilisez partout. Exécutez des compétences sur Claude Code, Cursor, OpenClaw et plus.</small>

</div>

<p><b>🎨 Fonctionne avec tout agent IA supportant les fichiers de compétences/instructions</b></p>

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
  <sub><b>+ Agents<br/>Personnalisés</b></sub>
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
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Rejoindre-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Suivre-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Groupe-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 Rejoindre le groupe WeChat</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Démarrage Rapide](#-démarrage-rapide) • [Fonctionnalités](#-fonctionnalités) • [Documentation](#-documentation)

</div>

</div>

<br/>

## 📖 Qu'est-ce qu'une Skill ?

Une **Skill** est un fichier d'instructions portable pour les agents IA. Elle définit les déclencheurs, flux de travail et paramètres :

```markdown
---
name: git-commit-helper
description: S'active quand l'utilisateur demande de "commiter" ou "créer un commit"
triggers:
  - commit changes
  - create commit
---

## Flux de travail

1. Préparer les modifications avec `git add`
2. Générer le message de commit basé sur le diff
3. Créer le commit avec `git commit`
```

> **Les Skills sont juste du markdown.** Faciles à écrire, faciles à partager, versionnées avec votre code.

<br/>

## 🤔 Quel problème Skillbolt résout-il ?

Chaque fois que vous utilisez un assistant de codage IA, vous répétez les mêmes instructions — _"suivez les conventional commits"_, _"utilisez le style de code de l'équipe"_, _"vérifiez les problèmes de sécurité"_...

**Votre IA oublie. À chaque fois.**

Skillbolt transforme vos instructions en **Skills réutilisables** — et va plus loin avec la découverte propulsée par LLM et l'exécution intelligente :

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Créer</h3>
<p>Rédigez des compétences une fois sous forme de fichiers markdown portables. Fonctionne avec Claude Code, Cursor, Codex et plus.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Découvrir</h3>
<p>Arbre de capacités + recherche intelligente propulsée par LLM trouve automatiquement les bonnes compétences.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Exécuter</h3>
<p>Les plans DAG auto-générés orchestrent des flux multi-compétences avec exécution parallèle et suivi des coûts.</p>
</td>
</tr>
</table>

<br/>

## ✨ Fonctionnalités

**Cycle de vie des Skills**

- ⚡ **Flux de travail CLI-first** — créer, valider, empaqueter et publier des Skills
- 🧬 **Distillation de Skills** — extraire des Skills réutilisables des conversations IA
- 📦 **Paquets modulaires** — utilisez la stack complète ou seulement ce dont vous avez besoin

**Découverte et routage**

- 🌳 **Taxonomie des capacités** — organisez des centaines de Skills dans un arbre navigable
- 🔍 **Récupération intelligente** — correspondance rapide avec élagage et classement entre niveaux

**Orchestration et visibilité**

- 📊 **Planification DAG** — composez des Skills en plans d'exécution parallélisables
- 🖥️ **Tableau de bord web** — statut d'exécution, logs et visualiseur DAG en temps réel
- 🐾 **Synchronisation OpenClaw** — partagez des Skills entre surfaces d'agents multicanal

<br/>

## 🚀 Démarrage Rapide

### 1. Installer

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Autres gestionnaires de paquets</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (sans installation)
```

</details>

### 2. Configurer

Configurez votre fournisseur LLM pour activer les fonctionnalités intelligentes :

```bash
export LLM_API_KEY=sk-...                  # Votre clé OpenAI ou Anthropic
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Optionnel : configuration au niveau projet</summary>

Créez `.skillboltrc.json` à la racine de votre projet :

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Voir **[Guide de Configuration](../configuration.md)** pour toutes les options.

</details>

### 3. Créez votre première Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Découvrez et installez des Skills

```bash
skill search git                           # Explorez le marketplace
skill install github:skillbolt/git-master  # Installez depuis GitHub
```

### 5. Validez

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Documentation

📖 **[Voir la documentation complète](../)** — Tous les guides, références et documents d'architecture

### Premiers pas

- **[Guide d'installation](../getting-started.md)** — Prérequis, configuration et votre premier projet Skillbolt
- **[Format SKILL.md](../skill-format.md)** — Spécification du fichier de skill — déclencheurs, flux de travail, paramètres et métadonnées
- **[Référence des commandes](../commands.md)** — Documentation complète des 20+ commandes CLI
- **[Configuration](../configuration.md)** — Variables d'environnement, `.skillboltrc.json` et configuration du fournisseur LLM

### Concepts clés

- **[Intelligence d'exécution](../runtime-intelligence.md)** — Arbres de capacités, recherche intelligente, orchestration DAG et tableau de bord visuel
- **[Arbres de capacités](../runtime-intelligence.md#capability-tree)** — La classification propulsée par LLM organise des centaines de skills en hiérarchies navigables
- **[Recherche intelligente](../runtime-intelligence.md#intelligent-search)** — Parcours d'arbre multiniveau avec élagage automatique
- **[Orchestration DAG](../runtime-intelligence.md#dag-orchestration--execution)** — Génère des plans d'exécution parallèle depuis le langage naturel
- **[Distillation de Skills](../skill-format.md#distillation)** — Extrait des skills réutilisables de l'historique réel des conversations IA

### Architecture et intégration

- **[Référence API](../api-reference.md)** — Usage programmatique pour construire des intégrations et pipelines personnalisés
- **[Architecture des paquets](../api-reference.md#packages)** — 17 paquets modulaires — utilisez le CLI complet ou des composants individuels
- **[Intégration OpenClaw](../openclaw-integration.md)** — Synchronisez et partagez des skills sur 13+ canaux de messagerie via la passerelle OpenClaw
- **[Support multiplateforme](../skill-format.md#platforms)** — Écrivez une fois, exécutez sur Claude Code, Cursor, Codex CLI, Continue et plus

### Développement

- **[Contribuer](../../CONTRIBUTING.md)** — Configuration de l'environnement de développement, instructions de build, tests et workflow PR
- **[GitHub Issues](https://github.com/TacoSkill/Skill-Kit/issues)** — Rapports de bugs, demandes de fonctionnalités et discussions sur la roadmap
- **[Communauté Discord](https://discord.gg/u34Tg5pQ)** — Obtenez de l'aide, partagez des skills et connectez-vous avec d'autres développeurs

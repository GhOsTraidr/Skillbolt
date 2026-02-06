<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## Универсальная экосистема навыков для ИИ-агентов.

<small>Создайте один раз. Используйте везде. Запускайте навыки в Claude Code, Cursor, OpenClaw и других.</small>

</div>

<p><b>🎨 Работает с любым ИИ-агентом, поддерживающим файлы навыков/инструкций</b></p>

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
  <sub><b>+ Пользовательские<br/>агенты</b></sub>
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
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="Лицензия"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PR приветствуются"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Присоединиться-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Подписаться-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Группа-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 Отсканируйте для присоединения к группе WeChat</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Быстрый старт](#-быстрый-старт) • [Возможности](#-возможности) • [Документация](#-документация)

</div>

</div>

<br/>

## 📖 Что такое Skill?

**Skill** — это портативный файл инструкций для ИИ-агентов. Он определяет триггеры, рабочие процессы и параметры:

```markdown
---
name: git-commit-helper
description: Активировать, когда пользователь просит "закоммитить изменения" или "создать коммит"
triggers:
  - commit changes
  - create commit
---

## Рабочий процесс

1. Подготовить изменения с помощью `git add`
2. Сгенерировать сообщение коммита на основе diff
3. Создать коммит с помощью `git commit`
```

> **Skills — это просто markdown.** Легко писать, легко делиться, версионируются вместе с кодом.

<br/>

## 🤔 Какую проблему решает Skillbolt?

Каждый раз при использовании ИИ-ассистента для кодирования вы повторяете одни и те же инструкции — _«следуй conventional commits»_, _«используй наш стиль кода»_, _«проверь на проблемы безопасности»_...

**Ваш ИИ забывает. Каждый. Раз.**

Skillbolt решает эту проблему, превращая ваши инструкции в **переиспользуемые Skills** — и идёт дальше с обнаружением на базе LLM и интеллектуальным выполнением:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Создание</h3>
<p>Создайте навыки один раз как портативные markdown-файлы. Работает с Claude Code, Cursor, Codex и другими.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Обнаружение</h3>
<p>Дерево способностей на базе LLM + интеллектуальный поиск автоматически находят подходящие навыки для любой задачи.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Выполнение</h3>
<p>Автоматически генерируемые DAG-планы оркестрируют многонавыковые рабочие процессы с параллельным выполнением и отслеживанием затрат.</p>
</td>
</tr>
</table>

<br/>

## ✨ Возможности

**Жизненный цикл Skill**

- ⚡ **CLI-первый подход** — создание, валидация, упаковка и публикация Skills
- 🧬 **Дистилляция навыков** — извлечение переиспользуемых Skills из разговоров с агентами
- 📦 **Модульные пакеты** — используйте полный стек или только то, что нужно

**Обнаружение и маршрутизация**

- 🌳 **Таксономия способностей** — организация сотен Skills в навигируемое дерево
- 🔍 **Интеллектуальный поиск** — быстрое сопоставление с обрезкой + ранжирование по уровням дерева

**Оркестрация и видимость**

- 📊 **DAG-планирование** — компоновка Skills в параллелизируемые планы выполнения
- 🖥️ **Веб-панель** — статус выполнения, логи и просмотр DAG в реальном времени
- 🐾 **Синхронизация OpenClaw** — делитесь Skills через многоканальные агентные поверхности

<br/>

## 🚀 Быстрый старт

### 1. Установка

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Другие менеджеры пакетов</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (без установки)
```

</details>

### 2. Настройка

Настройте провайдера LLM для работы интеллектуальных функций Skillbolt:

```bash
export LLM_API_KEY=sk-...                  # Ваш ключ OpenAI или Anthropic
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Опционально: конфигурация на уровне проекта</summary>

Создайте `.skillboltrc.json` в корне проекта:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Смотрите **[Руководство по конфигурации](../configuration.md)** для всех опций.

</details>

### 3. Создайте свой первый Skill

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Откройте и установите Skills

```bash
skill search git                           # Обзор маркетплейса
skill install github:skillbolt/git-master  # Установить с GitHub
```

### 5. Валидация

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Документация

📖 **[Полная документация](../index.md)** — Все руководства, справочники и документация по архитектуре на GitHub

### Начало работы

- **[Руководство по установке](../getting-started.md)** — Предварительные требования, настройка и ваш первый проект Skillbolt
- **[Формат SKILL.md](../skill-format.md)** — Спецификация файла skill — триггеры, рабочие процессы, параметры и метаданные
- **[Справочник команд](../commands.md)** — Полная документация по всем 20+ командам CLI
- **[Конфигурация](../configuration.md)** — Переменные окружения, `.skillboltrc.json` и настройки провайдера LLM

### Основные концепции

- **[Интеллект времени выполнения](../runtime-intelligence.md)** — Деревья способностей, интеллектуальный поиск, DAG-оркестрация и визуальная панель
- **[Деревья способностей](../runtime-intelligence.md#capability-tree)** — Классификация на базе LLM организует сотни навыков в навигируемые иерархии
- **[Интеллектуальный поиск](../runtime-intelligence.md#intelligent-search)** — Многоуровневый обход дерева с автоматической обрезкой находит лучшие навыки для любой задачи
- **[DAG-оркестрация](../runtime-intelligence.md#dag-orchestration--execution)** — Компонуйте навыки в параллелизируемые планы выполнения из описаний на естественном языке
- **[Дистилляция навыков](../skill-format.md#distillation)** — Извлекайте переиспользуемые навыки из реальной истории разговоров с ИИ

### Архитектура и интеграция

- **[Справочник API](../api-reference.md)** — Программное использование для создания пользовательских интеграций и пайплайнов
- **[Архитектура пакетов](../api-reference.md#packages)** — 17 модульных пакетов — используйте полный CLI или выбирайте отдельные компоненты
- **[Интеграция с OpenClaw](../openclaw-integration.md)** — Синхронизируйте и делитесь навыками через 13+ каналов обмена сообщениями через шлюз OpenClaw
- **[Кроссплатформенная поддержка](../skill-format.md#platforms)** — Пишите один раз, запускайте в Claude Code, Cursor, Codex CLI, Continue и других

### Разработка

- **[Участие в разработке](../../CONTRIBUTING.md)** — Настройка разработки, инструкции по сборке, тестирование и процесс PR
- **[Issues на GitHub](https://github.com/TacoSkill/Skill-Kit/issues)** — Отчёты об ошибках, запросы функций и обсуждения roadmap
- **[Сообщество Discord](https://discord.gg/u34Tg5pQ)** — Получите помощь, делитесь навыками и общайтесь с другими разработчиками

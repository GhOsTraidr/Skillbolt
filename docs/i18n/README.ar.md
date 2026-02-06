<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## نظام بيئي شامل للمهارات لوكلاء الذكاء الاصطناعي.

<small>أنشئ مرة واحدة. أعد الاستخدام في كل مكان. شغّل المهارات عبر Claude Code و Cursor و OpenClaw والمزيد.</small>

</div>

<p><b>🎨 يعمل مع أي وكيل ذكاء اصطناعي يدعم ملفات المهارات/التعليمات</b></p>

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
  <sub><b>+ وكلاء<br/>مخصصون</b></sub>
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
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="الترخيص"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-مرحب%20بها-brightgreen?style=flat-square" alt="PRs مرحب بها"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-انضم-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-تابع-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-مجموعة-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 امسح للانضمام إلى مجموعة WeChat</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[البدء السريع](#-البدء-السريع) • [الميزات](#-الميزات) • [التوثيق](#-التوثيق)

</div>

</div>

<br/>

## 📖 ما هي المهارة (Skill)؟

**المهارة** هي ملف تعليمات محمول لوكلاء الذكاء الاصطناعي. تحدد المُحفزات وسير العمل والمعاملات:

```markdown
---
name: git-commit-helper
description: تفعيل عندما يطلب المستخدم "إيداع التغييرات" أو "إنشاء commit"
triggers:
  - commit changes
  - create commit
---

## سير العمل

1. تجهيز التغييرات باستخدام `git add`
2. إنشاء رسالة الإيداع بناءً على diff
3. إنشاء الإيداع باستخدام `git commit`
```

> **المهارات مجرد markdown.** سهلة الكتابة، سهلة المشاركة، تُدار نسخياً مع الكود الخاص بك.

<br/>

## 🤔 ما المشكلة التي يحلها Skillbolt؟

في كل مرة تستخدم مساعد البرمجة بالذكاء الاصطناعي، تكرر نفس التعليمات — _"اتبع conventional commits"_، _"استخدم أسلوب كود فريقنا"_، _"تحقق من مشاكل الأمان"_...

**الذكاء الاصطناعي ينسى. في كل. مرة.**

يحل Skillbolt هذه المشكلة بتحويل تعليماتك إلى **مهارات قابلة لإعادة الاستخدام** — ويذهب أبعد مع الاكتشاف المدعوم بـ LLM والتنفيذ الذكي:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 إنشاء</h3>
<p>أنشئ المهارات مرة واحدة كملفات markdown محمولة. يعمل مع Claude Code و Cursor و Codex والمزيد.</p>
</td>
<td width="33%" align="center">
<h3>🧠 اكتشاف</h3>
<p>شجرة قدرات مدعومة بـ LLM + بحث ذكي يجد المهارات المناسبة لأي مهمة تلقائياً.</p>
</td>
<td width="33%" align="center">
<h3>🚀 تنفيذ</h3>
<p>خطط DAG مُولَّدة تلقائياً تُنسق سير العمل متعدد المهارات مع التنفيذ المتوازي وتتبع التكاليف.</p>
</td>
</tr>
</table>

<br/>

## ✨ الميزات

**دورة حياة المهارة**

- ⚡ **سير عمل CLI-أولاً** — إنشاء وتحقق وتعبئة ونشر المهارات
- 🧬 **تقطير المهارات** — استخراج مهارات قابلة لإعادة الاستخدام من محادثات الوكلاء
- 📦 **حزم معيارية** — استخدم الحزمة الكاملة أو ما تحتاجه فقط

**الاكتشاف والتوجيه**

- 🌳 **تصنيف القدرات** — تنظيم مئات المهارات في شجرة قابلة للتنقل
- 🔍 **استرجاع ذكي** — مطابقة سريعة مع التقليم + الترتيب عبر مستويات الشجرة

**التنسيق والرؤية**

- 📊 **تخطيط DAG** — تركيب المهارات في خطط تنفيذ قابلة للتوازي
- 🖥️ **لوحة تحكم ويب** — حالة التنفيذ والسجلات وعارض DAG في الوقت الفعلي
- 🐾 **مزامنة OpenClaw** — مشاركة المهارات عبر قنوات الوكلاء المتعددة

<br/>

## 🚀 البدء السريع

### 1. التثبيت

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>مديرو حزم آخرون</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (بدون تثبيت)
```

</details>

### 2. التكوين

قم بتعيين مزود LLM الخاص بك حتى يتمكن Skillbolt من تشغيل الميزات الذكية:

```bash
export LLM_API_KEY=sk-...                  # مفتاح OpenAI أو Anthropic الخاص بك
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>اختياري: تكوين على مستوى المشروع</summary>

أنشئ `.skillboltrc.json` في جذر مشروعك:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

راجع **[دليل التكوين](../configuration.md)** لجميع الخيارات.

</details>

### 3. إنشاء أول مهارة

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. اكتشاف وتثبيت المهارات

```bash
skill search git                           # تصفح السوق
skill install github:skillbolt/git-master  # التثبيت من GitHub
```

### 5. التحقق

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 التوثيق

📖 **[تصفح التوثيق الكامل](../index.md)** — جميع الأدلة والمراجع ووثائق البنية على GitHub

### البدء

- **[دليل التثبيت](../getting-started.md)** — المتطلبات المسبقة والإعداد ومشروعك الأول مع Skillbolt
- **[تنسيق SKILL.md](../skill-format.md)** — مواصفات ملف المهارة — المُحفزات وسير العمل والمعاملات والبيانات الوصفية
- **[مرجع الأوامر](../commands.md)** — توثيق كامل لجميع أوامر CLI الـ 20+
- **[التكوين](../configuration.md)** — متغيرات البيئة و `.skillboltrc.json` وإعدادات مزود LLM

### المفاهيم الأساسية

- **[ذكاء وقت التشغيل](../runtime-intelligence.md)** — أشجار القدرات والبحث الذكي وتنسيق DAG ولوحة التحكم المرئية
- **[أشجار القدرات](../runtime-intelligence.md#capability-tree)** — التصنيف المدعوم بـ LLM ينظم مئات المهارات في تسلسلات هرمية قابلة للتنقل
- **[البحث الذكي](../runtime-intelligence.md#intelligent-search)** — اجتياز متعدد المستويات للشجرة مع تقليم تلقائي يجد أفضل المهارات لأي مهمة
- **[تنسيق DAG](../runtime-intelligence.md#dag-orchestration--execution)** — ركّب المهارات في خطط تنفيذ قابلة للتوازي من أوصاف اللغة الطبيعية
- **[تقطير المهارات](../skill-format.md#distillation)** — استخرج مهارات قابلة لإعادة الاستخدام من سجل محادثات الذكاء الاصطناعي الحقيقي

### البنية والتكامل

- **[مرجع API](../api-reference.md)** — الاستخدام البرمجي لبناء التكاملات والخطوط المخصصة
- **[بنية الحزم](../api-reference.md#packages)** — 17 حزمة معيارية — استخدم CLI الكامل أو اختر المكونات الفردية
- **[تكامل OpenClaw](../openclaw-integration.md)** — مزامنة ومشاركة المهارات عبر 13+ قناة مراسلة عبر بوابة OpenClaw
- **[الدعم عبر المنصات](../skill-format.md#platforms)** — اكتب مرة واحدة، شغّل على Claude Code و Cursor و Codex CLI و Continue والمزيد

### التطوير

- **[المساهمة](../../CONTRIBUTING.md)** — إعداد التطوير وتعليمات البناء والاختبار وسير عمل PR
- **[مشاكل GitHub](https://github.com/TacoSkill/Skill-Kit/issues)** — تقارير الأخطاء وطلبات الميزات ومناقشات خارطة الطريق
- **[مجتمع Discord](https://discord.gg/u34Tg5pQ)** — احصل على المساعدة وشارك المهارات وتواصل مع مطورين آخرين

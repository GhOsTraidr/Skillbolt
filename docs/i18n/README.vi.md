<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## Hệ sinh thái kỹ năng toàn cầu cho các tác nhân AI.

<small>Xây dựng một lần. Tái sử dụng mọi nơi. Chạy kỹ năng trên Claude Code, Cursor, OpenClaw và nhiều hơn nữa.</small>

</div>

<p><b>🎨 Hoạt động với bất kỳ tác nhân AI nào hỗ trợ tệp kỹ năng/hướng dẫn</b></p>

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
  <sub><b>+ Tác nhân<br/>Tùy chỉnh</b></sub>
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
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="Giấy phép"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-hoan%20nghênh-brightgreen?style=flat-square" alt="PRs Hoan nghênh"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Tham%20gia-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Theo%20dõi-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Nhóm-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 Quét để tham gia Nhóm WeChat</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Bắt đầu nhanh](#-bắt-đầu-nhanh) • [Tính năng](#-tính-năng) • [Tài liệu](#-tài-liệu)

</div>

</div>

<br/>

## 📖 Skill là gì?

**Skill** là tệp hướng dẫn di động cho các tác nhân AI. Nó định nghĩa các trigger, quy trình làm việc và tham số:

```markdown
---
name: git-commit-helper
description: Kích hoạt khi người dùng yêu cầu "commit thay đổi" hoặc "tạo commit"
triggers:
  - commit changes
  - create commit
---

## Quy trình làm việc

1. Chuẩn bị thay đổi với `git add`
2. Tạo thông điệp commit dựa trên diff
3. Tạo commit với `git commit`
```

> **Skill chỉ là markdown.** Dễ viết, dễ chia sẻ, quản lý phiên bản cùng với code của bạn.

<br/>

## 🤔 Skillbolt giải quyết vấn đề gì?

Mỗi lần bạn sử dụng trợ lý lập trình AI, bạn lặp lại các hướng dẫn giống nhau — _"tuân theo conventional commits"_, _"sử dụng phong cách code của chúng tôi"_, _"kiểm tra vấn đề bảo mật"_...

**AI của bạn quên. Mỗi. Lần.**

Skillbolt giải quyết vấn đề này bằng cách biến hướng dẫn của bạn thành **Skill có thể tái sử dụng** — và tiến xa hơn với khám phá được hỗ trợ bởi LLM và thực thi thông minh:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Tạo</h3>
<p>Tạo skill một lần dưới dạng tệp markdown di động. Hoạt động với Claude Code, Cursor, Codex và nhiều hơn nữa.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Khám phá</h3>
<p>Cây khả năng được hỗ trợ bởi LLM + tìm kiếm thông minh tự động tìm skill phù hợp cho bất kỳ tác vụ nào.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Thực thi</h3>
<p>Kế hoạch DAG tự động sinh ra điều phối quy trình làm việc đa skill với thực thi song song và theo dõi chi phí.</p>
</td>
</tr>
</table>

<br/>

## ✨ Tính năng

**Vòng đời Skill**

- ⚡ **Quy trình làm việc CLI-first** — tạo, xác thực, đóng gói và xuất bản Skill
- 🧬 **Chưng cất skill** — trích xuất Skill có thể tái sử dụng từ các cuộc hội thoại với tác nhân
- 📦 **Gói mô-đun** — sử dụng toàn bộ stack hoặc chỉ những gì bạn cần

**Khám phá và định tuyến**

- 🌳 **Phân loại khả năng** — tổ chức hàng trăm Skill vào cây có thể điều hướng
- 🔍 **Truy xuất thông minh** — khớp nhanh với cắt tỉa + xếp hạng qua các cấp độ cây

**Điều phối và khả năng hiển thị**

- 📊 **Lập kế hoạch DAG** — soạn Skill thành các kế hoạch thực thi có thể song song hóa
- 🖥️ **Bảng điều khiển web** — trạng thái chạy, log và trình xem DAG theo thời gian thực
- 🐾 **Đồng bộ OpenClaw** — chia sẻ Skill qua các bề mặt tác nhân đa kênh

<br/>

## 🚀 Bắt đầu nhanh

### 1. Cài đặt

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Các trình quản lý gói khác</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (không cài đặt)
```

</details>

### 2. Cấu hình

Đặt nhà cung cấp LLM của bạn để Skillbolt có thể cung cấp các tính năng thông minh:

```bash
export LLM_API_KEY=sk-...                  # Khóa OpenAI hoặc Anthropic của bạn
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>Tùy chọn: cấu hình cấp dự án</summary>

Tạo `.skillboltrc.json` trong thư mục gốc dự án của bạn:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Xem **[Hướng dẫn Cấu hình](../configuration.md)** để biết tất cả các tùy chọn.

</details>

### 3. Tạo Skill đầu tiên của bạn

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Khám phá và Cài đặt Skill

```bash
skill search git                           # Duyệt marketplace
skill install github:skillbolt/git-master  # Cài đặt từ GitHub
```

### 5. Xác thực

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Tài liệu

📖 **[Duyệt Tài liệu đầy đủ](../index.md)** — Tất cả hướng dẫn, tham chiếu và tài liệu kiến trúc trên GitHub

### Bắt đầu

- **[Hướng dẫn Cài đặt](../getting-started.md)** — Điều kiện tiên quyết, thiết lập và dự án Skillbolt đầu tiên của bạn
- **[Định dạng SKILL.md](../skill-format.md)** — Đặc tả tệp skill — trigger, quy trình làm việc, tham số và metadata
- **[Tham chiếu Lệnh](../commands.md)** — Tài liệu đầy đủ cho tất cả 20+ lệnh CLI
- **[Cấu hình](../configuration.md)** — Biến môi trường, `.skillboltrc.json` và cài đặt nhà cung cấp LLM

### Khái niệm Cốt lõi

- **[Trí tuệ Runtime](../runtime-intelligence.md)** — Cây khả năng, tìm kiếm thông minh, điều phối DAG và bảng điều khiển trực quan
- **[Cây Khả năng](../runtime-intelligence.md#capability-tree)** — Phân loại được hỗ trợ bởi LLM tổ chức hàng trăm skill vào các hệ thống phân cấp có thể điều hướng
- **[Tìm kiếm Thông minh](../runtime-intelligence.md#intelligent-search)** — Duyệt cây đa cấp với cắt tỉa tự động tìm skill tốt nhất cho bất kỳ tác vụ nào
- **[Điều phối DAG](../runtime-intelligence.md#dag-orchestration--execution)** — Soạn skill thành các kế hoạch thực thi có thể song song hóa từ mô tả ngôn ngữ tự nhiên
- **[Chưng cất Skill](../skill-format.md#distillation)** — Trích xuất skill có thể tái sử dụng từ lịch sử hội thoại AI thực tế

### Kiến trúc và Tích hợp

- **[Tham chiếu API](../api-reference.md)** — Sử dụng lập trình để xây dựng các tích hợp và pipeline tùy chỉnh
- **[Kiến trúc Gói](../api-reference.md#packages)** — 17 gói mô-đun — sử dụng CLI đầy đủ hoặc chọn các thành phần riêng lẻ
- **[Tích hợp OpenClaw](../openclaw-integration.md)** — Đồng bộ và chia sẻ skill qua 13+ kênh nhắn tin thông qua cổng OpenClaw
- **[Hỗ trợ Đa nền tảng](../skill-format.md#platforms)** — Viết một lần, chạy trên Claude Code, Cursor, Codex CLI, Continue và nhiều hơn nữa

### Phát triển

- **[Đóng góp](../../CONTRIBUTING.md)** — Thiết lập phát triển, hướng dẫn build, testing và quy trình PR
- **[Issues GitHub](https://github.com/TacoSkill/Skill-Kit/issues)** — Báo cáo lỗi, yêu cầu tính năng và thảo luận lộ trình
- **[Cộng đồng Discord](https://discord.gg/u34Tg5pQ)** — Nhận trợ giúp, chia sẻ skill và kết nối với các nhà phát triển khác

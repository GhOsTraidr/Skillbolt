<div align="center">

<img src="../../figs/skillbolt_logo.png" alt="Skillbolt" width="320" />

<div align="center">

## AI ajanları için evrensel beceri ekosistemi.

<small>Bir kez oluştur. Her yerde yeniden kullan. Becerileri Claude Code, Cursor, OpenClaw ve daha fazlasında çalıştır.</small>

</div>

<p><b>🎨 Beceri/talimat dosyalarını destekleyen herhangi bir AI ajanıyla çalışır</b></p>

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
  <sub><b>+ Özel<br/>Ajanlar</b></sub>
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
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-3178C6?style=flat-square" alt="Lisans"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="../../CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-hoşgeldiniz-brightgreen?style=flat-square" alt="PR'lar Hoşgeldiniz"></a>
  <br>
  <a href="https://discord.gg/u34Tg5pQ"><img src="https://img.shields.io/badge/Discord-Katıl-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/skillbolt2026"><img src="https://img.shields.io/badge/Twitter-Takip%20Et-000000?style=flat-square&logo=x&logoColor=white" alt="Twitter"></a>
  <a href="#wechat"><img src="https://img.shields.io/badge/WeChat-Grup-07C160?style=flat-square&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<details id="wechat">
<summary>📱 WeChat Grubuna Katılmak İçin Tarayın</summary>
<br/>
<img src="../../assets/skill_wechat.JPG" alt="WeChat QR" width="200">
</details>

<br/>

[Hızlı Başlangıç](#-hızlı-başlangıç) • [Özellikler](#-özellikler) • [Dokümantasyon](#-dokümantasyon)

</div>

</div>

<br/>

## 📖 Skill Nedir?

Bir **Skill**, AI ajanları için taşınabilir bir talimat dosyasıdır. Tetikleyicileri, iş akışlarını ve parametreleri tanımlar:

```markdown
---
name: git-commit-helper
description: Kullanıcı "değişiklikleri commit et" veya "commit oluştur" istediğinde etkinleştir
triggers:
  - commit changes
  - create commit
---

## İş Akışı

1. Değişiklikleri `git add` ile hazırla
2. Diff'e dayalı commit mesajı oluştur
3. `git commit` ile commit oluştur
```

> **Skill'ler sadece markdown.** Yazması kolay, paylaşması kolay, kodunuzla birlikte sürüm kontrolü yapılabilir.

<br/>

## 🤔 Skillbolt Hangi Sorunu Çözer?

Bir AI kodlama asistanı her kullandığınızda, aynı talimatları tekrar edersiniz — _"conventional commits'i takip et"_, _"kod stilimizi kullan"_, _"güvenlik sorunlarını kontrol et"_...

**AI'nız unutur. Her. Seferinde.**

Skillbolt bunu talimatlarınızı **yeniden kullanılabilir Skill'lere** dönüştürerek çözer — ve LLM destekli keşif ve akıllı yürütme ile daha da ileri gider:

<br/>

<table>
<tr>
<td width="33%" align="center">
<h3>🎯 Oluştur</h3>
<p>Skill'leri bir kez taşınabilir markdown dosyaları olarak yaz. Claude Code, Cursor, Codex ve daha fazlasıyla çalışır.</p>
</td>
<td width="33%" align="center">
<h3>🧠 Keşfet</h3>
<p>LLM destekli yetenek ağacı + akıllı arama herhangi bir görev için doğru skill'leri otomatik olarak bulur.</p>
</td>
<td width="33%" align="center">
<h3>🚀 Çalıştır</h3>
<p>Otomatik oluşturulan DAG planları paralel yürütme ve maliyet takibi ile çoklu skill iş akışlarını düzenler.</p>
</td>
</tr>
</table>

<br/>

## ✨ Özellikler

**Skill yaşam döngüsü**

- ⚡ **CLI-öncelikli iş akışı** — Skill'leri oluştur, doğrula, paketle ve yayınla
- 🧬 **Skill damıtma** — Ajan konuşmalarından yeniden kullanılabilir Skill'ler çıkar
- 📦 **Modüler paketler** — Tam yığını veya sadece ihtiyacınız olanı kullanın

**Keşif ve yönlendirme**

- 🌳 **Yetenek taksonomisi** — Yüzlerce Skill'i gezinebilir bir ağaçta organize et
- 🔍 **Akıllı geri getirme** — Ağaç seviyeleri arasında budama + sıralama ile hızlı eşleştirme

**Orkestrasyon ve görünürlük**

- 📊 **DAG planlama** — Skill'leri paralelleştirilebilir yürütme planlarına dönüştür
- 🖥️ **Web panosu** — Gerçek zamanlı çalışma durumu, loglar ve DAG görüntüleyici
- 🐾 **OpenClaw senkronizasyonu** — Skill'leri çok kanallı ajan yüzeyleri arasında paylaş

<br/>

## 🚀 Hızlı Başlangıç

### 1. Yükle

```bash
npm install -g @skillbolt/cli
```

<details>
<summary>Diğer paket yöneticileri</summary>

```bash
pnpm add -g @skillbolt/cli    # pnpm
npx @skillbolt/cli --help      # npx (yükleme yok)
```

</details>

### 2. Yapılandır

Skillbolt'un akıllı özellikleri desteklemesi için LLM sağlayıcınızı ayarlayın:

```bash
export LLM_API_KEY=sk-...                  # OpenAI veya Anthropic anahtarınız
export LLM_PROVIDER=openai                 # "openai" | "anthropic"
```

<details>
<summary>İsteğe bağlı: proje düzeyinde yapılandırma</summary>

Proje kökünüzde `.skillboltrc.json` oluşturun:

```json
{
  "llm": { "provider": "openai", "model": "gpt-4o-mini" }
}
```

Tüm seçenekler için **[Yapılandırma Rehberi](../configuration.md)**'ne bakın.

</details>

### 3. İlk Skill'inizi Oluşturun

```bash
skill init my-skill --template standard --platform claude-code
```

### 4. Skill'leri Keşfedin ve Yükleyin

```bash
skill search git                           # Pazarı gözat
skill install github:skillbolt/git-master  # GitHub'dan yükle
```

### 5. Doğrula

```bash
skill lint ./my-skill --fix
```

<br/>

## 📚 Dokümantasyon

📖 **[Tam Dokümantasyona Göz At](../index.md)** — GitHub'daki tüm rehberler, referanslar ve mimari dökümanları

### Başlarken

- **[Kurulum Rehberi](../getting-started.md)** — Ön koşullar, kurulum ve ilk Skillbolt projeniz
- **[SKILL.md Formatı](../skill-format.md)** — Skill dosya spesifikasyonu — tetikleyiciler, iş akışları, parametreler ve metadata
- **[Komut Referansı](../commands.md)** — Tüm 20+ CLI komutu için tam dokümantasyon
- **[Yapılandırma](../configuration.md)** — Ortam değişkenleri, `.skillboltrc.json` ve LLM sağlayıcı ayarları

### Temel Kavramlar

- **[Çalışma Zamanı Zekası](../runtime-intelligence.md)** — Yetenek ağaçları, akıllı arama, DAG orkestrasyonu ve görsel pano
- **[Yetenek Ağaçları](../runtime-intelligence.md#capability-tree)** — LLM destekli sınıflandırma yüzlerce skill'i gezinebilir hiyerarşilere organize eder
- **[Akıllı Arama](../runtime-intelligence.md#intelligent-search)** — Otomatik budama ile çok seviyeli ağaç geçişi herhangi bir görev için en iyi skill'leri bulur
- **[DAG Orkestrasyonu](../runtime-intelligence.md#dag-orchestration--execution)** — Doğal dil açıklamalarından skill'leri paralelleştirilebilir yürütme planlarına dönüştür
- **[Skill Damıtma](../skill-format.md#distillation)** — Gerçek AI konuşma geçmişinden yeniden kullanılabilir skill'ler çıkar

### Mimari ve Entegrasyon

- **[API Referansı](../api-reference.md)** — Özel entegrasyonlar ve pipeline'lar oluşturmak için programatik kullanım
- **[Paket Mimarisi](../api-reference.md#packages)** — 17 modüler paket — tam CLI'yi veya bireysel bileşenleri seçin
- **[OpenClaw Entegrasyonu](../openclaw-integration.md)** — OpenClaw gateway üzerinden 13+ mesajlaşma kanalında skill'leri senkronize edin ve paylaşın
- **[Çapraz Platform Desteği](../skill-format.md#platforms)** — Bir kez yaz, Claude Code, Cursor, Codex CLI, Continue ve daha fazlasında çalıştır

### Geliştirme

- **[Katkıda Bulunma](../../CONTRIBUTING.md)** — Geliştirme kurulumu, build talimatları, test ve PR iş akışı
- **[GitHub Issues](https://github.com/TacoSkill/Skill-Kit/issues)** — Hata raporları, özellik istekleri ve yol haritası tartışmaları
- **[Discord Topluluğu](https://discord.gg/u34Tg5pQ)** — Yardım alın, skill'leri paylaşın ve diğer geliştiricilerle bağlantı kurun

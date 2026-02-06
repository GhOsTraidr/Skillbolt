# Configuration Guide

This document explains all configuration options for Skill Kit.

## Table of Contents

- [Configuration Files](#configuration-files)
- [Global Configuration](#global-configuration)
- [Project Configuration](#project-configuration)
- [Lint Configuration](#lint-configuration)
- [Environment Variables](#environment-variables)
- [Configuration Precedence](#configuration-precedence)

## Configuration Files

Skill Kit uses two levels of configuration:

| Level   | Location                        | Purpose                   |
| ------- | ------------------------------- | ------------------------- |
| Global  | `~/.skillbolt/config.json`      | User-wide defaults        |
| Project | `.skillboltrc.*` in project root | Project-specific settings |

### Supported Project Config Formats

Skill Kit automatically detects configuration files in the following order:

1. `.skillboltrc`
2. `.skillboltrc.json`
3. `.skillboltrc.yaml`
4. `.skillboltrc.yml`
5. `.skillboltrc.js`
6. `.skillboltrc.cjs`
7. `skillbolt.config.js`
8. `skillbolt.config.cjs`

## Global Configuration

The global configuration file is located at `~/.skillbolt/config.json`.

### Full Schema

```json
{
  "registry": {
    "remote": "https://skillbolt.com/api",
    "cache": "~/.skillbolt/cache"
  },
  "sync": {
    "provider": "supabase",
    "autoSync": false
  },
  "analytics": {
    "enabled": true,
    "anonymous": true
  },
  "defaults": {
    "platform": "claude-code",
    "template": "standard"
  }
}
```

### Options

#### registry

Configure the skill registry.

| Option   | Type   | Default                       | Description           |
| -------- | ------ | ----------------------------- | --------------------- |
| `remote` | string | `"https://skillbolt.com/api"` | Remote registry URL   |
| `cache`  | string | `"~/.skillbolt/cache"`        | Local cache directory |

#### sync

Configure cloud sync settings.

| Option     | Type    | Default      | Description                          |
| ---------- | ------- | ------------ | ------------------------------------ |
| `provider` | string  | `"supabase"` | Sync provider (`supabase`, `custom`) |
| `autoSync` | boolean | `false`      | Enable automatic syncing             |

#### analytics

Configure usage analytics.

| Option      | Type    | Default | Description                 |
| ----------- | ------- | ------- | --------------------------- |
| `enabled`   | boolean | `true`  | Enable analytics collection |
| `anonymous` | boolean | `true`  | Anonymize collected data    |

#### defaults

Configure default values for commands.

| Option     | Type   | Default         | Description             |
| ---------- | ------ | --------------- | ----------------------- |
| `platform` | string | `"claude-code"` | Default target platform |
| `template` | string | `"standard"`    | Default skill template  |

### Example

```json
{
  "registry": {
    "remote": "https://my-company.skillbolt.com/api",
    "cache": "/tmp/skill-cache"
  },
  "sync": {
    "provider": "supabase",
    "autoSync": true
  },
  "analytics": {
    "enabled": true,
    "anonymous": true
  },
  "defaults": {
    "platform": "cursor",
    "template": "advanced"
  }
}
```

## Project Configuration

Project configuration is placed in the project root directory.

### Full Schema

```json
{
  "extends": "recommended",
  "lint": {
    "extends": "recommended",
    "rules": {},
    "ignore": []
  },
  "test": {
    "timeout": 5000
  }
}
```

### Options

#### extends

Extend a preset configuration.

| Value           | Description                                |
| --------------- | ------------------------------------------ |
| `"recommended"` | Recommended settings (default)             |
| `"strict"`      | Strict settings with all rules enabled     |
| `"minimal"`     | Minimal settings with only essential rules |

#### lint

Lint configuration. See [Lint Configuration](#lint-configuration) for details.

#### test

Test configuration.

| Option    | Type   | Default | Description                  |
| --------- | ------ | ------- | ---------------------------- |
| `timeout` | number | `5000`  | Test timeout in milliseconds |

### Example (.skillboltrc.json)

```json
{
  "extends": "recommended",
  "lint": {
    "rules": {
      "format/frontmatter-required": "error",
      "style/description-format": "error",
      "best/max-length": ["warn", { "max": 5000 }]
    },
    "ignore": ["**/node_modules/**", "**/*.backup.md"]
  },
  "test": {
    "timeout": 10000
  }
}
```

### Example (.skillboltrc.yaml)

```yaml
extends: recommended
lint:
  rules:
    format/frontmatter-required: error
    style/description-format: error
    best/max-length:
      - warn
      - max: 5000
  ignore:
    - '**/node_modules/**'
    - '**/*.backup.md'
test:
  timeout: 10000
```

### Example (skillbolt.config.js)

```javascript
module.exports = {
  extends: 'recommended',
  lint: {
    rules: {
      'format/frontmatter-required': 'error',
      'style/description-format': 'error',
      'best/max-length': ['warn', { max: 5000 }],
    },
    ignore: ['**/node_modules/**', '**/*.backup.md'],
  },
  test: {
    timeout: 10000,
  },
};
```

## Lint Configuration

Detailed configuration for the linter.

### Schema

```json
{
  "lint": {
    "extends": "recommended",
    "rules": {
      "rule-id": "off" | "warn" | "error" | ["warn" | "error", options]
    },
    "ignore": ["pattern1", "pattern2"]
  }
}
```

### Rule Severity Levels

| Level     | Description                      |
| --------- | -------------------------------- |
| `"off"`   | Disable the rule                 |
| `"warn"`  | Report as warning (doesn't fail) |
| `"error"` | Report as error (causes failure) |

### Presets

#### recommended

The default preset with balanced rules.

```json
{
  "format/frontmatter-required": "error",
  "format/frontmatter-fields": "error",
  "format/sections-required": "error",
  "format/section-not-empty": "warn",
  "style/description-format": "error",
  "best/max-length": "warn",
  "best/examples-exist": "warn",
  "best/triggers-count": "warn",
  "best/steps-count": "warn",
  "references/no-broken-links": "error"
}
```

#### strict

All rules enabled at error level.

```json
{
  "format/frontmatter-required": "error",
  "format/frontmatter-fields": "error",
  "format/sections-required": "error",
  "format/section-not-empty": "error",
  "style/description-format": "error",
  "best/max-length": "error",
  "best/examples-exist": "error",
  "best/triggers-count": "error",
  "best/steps-count": "error",
  "references/no-broken-links": "error"
}
```

#### minimal

Only essential rules.

```json
{
  "format/frontmatter-required": "error",
  "format/frontmatter-fields": "error"
}
```

### Available Rules

#### Format Rules

| Rule ID                       | Description                     | Options                  |
| ----------------------------- | ------------------------------- | ------------------------ |
| `format/frontmatter-required` | Frontmatter must exist          | -                        |
| `format/frontmatter-fields`   | Required fields must be present | `{ fields: string[] }`   |
| `format/sections-required`    | Required sections must exist    | `{ sections: string[] }` |
| `format/section-not-empty`    | Sections cannot be empty        | -                        |

#### Style Rules

| Rule ID                    | Description                    | Options               |
| -------------------------- | ------------------------------ | --------------------- |
| `style/description-format` | Description must follow format | `{ pattern: string }` |

#### Best Practices Rules

| Rule ID               | Description             | Options                        |
| --------------------- | ----------------------- | ------------------------------ |
| `best/max-length`     | Maximum content length  | `{ max: number }`              |
| `best/examples-exist` | Must include examples   | -                              |
| `best/triggers-count` | Minimum trigger phrases | `{ min: number }`              |
| `best/steps-count`    | Workflow steps count    | `{ min: number, max: number }` |

#### Reference Rules

| Rule ID                      | Description     | Options |
| ---------------------------- | --------------- | ------- |
| `references/no-broken-links` | No broken links | -       |

### Rule Configuration Examples

```json
{
  "lint": {
    "rules": {
      // Disable a rule
      "best/examples-exist": "off",

      // Set severity only
      "format/frontmatter-required": "error",

      // With options
      "best/max-length": ["warn", { "max": 5000 }],
      "best/triggers-count": ["error", { "min": 2 }],
      "best/steps-count": ["warn", { "min": 2, "max": 10 }]
    }
  }
}
```

### Ignore Patterns

Use glob patterns to exclude files from linting.

```json
{
  "lint": {
    "ignore": ["**/node_modules/**", "**/dist/**", "**/*.backup.md", "**/drafts/**"]
  }
}
```

## Environment Variables

Some settings can be configured via environment variables.

| Variable             | Description              | Default                     |
| -------------------- | ------------------------ | --------------------------- |
| `SKILL_KIT_HOME`     | Skill Kit home directory | `~/.skillbolt`              |
| `SKILL_KIT_CACHE`    | Cache directory          | `~/.skillbolt/cache`        |
| `SKILL_KIT_REGISTRY` | Registry URL             | `https://skillbolt.com/api` |
| `SKILL_KIT_NO_COLOR` | Disable colored output   | `false`                     |
| `SKILL_KIT_DEBUG`    | Enable debug logging     | `false`                     |

### Example

```bash
# Set custom home directory
export SKILL_KIT_HOME=/custom/path/.skillbolt

# Disable colors
export SKILL_KIT_NO_COLOR=1

# Enable debug mode
export SKILL_KIT_DEBUG=1

# Run command
skill lint ./my-skill
```

## Configuration Precedence

When multiple configuration sources exist, they are merged in the following order (later sources override earlier ones):

1. **Built-in defaults**
2. **Global configuration** (`~/.skillbolt/config.json`)
3. **Project configuration** (`.skillboltrc.*`)
4. **Environment variables**
5. **Command-line arguments**

### Example

```bash
# Global config sets platform to "claude-code"
# Project config sets platform to "cursor"
# CLI argument overrides to "codex"

skill init my-skill --platform codex
# Result: platform = "codex"
```

## Creating Configuration

### Initialize Global Config

```bash
# Create default global config
mkdir -p ~/.skillbolt
cat > ~/.skillbolt/config.json << 'EOF'
{
  "defaults": {
    "platform": "claude-code",
    "template": "standard"
  }
}
EOF
```

### Initialize Project Config

```bash
# Create project config interactively
skill config init

# Or create manually
cat > .skillboltrc.json << 'EOF'
{
  "extends": "recommended",
  "lint": {
    "rules": {
      "best/max-length": ["warn", { "max": 5000 }]
    }
  }
}
EOF
```

### Validate Configuration

```bash
# Check if configuration is valid
skill config validate

# Show resolved configuration
skill config show
```

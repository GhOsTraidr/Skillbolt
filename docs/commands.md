# Command Reference

Complete reference for all commands provided by Skill Kit.

## Table of Contents

- [global options](#global-options)
- [skill init](#skill-init)
- [skill lint](#skill-lint)
- [skill search](#skill-search)
- [skill install](#skill-install)
- [skill list](#skill-list)
- [skill update](#skill-update)
- [skill remove](#skill-remove)
- [skill outdated](#skill-outdated)
- [skill distill](#skill-distill)
- [skill convert](#skill-convert)
- [skill test](#skill-test)
- [skill sync](#skill-sync)
- [skill analytics](#skill-analytics)
- [skill compose](#skill-compose)
- [skill doc](#skill-doc)

---

## Global Options

All commands support the following global options:

| Option            | Short | Description            |
| ----------------- | ----- | ---------------------- |
| `--version`       | `-V`  | Show version number    |
| `--help`          | `-h`  | Show help information  |
| `--verbose`       | `-v`  | Verbose output         |
| `--quiet`         | `-q`  | Silent mode            |
| `--config <path>` | -     | Specify config file    |
| `--no-color`      | -     | Disable colored output |

### Examples

```bash
# Show version
skill --version

# Show general help
skill --help

# Show command-specific help
skill init --help
skill lint --help

# Enable verbose output
skill install ./my-skill --verbose

# Silent mode
skill lint ./skills --quiet

# Use custom config
skill lint --config .skilllintrc.json

# Disable colors in CI
skill lint ./skills --no-color
```

---

## skill init

Initialize a new Skill project.

### Syntax

```bash
skill init <directory>
```

### Arguments

| Argument    | Description                |
| ----------- | -------------------------- |
| `directory` | Target directory for skill |

### Options

| Option                | Short | Description                  | Default    |
| --------------------- | ----- | ---------------------------- | ---------- |
| `-n, --name <name>`   | -     | Skill name                   | prompted   |
| `-d, --desc <desc>`   | -     | Skill description            | prompted   |
| `-t, --triggers <ts>` | -     | Triggers (comma-separated)   | prompted   |
| `--template <type>`   | -     | Template type                | `standard` |
| `--platform <type>`   | -     | Target platform              | `claude`   |
| `--no-interactive`    | -     | Skip interactive prompts     | `false`    |
| `-f, --force`         | -     | Overwrite existing directory | `false`    |
| `--author <name>`     | -     | Author name                  | -          |

### Templates

| Template   | Description                              |
| ---------- | ---------------------------------------- |
| `minimal`  | Only SKILL.md file                       |
| `standard` | SKILL.md + README.md + references        |
| `complete` | Full structure with examples and scripts |

### Platforms

| Platform | Description   |
| -------- | ------------- |
| `all`    | All platforms |
| `claude` | Claude Code   |
| `codex`  | Codex CLI     |
| `cursor` | Cursor IDE    |

### Examples

```bash
# Interactive mode with prompts
skill init my-skill

# Non-interactive with all options
skill init my-skill \
  --name "My Skill" \
  --desc "A useful skill" \
  --triggers "help me,show me" \
  --template standard \
  --platform claude \
  --no-interactive

# Minimal template
skill init minimal-skill --template minimal

# Complete template with author
skill init complete-skill --template complete --author "John Doe"

# Force overwrite existing directory
skill init existing-skill --force
```

---

## skill lint

Check Skill file format and best practices.

### Syntax

```bash
skill lint [patterns...]
```

### Arguments

| Argument   | Description                      |
| ---------- | -------------------------------- |
| `patterns` | File/directory patterns to check |

### Options

| Option                | Short | Description                 | Default     |
| --------------------- | ----- | --------------------------- | ----------- |
| `-c, --config <path>` | -     | Config file path            | auto-detect |
| `-f, --format <fmt>`  | -     | Output format               | `stylish`   |
| `--fix`               | -     | Auto-fix issues             | `false`     |
| `--dry-run`           | -     | Show fixes without applying | `false`     |
| `--no-color`          | -     | Disable colored output      | `false`     |
| `--max-warnings <n>`  | -     | Exit code threshold         | unlimited   |

### Output Formats

| Format    | Description                       |
| --------- | --------------------------------- |
| `stylish` | Colored terminal output (default) |
| `json`    | JSON format                       |
| `github`  | GitHub Actions annotation         |

### Lint Rules

#### Format Rules

| Rule                          | Level   |
| ----------------------------- | ------- |
| `format/frontmatter-required` | error   |
| `format/frontmatter-fields`   | error   |
| `format/sections-required`    | error   |
| `format/section-not-empty`    | warning |

#### Style Rules

| Rule                       | Level |
| -------------------------- | ----- |
| `style/description-format` | error |

#### Best Practices

| Rule                  | Level   |
| --------------------- | ------- |
| `best/max-length`     | warning |
| `best/examples-exist` | warning |
| `best/triggers-count` | warning |
| `best/steps-count`    | warning |

### Examples

```bash
# Lint single file
skill lint ./SKILL.md

# Lint directory
skill lint ./skills/

# Lint with specific patterns
skill lint ./skills/*/SKILL.md

# Auto-fix issues (raise errors for those cannot be fixed)
skill lint ./my-skill --fix

# Dry-run to preview fixes
skill lint ./my-skill --fix --dry-run

# JSON output for CI
skill lint ./skills --format json --max-warnings 0

# Use custom config
skill lint ./skills --config .skilllintrc.json
```

---

## skill search

Search for skills on the SkillHub platform and optionally open the result page in a browser.

### Syntax

```bash
skill search [query]
```

### Arguments

| Argument | Description               |
| -------- | ------------------------- |
| `query`  | Search keyword (optional) |

### Options

| Option             | Short | Description                                           | Default |
| ------------------ | ----- | ----------------------------------------------------- | ------- |
| `-n, --no-browser` | -     | Only display URL without opening in browser           | `false` |
| `-w, --web`        | -     | Open SkillHub homepage directly (ignore search query) | `false` |

### Examples

```bash
# Open SkillHub homepage in browser
skill search

# Search for specific skill and open results in browser
skill search "python automation"

# Only show search URL without opening browser
skill search "machine learning" --no-browser

# Open SkillHub homepage directly (ignore any query)
skill search "data analysis" --web

# Open homepage without browser
skill search --web --no-browser
```

---

## skill install

Install a Skill from various sources.

### Syntax

```bash
skill install <target>
```

### Arguments

| Argument | Description                        |
| -------- | ---------------------------------- |
| `target` | Installation source (path, GitHub) |

### Options

| Option              | Short | Description            | Default |
| ------------------- | ----- | ---------------------- | ------- |
| `-l, --link`        | -     | Create symlink instead | `false` |
| `-f, --force`       | -     | Force overwrite        | `false` |
| `-v, --version <v>` | -     | Specific version       | latest  |

### Source Formats

| Source | Format             | Example                      |
| ------ | ------------------ | ---------------------------- |
| Local  | `./path`           | `./my-skill`                 |
| GitHub | `github:user/repo` | `github:username/skill-repo` |

### Examples

```bash
# Install from local path
skill install ./my-skill

# Install from GitHub
skill install github:username/skill-repo
# Ensure SKILL.md in this directory
skill install https://github.com/anthropics/claude-code/tree/main/plugins/claude-opus-4-5-migration/skills/claude-opus-4-5-migration

# Install from Skillbolt
skill install full-name-in-skillbolt
# Ensure this full name including the publisher
skill install anthropics-skills-doc-coauthoring

# Install with specific version
skill install github:username/skill-repo --version v1.0.0

# Force reinstall
skill install ./my-skill --force

# Create symlink instead of copy
skill install ./my-skill --link
```

---

## skill list

List installed Skills.

### Syntax

```bash
skill list
```

### Options

| Option               | Short | Description            | Default |
| -------------------- | ----- | ---------------------- | ------- |
| `-j, --json`         | -     | JSON format output     | `false` |
| `-f, --filter <pat>` | -     | Filter by name pattern | -       |

### Examples

```bash
# List all skills
skill list

# JSON output
skill list --json

# Filter by pattern
skill list --filter "git-*"
```

---

## skill update

Update installed Skills.

### Syntax

```bash
skill update [name]
```

### Arguments

| Argument | Description           |
| -------- | --------------------- |
| `name`   | Skill name (optional) |

### Options

| Option              | Short | Description                | Default |
| ------------------- | ----- | -------------------------- | ------- |
| `-f, --force`       | -     | Force update               | `false` |
| `-v, --version <v>` | -     | Update to specific version | -       |

### Examples

```bash
# Update all skills
skill update

# Update specific skill
skill update my-skill

# Update to specific version
skill update my-skill --version v2.0.0

# Force update
skill update my-skill --force
```

---

## skill remove

Remove an installed Skill.

### Syntax

```bash
skill remove <name>
```

### Arguments

| Argument | Description                 |
| -------- | --------------------------- |
| `name`   | Name of the skill to remove |

### Options

| Option        | Short | Description              | Default |
| ------------- | ----- | ------------------------ | ------- |
| `-f, --force` | -     | Skip confirmation prompt | `false` |

### Examples

```bash
# Remove skill (with confirmation)
skill remove my-skill

# Force remove without confirmation
skill remove my-skill --force
```

---

## skill outdated

Check for outdated Skills.

### Syntax

```bash
skill outdated
```

### Examples

```bash
# Check for outdated skills
skill outdated
```

---

## skill distill

Extract Skills from conversation history.

### Syntax

```bash
skill distill <subcommand>
```

### Subcommands

| Subcommand | Description                 |
| ---------- | --------------------------- |
| `run`      | Extract session to SKILL.md |
| `list`     | List available sessions     |
| `show`     | Show session details        |

### distill run

```bash
skill distill run
```

#### Options

| Option                | Short | Description                    | Default     |
| --------------------- | ----- | ------------------------------ | ----------- |
| `-l, --last`          | -     | Use most recent session        | `false`     |
| `-s, --session <id>`  | -     | Specific session ID            | -           |
| `-p, --prompt <text>` | -     | Additional prompt (repeatable) | -           |
| `-o, --output <dir>`  | -     | Output directory               | current dir |
| `-f, --format <fmt>`  | -     | Output format                  | `claude`    |
| `-v, --verbose`       | -     | Verbose output                 | `false`     |
| `--skip-filter`       | -     | Skip failed attempts filter    | `false`     |
| `--overwrite`         | -     | Overwrite existing files       | `false`     |

#### Formats

| Format   | Description |
| -------- | ----------- |
| `claude` | Claude Code |
| `codex`  | Codex CLI   |
| `cursor` | Cursor IDE  |

### distill list

```bash
skill distill list
```

#### Options

| Option               | Short | Description     | Default  |
| -------------------- | ----- | --------------- | -------- |
| `-f, --format <fmt>` | -     | Platform format | `claude` |
| `-n, --limit <num>`  | -     | Limit results   | `20`     |

### distill show

```bash
skill distill show <session-id>
```

#### Options

| Option               | Short | Description     | Default  |
| -------------------- | ----- | --------------- | -------- |
| `-f, --format <fmt>` | -     | Platform format | `claude` |

### Examples

```bash
# First add your API key for the LLM engine
# claude-sonnet-4-20250514 is used by default
export ANTHROPIC_API_KEY=<your_api_key_here>

# Extract from most recent session
skill distill run --last

# Extract specific session
skill distill run --session ses_abc123

# Specify output directory
skill distill run --last --output ./skills/

# Use custom format
skill distill run --last --format cursor

# List available sessions
skill distill list

# List with limit
skill distill list --limit 10

# Show session details
skill distill show ses_abc123

# With additional prompts
skill distill run --last --prompt "Focus on React patterns" --prompt "Include examples"
```

---

## skill convert

Convert Skill formats between platforms.

### Syntax

```bash
skill convert <subcommand>
```

### Subcommands

| Subcommand | Description              |
| ---------- | ------------------------ |
| `to`       | Convert to target format |
| `detect`   | Detect file format       |

### convert to

```bash
skill convert to <path>
```

#### Options

| Option               | Short | Description                     | Default |
| -------------------- | ----- | ------------------------------- | ------- |
| `--to <format>`      | -     | Target format (required)        | -       |
| `-o, --output <dir>` | -     | Output directory                | current |
| `--overwrite`        | -     | Overwrite existing files        | `false` |
| `-r, --recursive`    | -     | Process directories recursively | `false` |

#### Formats

| Format     | Description  |
| ---------- | ------------ |
| `claude`   | Claude Code  |
| `codex`    | Codex CLI    |
| `cursor`   | Cursor IDE   |
| `continue` | Continue.dev |
| `all`      | All formats  |

### convert detect

```bash
skill convert detect <file_path>
```

#### Options

| Option   | Short | Description | Default |
| -------- | ----- | ----------- | ------- |
| `--json` | -     | JSON output | `false` |

### Examples

```bash
# Convert to Cursor format
skill convert to ./SKILL.md --to cursor

# Convert with output directory
skill convert to ./SKILL.md --to codex --output ./converted/

# Overwrite existing
skill convert to ./SKILL.md --to claude --overwrite

# Recursive conversion
skill convert to ./skills/ --to cursor --recursive --output ./converted/

# Detect format
skill convert detect ./SKILL.md

# Detect with JSON output
skill convert detect ./SKILL.md --json

# Convert to all formats
skill convert to ./SKILL.md --to all --output ./formats/
```

---

## skill test

Test Skill trigger matching and behavior.

### Syntax

```bash
skill test [patterns...]
```

### Arguments

| Argument   | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `patterns` | Test file patterns (default: `**/*.skill-test.{yaml,yml,json}`) |

### Options

| Option                | Short | Description           | Default |
| --------------------- | ----- | --------------------- | ------- |
| `-c, --config <path>` | -     | Test config file path | -       |
| `-w, --watch`         | -     | Watch mode            | `false` |
| `--coverage`          | -     | Collect coverage      | `false` |
| `-v, --verbose`       | -     | Verbose output        | `false` |

### Test File Format

Test files use YAML or JSON format and contain test cases for trigger matching:

#### YAML Format (`.skill-test.yaml`)

```yaml
description: Test suite description
skill: ./path/to/skill.md
cases:
  - name: Test case name
    input: User input text
    shouldTrigger: true
    matchType: exact # optional: exact, contains, fuzzy, regex
    minConfidence: 0.9 # optional: 0-1
```

#### Test Case Fields

| Field           | Type    | Required | Description                                         |
| --------------- | ------- | -------- | --------------------------------------------------- |
| `name`          | string  | yes      | Test case name                                      |
| `input`         | string  | yes      | User input to test                                  |
| `shouldTrigger` | boolean | yes      | Expected result (true = should trigger)             |
| `matchType`     | string  | no       | Expected match type (exact, contains, fuzzy, regex) |
| `minConfidence` | number  | no       | Minimum confidence threshold (0-1)                  |
| `skip`          | boolean | no       | Skip this test case                                 |
| `only`          | boolean | no       | Only run this test case                             |

### Examples

```bash
# Run all test files (matches default pattern)
skill test

# Run specific test file
skill ./packages/test/tests/fixtures/basic-test.skill-test.yaml

# Run test files matching pattern
skill test "./packages/**/*.skill-test.yaml"

# Watch mode for development
skill test "./packages/**/*.skill-test.yaml" --watch

# Collect coverage
skill test --coverage

# Verbose output
skill test --verbose
```

---

## skill sync

Synchronize Skills across devices.

### Syntax

```bash
skill sync <subcommand>
```

### Subcommands

| Subcommand | Description                |
| ---------- | -------------------------- |
| `push`     | Push local skills to cloud |
| `pull`     | Pull skills from cloud     |
| `status`   | Show sync status           |
| `queue`    | Manage offline queue       |
| `backends` | List supported backends    |

### sync push

```bash
skill sync push
```

#### Options

| Option                    | Short | Description                      | Default               |
| ------------------------- | ----- | -------------------------------- | --------------------- |
| `-d, --dir <path>`        | -     | Skills directory                 | `~/.skillbolt/skills` |
| `-f, --force`             | -     | Force push (overwrite conflicts) | `false`               |
| `-i, --include <pats...>` | -     | Include patterns (glob)          | -                     |
| `-e, --exclude <pats...>` | -     | Exclude patterns (glob)          | -                     |
| `--delete`                | -     | Delete remote skills not local   | `false`               |
| `--dry-run`               | -     | Show without making changes      | `false`               |
| `--queue`                 | -     | Queue if offline                 | `false`               |
| `--backend <type>`        | -     | Backend type                     | `supabase`            |

### sync pull

```bash
skill sync pull
```

#### Options

| Option                    | Short | Description                      | Default               |
| ------------------------- | ----- | -------------------------------- | --------------------- |
| `-d, --dir <path>`        | -     | Skills directory                 | `~/.skillbolt/skills` |
| `-f, --force`             | -     | Force pull (overwrite conflicts) | `false`               |
| `-i, --include <pats...>` | -     | Include patterns (glob)          | -                     |
| `-e, --exclude <pats...>` | -     | Exclude patterns (glob)          | -                     |
| `--delete`                | -     | Delete local skills not remote   | `false`               |
| `--dry-run`               | -     | Show without making changes      | `false`               |
| `--conflict <strategy>`   | -     | Conflict resolution strategy     | `manual`              |
| `--backend <type>`        | -     | Backend type                     | `supabase`            |

### sync status

```bash
skill sync status
```

#### Options

| Option             | Short | Description      | Default               |
| ------------------ | ----- | ---------------- | --------------------- |
| `-d, --dir <path>` | -     | Skills directory | `~/.skillbolt/skills` |
| `--backend <type>` | -     | Backend type     | `supabase`            |
| `-j, --json`       | -     | JSON output      | `false`               |

### sync queue

```bash
skill sync queue
```

#### Options

| Option             | Short | Description               | Default    |
| ------------------ | ----- | ------------------------- | ---------- |
| `--list`           | -     | List queued operations    | `false`    |
| `--flush`          | -     | Process queued operations | `false`    |
| `--clear`          | -     | Clear all operations      | `false`    |
| `--backend <type>` | -     | Backend for flush         | `supabase` |

### sync backends

```bash
skill sync backends
```

No options.

### Backend Types

| Backend       | Description         |
| ------------- | ------------------- |
| `supabase`    | Supabase database   |
| `github-gist` | GitHub Gist storage |

### Environment Variables

| Backend       | Variables                                                             |
| ------------- | --------------------------------------------------------------------- |
| `supabase`    | `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_EMAIL`, `SUPABASE_PASSWORD` |
| `github-gist` | `GITHUB_TOKEN`, `GITHUB_GIST_ID`                                      |

### Examples

```bash
# Push to cloud
skill sync push

# Push with specific directory
skill sync push --dir ./my-skills

# Force push (overwrite conflicts)
skill sync push --force

# Preview push
skill sync push --dry-run

# Pull from cloud
skill sync pull

# Pull with conflict strategy
skill sync pull --conflict prefer-local

# View status
skill sync status

# Status as JSON
skill sync status --json

# List queued operations
skill sync queue --list

# Flush offline queue
skill sync queue --flush

# Clear queue
skill sync queue --clear

# List supported backends
skill sync backends

# Use specific backend
skill sync push --backend github-gist
```

---

## skill analytics

Analyze Skill usage data.

### Syntax

```bash
skill analytics <subcommand>
```

### Subcommands

| Subcommand | Description                  |
| ---------- | ---------------------------- |
| `report`   | Generate usage report        |
| `analyze`  | Analyze usage patterns       |
| `suggest`  | Get optimization suggestions |
| `config`   | Configure analytics          |

### analytics report

```bash
skill analytics report
```

#### Options

| Option                | Short | Description               | Default    |
| --------------------- | ----- | ------------------------- | ---------- |
| `--from <date>`       | -     | Start date (YYYY-MM-DD)   | -          |
| `--to <date>`         | -     | End date (YYYY-MM-DD)     | -          |
| `-d, --days <num>`    | -     | Number of days to include | `30`       |
| `-s, --skill <name>`  | -     | Filter by skill name      | -          |
| `-f, --format <fmt>`  | -     | Output format             | `terminal` |
| `-o, --output <path>` | -     | Output file path          | -          |
| `--db <path>`         | -     | Analytics database path   | -          |
| `--no-suggestions`    | -     | Exclude suggestions       | `false`    |

#### Formats

| Format     | Description     |
| ---------- | --------------- |
| `terminal` | Terminal output |
| `json`     | JSON format     |
| `csv`      | CSV format      |
| `html`     | HTML report     |

### analytics analyze

```bash
skill analytics analyze
```

#### Options

| Option             | Short | Description               | Default |
| ------------------ | ----- | ------------------------- | ------- |
| `-d, --days <num>` | -     | Number of days to analyze | `30`    |
| `--db <path>`      | -     | Analytics database path   | -       |
| `--triggers`       | -     | Show trigger patterns     | `false` |
| `--unused`         | -     | Show unused skills        | `false` |
| `--suggestions`    | -     | Show suggestions          | `false` |

### analytics suggest

```bash
skill analytics suggest
```

#### Options

| Option             | Short | Description               | Default |
| ------------------ | ----- | ------------------------- | ------- |
| `-d, --days <num>` | -     | Number of days to analyze | `30`    |
| `--db <path>`      | -     | Analytics database path   | -       |
| `--include-unused` | -     | Include unused skills     | `false` |

### analytics config

```bash
skill analytics config
```

#### Options

| Option        | Short | Description             | Default |
| ------------- | ----- | ----------------------- | ------- |
| `--db <path>` | -     | Analytics database path | -       |
| `--status`    | -     | Show current status     | `false` |

### Examples

```bash
# Generate report for last 30 days
skill analytics report

# Report for last 7 days
skill analytics report --days 7

# Report for specific skill
skill analytics report --skill git-workflow

# Export as JSON
skill analytics report --format json --output report.json

# Export as HTML
skill analytics report --format html --output report.html

# Export as CSV
skill analytics report --format csv --output report.csv

# Use custom database (we have a database for test here)
skill analytics report --db packages/analytics/tests/fixtures/test-analytics.db

# Analyze usage patterns
skill analytics analyze

# Analyze with trigger patterns
skill analytics analyze --triggers

# Show unused skills
skill analytics analyze --unused

# Get suggestions
skill analytics suggest

# Configure and check status
skill analytics config --status

# Custom date range
skill analytics report --from 2025-12-01 --to 2025-12-31

# Report without suggestions
skill analytics report --no-suggestions
```

---

## skill compose

Orchestrate workflows with multiple Skills.

### Syntax

```bash
skill compose <subcommand>
```

### Subcommands

| Subcommand  | Description          |
| ----------- | -------------------- |
| `run`       | Execute a workflow   |
| `validate`  | Validate a workflow  |
| `visualize` | Visualize a workflow |

### compose run

```bash
skill compose run <file>
```

#### Options

| Option                 | Short | Description                   | Default |
| ---------------------- | ----- | ----------------------------- | ------- |
| `-i, --input <k=v...>` | -     | Input parameters (repeatable) | -       |
| `-d, --dry-run`        | -     | Run without executing         | `false` |
| `-v, --verbose`        | -     | Verbose execution             | `false` |
| `-t, --timeout <ms>`   | -     | Default step timeout (ms)     | -       |

### compose validate

```bash
skill compose validate <file>
```

#### Options

| Option        | Short | Description      | Default |
| ------------- | ----- | ---------------- | ------- |
| `-q, --quiet` | -     | Only show errors | `false` |

### compose visualize

```bash
skill compose visualize <file>
```

#### Options

| Option                | Short | Description                     | Default |
| --------------------- | ----- | ------------------------------- | ------- |
| `-f, --format <fmt>`  | -     | Output format                   | `ascii` |
| `-o, --output <file>` | -     | Write to file instead of stdout | -       |

#### Visualization Formats

| Format           | Description          |
| ---------------- | -------------------- |
| `ascii`          | ASCII art diagram    |
| `simple`         | Simple text format   |
| `mermaid`        | Mermaid diagram code |
| `mermaid-styled` | Styled Mermaid code  |

### Examples

```bash
# Workflow examples are provided in `packages/compose/tests/fixtures`

# Execute workflow
skill compose run my-workflow.yaml

# Run with input parameters
skill compose run my-workflow.yaml --input name=value --input age=25

# Dry run to preview
skill compose run my-workflow.yaml --dry-run

# Verbose execution
skill compose run my-workflow.yaml --verbose

# Set timeout
skill compose run my-workflow.yaml --timeout 5000

# Validate workflow
skill compose validate my-workflow.yaml

# Validate quietly (errors only)
skill compose validate my-workflow.yaml --quiet

# Visualize workflow (ASCII)
skill compose visualize my-workflow.yaml

# Visualize as Mermaid
skill compose visualize my-workflow.yaml --format mermaid

# Visualize and save to file
skill compose visualize my-workflow.yaml --output diagram.txt
```

---

## skill doc

Generate Skill documentation.

### Syntax

```bash
skill doc <subcommand>
```

### Subcommands

| Subcommand | Description            |
| ---------- | ---------------------- |
| `generate` | Generate documentation |
| `batch`    | Batch generate docs    |

### doc generate

```bash
skill doc generate <path>
```

#### Options

| Option               | Short | Description              | Default   |
| -------------------- | ----- | ------------------------ | --------- |
| `-o, --output <dir>` | -     | Output directory         | `./docs`  |
| `-f, --format <fmt>` | -     | Output format            | `readme`  |
| `-t, --template <n>` | -     | Template name            | `default` |
| `--overwrite`        | -     | Overwrite existing files | `false`   |

#### Formats

| Format   | Description      |
| -------- | ---------------- |
| `readme` | README.md format |
| `html`   | HTML format      |
| `json`   | JSON format      |

### doc batch

```bash
skill doc batch <dir>
```

#### Options

| Option               | Short | Description              | Default  |
| -------------------- | ----- | ------------------------ | -------- |
| `-o, --output <dir>` | -     | Output directory         | `./docs` |
| `-f, --format <fmt>` | -     | Output format            | `readme` |
| `-r, --recursive`    | -     | Process recursively      | `false`  |
| `--overwrite`        | -     | Overwrite existing files | `false`  |

### Examples

```bash
# Generate documentation for a skill
skill doc generate ./my-skill/SKILL.md

# Specify output directory
skill doc generate ./my-skill/SKILL.md --output ./documentation/

# Generate as HTML
skill doc generate ./my-skill/SKILL.md --format html

# Generate as JSON
skill doc generate ./my-skill/SKILL.md --format json

# Use custom template
skill doc generate ./my-skill/SKILL.md --template detailed

# Overwrite existing documentation
skill doc generate ./my-skill/SKILL.md --overwrite

# Batch generate for directory
skill doc batch ./skills/

# Batch generate recursively
skill doc batch ./skills/ --recursive

# Batch with custom format
skill doc batch ./skills/ --format html --output ./html-docs/
```

# Getting Started

This guide helps you get up and running with Skill Kit quickly, from installation to creating your first Skill.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Creating Your First Skill](#creating-your-first-skill)
- [Checking Skill Format](#checking-skill-format)
- [Installing Skills](#installing-skills)
- [Next Steps](#next-steps)

## System Requirements

- **Node.js**: 18.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm

Check your Node.js version:

```bash
node --version
# v18.0.0 or higher
```

## Installation

### Global Installation (Recommended)

```bash
# Using npm
npm install -g @skillbolt/core

# Using yarn
yarn global add @skillbolt/core

# Using pnpm
pnpm add -g @skillbolt/core
```

### Verify Installation

```bash
skill --version
# @skillbolt/cli v1.0.0

skill --help
# Shows all available commands
```

### Project-local Installation

If you only want to use Skill Kit in a specific project:

```bash
npm install --save-dev @skillbolt/core
```

Then run via npx:

```bash
npx skill lint ./my-skill
```

## Creating Your First Skill

### Option 1: Interactive Mode

The easiest way is to use the interactive wizard:

```bash
skill init
```

The wizard will ask the following questions:

```
? Skill name: my-first-skill
? Short description: A skill that helps with code review
? Select template: standard
? Target platform: claude-code
? Trigger phrases (comma-separated): review code, check code
```

### Option 2: Command-line Arguments

If you already know all the parameters:

```bash
skill init my-first-skill \
  --template standard \
  --platform claude-code \
  --description "A skill that helps with code review"
```

### Generated Directory Structure

```
my-first-skill/
├── SKILL.md           # Main Skill definition file
├── references/        # Reference materials directory (optional)
│   └── examples.md
└── tests/             # Test cases (optional)
    └── triggers.test.md
```

### SKILL.md File Example

````markdown
---
name: my-first-skill
description: This skill should be used when the user asks to "review code" or "check code". It helps perform code reviews.
version: 1.0.0
author: Your Name
triggers:
  - review code
  - check code
platform:
  - claude-code
---

# My First Skill

A skill that helps with code review.

## Overview

This skill provides automated code review capabilities, checking for common issues and suggesting improvements.

## Core Workflow

### Step 1: Analyze Code

Read and understand the code to be reviewed.

### Step 2: Check Issues

Look for:

- Code style violations
- Potential bugs
- Performance issues
- Security concerns

### Step 3: Generate Report

Provide a summary with:

- Issues found
- Suggested fixes
- Overall assessment

## Parameters

| Parameter | Type    | Required | Description                             |
| --------- | ------- | -------- | --------------------------------------- |
| path      | string  | Yes      | Path to the file or directory to review |
| strict    | boolean | No       | Enable strict mode (default: false)     |

## Examples

### Basic Usage

```
Review this file: src/main.ts
```

### Strict Mode

```
Review src/ directory in strict mode
```

## Error Handling

- **File not found**: Verify the path exists
- **Permission denied**: Check file permissions
- **Unsupported file type**: Only code files are supported
````

## Checking Skill Format

After creating your Skill, check if it conforms to standards:

```bash
skill lint ./my-first-skill
```

### Example Output

```
Checking: my-first-skill/SKILL.md

⚠ warning  missing version field in frontmatter

  0 errors  1 warning
```

### Auto-fix

Some issues can be automatically fixed:

```bash
skill lint ./my-first-skill --fix
```

For those issues that cannot be fixed, the errors will be kept and printed.

## Installing Skills

### Install from Local Directory

```bash
skill install ./my-first-skill
```

### Install from GitHub

```bash
# Using shorthand format
skill install github:username/repo-name

# Specify branch or tag
skill install github:username/repo-name#v1.0.0
skill install github:username/repo-name#main

# Ensure SKILL.md in this directory, e.g.
skill install https://github.com/anthropics/claude-code/tree/main/plugins/claude-opus-4-5-migration/skills/claude-opus-4-5-migration
```

### Install from Skillbolt

```bash
# Search for specific skill and open results in browser
skill search "python automation"

# Install from Skillbolt
skill install full-name-in-skillbolt

# Ensure this full name including the publisher, e.g.
skill install anthropics-skills-doc-coauthoring
```

### View Installed Skills

```bash
skill list
```

Output:

```
NAME              VERSION SOURCE   MODE
-----------------------------------------------------------------
my-first-skill    1.0.0   local    ~/.skillbolt/skills/my-first-skill
code-reviewer     2.1.0   github   ~/.skillbolt/skills/code-reviewer

Total: 2 skill(s)
```

## Next Steps

Congratulations! You have successfully created and installed your first Skill.

### Continue Learning

- [Command Reference](./commands.md) - Learn about all available commands
- [SKILL.md Format Specification](./skill-format.md) - Deep dive into Skill file format
- [Configuration Guide](./configuration.md) - Customize Skill Kit behavior
- [Best Practices](./best-practices.md) - Tips for writing high-quality Skills

### Quick Command Reference

```bash
# Create
skill init <name_or_path>            # Create new Skill
skill distill run --last             # Distill from conversation (need to set $ANTHROPIC_API_KEY)

# Quality
skill lint <path>                    # Format check
skill lint <path> --fix              # Auto-fix
skill test <path>                    # Test triggers

# Manage
skill search <query>                 # Search skills
skill install <source>               # Install
skill list                           # List installed skills
skill update <name>                  # Update installed skills
skill remove <name>                  # Uninstall

# Advanced
skill convert to <path> --to <format>   # Format conversion
skill sync push                         # Cloud sync
skill analytics report                  # Usage analytics
skill compose run <workflow>            # Run workflow.yaml
skill doc generate <path>               # Generate documentation
```

### Getting Help

```bash
# View command help
skill --help
skill <command> --help

# Examples
skill lint --help
skill init --help
```

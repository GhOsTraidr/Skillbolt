# SKILL.md Format Specification

This document describes the complete format specification for SKILL.md files.

## Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Frontmatter](#frontmatter)
- [Sections](#sections)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

A SKILL.md file is a Markdown document that defines an AI Agent Skill. It consists of two main parts:

1. **Frontmatter**: YAML metadata at the top of the file
2. **Content**: Markdown sections that describe the skill

## File Structure

```markdown
---
name: skill-name
description: This skill should be used when...
version: 1.0.0
---

# Skill Title

## Overview

...

## Core Workflow

...

## Parameters

...

## Examples

...

## Error Handling

...
```

## Frontmatter

The frontmatter is a YAML block at the beginning of the file, enclosed by `---` delimiters.

### Required Fields

| Field         | Type   | Description                                          |
| ------------- | ------ | ---------------------------------------------------- |
| `name`        | string | Unique skill identifier (lowercase, hyphens allowed) |
| `description` | string | Skill description including trigger conditions       |

### Optional Fields

| Field        | Type     | Description                              | Default           |
| ------------ | -------- | ---------------------------------------- | ----------------- |
| `version`    | string   | Semantic version (e.g., "1.0.0")         | -                 |
| `author`     | string   | Author name or email                     | -                 |
| `triggers`   | string[] | Trigger phrases that activate this skill | -                 |
| `platform`   | string[] | Target platforms                         | `["claude-code"]` |
| `tags`       | string[] | Categorization tags                      | -                 |
| `repository` | string   | Repository URL                           | -                 |

### Description Format

The `description` field should follow this pattern:

```
This skill should be used when [trigger condition]. It [what it does].
```

Examples:

- "This skill should be used when the user asks to 'review code' or 'check code quality'. It performs automated code reviews."
- "This skill should be used when the user needs to 'deploy to production'. It handles the deployment workflow."

### Complete Frontmatter Example

```yaml
---
name: code-reviewer
description: This skill should be used when the user asks to "review code" or "check code quality". It performs automated code reviews with suggestions.
version: 1.0.0
author: John Doe <john@example.com>
triggers:
  - review code
  - check code
  - code review
platform:
  - claude-code
  - cursor
tags:
  - code-quality
  - review
  - automation
repository: https://github.com/user/code-reviewer
---
```

## Sections

Content sections are organized using Markdown headings.

### Required Sections

#### Overview (## Overview)

A brief description of what the skill does and when to use it.

```markdown
## Overview

This skill provides automated code review capabilities. It analyzes code for:

- Style violations
- Potential bugs
- Performance issues
- Security vulnerabilities
```

#### Core Workflow (## Core Workflow or ## Workflow)

Step-by-step instructions for how the skill operates.

```markdown
## Core Workflow

### Step 1: Analyze Input

Read and understand the code to be reviewed.

### Step 2: Run Checks

Execute the following checks:

- Lint rules
- Type checking
- Security scanning

### Step 3: Generate Report

Create a summary report with findings and recommendations.
```

### Recommended Sections

#### Parameters (## Parameters)

Document any configurable parameters.

```markdown
## Parameters

| Parameter | Type    | Required | Default | Description                      |
| --------- | ------- | -------- | ------- | -------------------------------- |
| path      | string  | Yes      | -       | Path to file or directory        |
| strict    | boolean | No       | false   | Enable strict mode               |
| format    | string  | No       | "text"  | Output format (text, json, html) |
```

#### Examples (## Examples)

Show usage examples.

````markdown
## Examples

### Basic Usage

```
Review the file src/main.ts
```

### With Options

```
Review src/ directory in strict mode with JSON output
```

### Complex Example

```
Review all TypeScript files in the project, ignore test files
```
````

#### Error Handling (## Error Handling)

Document potential errors and how to handle them.

```markdown
## Error Handling

| Error             | Cause                    | Solution                         |
| ----------------- | ------------------------ | -------------------------------- |
| File not found    | Invalid path provided    | Verify the file path exists      |
| Permission denied | Insufficient permissions | Check file permissions           |
| Timeout           | Processing took too long | Reduce scope or increase timeout |
```

### Optional Sections

#### Prerequisites (## Prerequisites)

List any requirements before using the skill.

```markdown
## Prerequisites

- Node.js 18+ installed
- Git repository initialized
- ESLint configuration file present
```

#### Configuration (## Configuration)

Document configuration options.

````markdown
## Configuration

Create a `.coderc.json` file in your project root:

```json
{
  "rules": {
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```
````

#### References (## References)

Links to additional resources.

```markdown
## References

- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
```

## Best Practices

### Writing Style

1. **Use imperative mood** for instructions
   - Good: "Run the linter"
   - Bad: "You should run the linter"

2. **Be specific** about trigger conditions
   - Good: "when the user asks to 'review code' or 'check code quality'"
   - Bad: "when the user wants help with code"

3. **Include concrete examples**
   - Show actual commands or inputs
   - Demonstrate expected outputs

4. **Keep it concise**
   - Aim for 500-3000 words
   - Use bullet points for lists
   - Use tables for structured data

### Structure Guidelines

1. **Frontmatter first** - Always start with YAML frontmatter
2. **Overview early** - Put Overview section immediately after the title
3. **Workflow is key** - The Core Workflow section is the most important
4. **Examples help** - Always include at least one example
5. **Handle errors** - Document what can go wrong

### Content Length

| Section        | Recommended Length |
| -------------- | ------------------ |
| Overview       | 50-200 words       |
| Core Workflow  | 200-1000 words     |
| Parameters     | As needed          |
| Examples       | 2-5 examples       |
| Error Handling | 3-10 error cases   |
| Total          | 500-3000 words     |

## Examples

### Minimal Skill

```markdown
---
name: hello-world
description: This skill should be used when the user asks to "say hello" or "greet". It responds with a greeting.
---

# Hello World

## Overview

A simple skill that responds with a friendly greeting.

## Workflow

1. Receive the greeting request
2. Generate a personalized greeting
3. Return the greeting message
```

### Standard Skill

````markdown
---
name: git-commit-helper
description: This skill should be used when the user asks to "commit changes", "create a commit", or "write a commit message". It helps create well-formatted git commit messages.
version: 1.0.0
author: Skill Kit Team
triggers:
  - commit changes
  - create commit
  - write commit message
platform:
  - claude-code
tags:
  - git
  - version-control
---

# Git Commit Helper

A skill that helps create well-formatted git commit messages following conventional commits specification.

## Overview

This skill analyzes staged changes and generates appropriate commit messages. It follows the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Core Workflow

### Step 1: Check Git Status

Run `git status` to see staged changes.

### Step 2: Analyze Changes

Review the diff to understand what changed:

- New files added
- Files modified
- Files deleted

### Step 3: Determine Commit Type

Select the appropriate type:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Step 4: Generate Message

Create a commit message following the format:

1. Type and scope
2. Short description (50 chars max)
3. Detailed body if needed
4. Breaking changes or issue references

### Step 5: Create Commit

Execute `git commit -m "<message>"`.

## Parameters

| Parameter | Type    | Required | Description                        |
| --------- | ------- | -------- | ---------------------------------- |
| scope     | string  | No       | Commit scope (e.g., "auth", "api") |
| body      | boolean | No       | Include detailed body              |
| breaking  | boolean | No       | Mark as breaking change            |

## Examples

### Simple Commit

```
Commit these changes
```

Output:

```
feat: add user authentication

- Add login endpoint
- Add JWT token generation
- Add password hashing
```

### With Scope

```
Commit changes to the auth module
```

Output:

```
feat(auth): implement password reset

Add password reset functionality with email verification.
```

## Error Handling

- **No staged changes**: Run `git add` first
- **Empty commit**: At least one change must be staged
- **Merge conflict**: Resolve conflicts before committing
````

### Advanced Skill with References

````markdown
---
name: api-documentation-generator
description: This skill should be used when the user asks to "generate API docs", "document this API", or "create API documentation". It generates OpenAPI/Swagger documentation from code.
version: 2.0.0
triggers:
  - generate API docs
  - document API
  - create API documentation
  - swagger docs
platform:
  - claude-code
  - cursor
tags:
  - documentation
  - api
  - openapi
---

# API Documentation Generator

## Overview

Automatically generates OpenAPI 3.0 documentation from your API code. Supports Express, FastAPI, and other frameworks.

## Prerequisites

- API endpoints defined in code
- TypeScript or Python with type annotations
- Node.js 18+ or Python 3.8+

## Core Workflow

### Step 1: Scan Endpoints

Identify all API endpoints in the codebase:

- Route definitions
- HTTP methods
- Path parameters

### Step 2: Extract Types

Parse request/response types:

- Query parameters
- Request body schemas
- Response schemas

### Step 3: Generate Spec

Create OpenAPI 3.0 specification:

- Info section
- Paths
- Components/Schemas

### Step 4: Output Documentation

Generate output in requested format:

- YAML file
- JSON file
- HTML documentation

## Parameters

| Parameter | Type   | Required | Default           | Description      |
| --------- | ------ | -------- | ----------------- | ---------------- |
| input     | string | Yes      | -                 | Source directory |
| output    | string | No       | ./docs/api        | Output directory |
| format    | string | No       | yaml              | Output format    |
| title     | string | No       | API Documentation | Doc title        |
| version   | string | No       | 1.0.0             | API version      |

## Configuration

Create `docgen.config.json`:

```json
{
  "input": "./src/routes",
  "output": "./docs/api",
  "format": "yaml",
  "info": {
    "title": "My API",
    "version": "1.0.0",
    "description": "API documentation"
  }
}
```

## Examples

### Basic Generation

```
Generate API documentation for ./src/routes
```

### With Options

```
Generate API docs in JSON format, output to ./api-spec
```

### From Config

```
Generate API documentation using docgen.config.json
```

## Error Handling

| Error                  | Cause                       | Solution                    |
| ---------------------- | --------------------------- | --------------------------- |
| No endpoints found     | Empty or invalid input path | Check the input directory   |
| Parse error            | Invalid syntax in source    | Fix syntax errors first     |
| Type extraction failed | Missing type annotations    | Add TypeScript/Python types |

## References

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger Editor](https://editor.swagger.io/)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
````

## Validation

Use `skill lint` to validate your SKILL.md file:

```bash
skill lint ./my-skill/SKILL.md
```

Common validation errors:

| Error               | Description                     | Fix                                         |
| ------------------- | ------------------------------- | ------------------------------------------- |
| Missing frontmatter | No YAML block at start          | Add `---` delimiters with required fields   |
| Missing name        | `name` field not present        | Add `name` to frontmatter                   |
| Missing description | `description` field not present | Add `description` to frontmatter            |
| Missing overview    | No Overview section             | Add `## Overview` section                   |
| Missing workflow    | No Workflow section             | Add `## Core Workflow` section              |
| Content too long    | Exceeds 3000 words              | Split into multiple files or reduce content |

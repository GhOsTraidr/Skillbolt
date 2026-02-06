---
name: Test Skill
description: A test skill for documentation generation
version: 1.0.0
triggers:
  - review code
  - check code
  - test
platform:
  - claude-code
---

# Test Skill

A test skill for documentation generation

## Overview

This skill provides automated code review capabilities, checking for common issues and suggesting improvements.

## When This Skill Applies

This skill activates when:

- User asks to "review code"
- User asks to "check code"

## Workflow

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

## References

- See `references/patterns.md` for common patterns
- [External reference if applicable]

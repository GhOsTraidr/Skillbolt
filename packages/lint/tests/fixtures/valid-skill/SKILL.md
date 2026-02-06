---
name: Test Skill
description: This skill should be used when the user asks to "review code". A skill that helps with code review
version: 1.0.0
triggers:
  - review code
  - check code
---

# Test Skill

A skill that helps with code review

## Overview

This skill provides automated code review capabilities, checking for common issues and suggesting improvements.

## When This Skill Applies

This skill activates when:

- User asks to "review code"
- User asks to "check code"

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

## References

- See `references/patterns.md` for common patterns
- [External reference if applicable]

import type { Skill } from '../../src/types/skill.js';

export const createMockSkill = (overrides: Partial<Skill> = {}): Skill => ({
  metadata: {
    name: 'Create React Component',
    description:
      'This skill should be used when the user asks to "create component", "add button", or "new react component". Provides step-by-step guidance for creating React components.',
    version: '1.0.0',
    ...overrides.metadata,
  },
  overview: 'Create a React component with TypeScript support',
  triggers: ['create component', 'add button', 'new react component'],
  prerequisites: ['React project setup', 'TypeScript configured'],
  steps: [
    {
      title: 'Analyze Requirements',
      description: 'Review the component requirements and determine the props interface',
      substeps: ['Check existing components', 'Define prop types'],
    },
    {
      title: 'Create Component File',
      description: 'Create a new file in src/components/',
    },
    {
      title: 'Add Styles',
      description: 'Add CSS modules or styled-components',
    },
  ],
  parameters: [
    {
      name: 'component_name',
      type: 'string',
      description: 'Name of the component',
      default: 'Button',
      required: false,
    },
  ],
  errorHandling: {
    'Missing dependencies': 'Run npm install to install required packages',
    'Type errors': 'Check that all prop types are correctly defined',
  },
  examples: ['Help me create component', 'Help me add button'],
  notes: ['Consider using TypeScript for better type safety'],
  ...overrides,
});

export const EXPECTED_SKILL_MD = `---
name: Create React Component
description: This skill should be used when the user asks to "create component", "add button", or "new react component". Provides step-by-step guidance for creating React components.
version: 1.0.0
---

# Create React Component

## Overview

Create a React component with TypeScript support

## When This Skill Applies

This skill activates when the user's request involves:
- create component
- add button
- new react component

## Prerequisites

- React project setup
- TypeScript configured

## Core Workflow

### Step 1: Analyze Requirements

Review the component requirements and determine the props interface

1. Check existing components
2. Define prop types

### Step 2: Create Component File

Create a new file in src/components/

### Step 3: Add Styles

Add CSS modules or styled-components

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| \`component_name\` | string | \`Button\` | Name of the component |

## Error Handling

- **Missing dependencies**: Run npm install to install required packages
- **Type errors**: Check that all prop types are correctly defined

## Example Usage

\`\`\`
Help me create component
\`\`\`

\`\`\`
Help me add button
\`\`\`

## Notes

- Consider using TypeScript for better type safety`;

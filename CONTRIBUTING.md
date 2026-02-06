# Contributing to Skill Kit

Thank you for your interest in contributing to Skill Kit! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Be patient with newcomers
- Focus on constructive feedback
- Accept responsibility for mistakes

## Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher
- **Git**: Latest version

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/Skill-Kit.git
cd Skill-Kit
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/Skillbolt/Skill-Kit.git
```

## Development Setup

### Install Dependencies

```bash
pnpm install
```

### Build All Packages

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

### Development Mode

Watch mode for a specific package:

```bash
pnpm --filter @skillbolt/core dev
```

## Project Structure

```
skillbolt/
├── packages/                 # All packages
│   ├── core/                 # @skillbolt/core - Shared utilities
│   ├── lint/                 # @skillbolt/lint - Format checker
│   ├── init/                 # @skillbolt/init - Scaffolding
│   ├── registry/             # @skillbolt/registry - Package manager
│   ├── cli/                  # @skillbolt/cli - CLI entry point
│   ├── distill/              # @skillbolt/distill - Conversation distiller
│   ├── convert/              # @skillbolt/convert - Format converter
│   ├── test/                 # @skillbolt/test - Test framework
│   ├── sync/                 # @skillbolt/sync - Cloud sync
│   ├── analytics/            # @skillbolt/analytics - Usage analytics
│   ├── compose/              # @skillbolt/compose - Workflow orchestration
│   └── doc/                  # @skillbolt/doc - Documentation generator
├── docs/                     # User documentation
├── dev-docs/                 # Development documentation
├── package.json              # Root package.json
├── pnpm-workspace.yaml       # Workspace configuration
├── tsconfig.base.json        # Shared TypeScript config
├── turbo.json                # Turborepo configuration
└── vitest.config.ts          # Test configuration
```

### Package Structure

Each package follows this structure:

```
packages/{package-name}/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts              # Type definitions
│   └── ...                   # Implementation files
├── tests/
│   ├── unit/                 # Unit tests
│   └── fixtures/             # Test fixtures
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

### Creating a New Feature

1. Create a feature branch:

```bash
git checkout -b feature/my-feature
```

2. Make your changes

3. Write tests for your changes

4. Ensure all tests pass:

```bash
pnpm test
```

5. Ensure linting passes:

```bash
pnpm lint
```

6. Commit your changes (see [Commit Guidelines](#commit-guidelines))

7. Push and create a pull request

### Creating a Bug Fix

1. Create a fix branch:

```bash
git checkout -b fix/issue-description
```

2. Write a failing test that reproduces the bug

3. Fix the bug

4. Ensure the test passes

5. Commit and create a pull request

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Avoid `any` type - use `unknown` if needed
- Export types explicitly

```typescript
// Good
export interface MyOptions {
  name: string;
  value?: number;
}

export function myFunction(options: MyOptions): string {
  return options.name;
}

// Avoid
export function myFunction(options: any): any {
  return options.name;
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- Maximum line length: 100 characters

The project uses ESLint and Prettier for code formatting:

```bash
# Check formatting
pnpm lint

# Auto-fix
pnpm lint:fix

# Format with Prettier
pnpm format
```

### Naming Conventions

| Type       | Convention           | Example          |
| ---------- | -------------------- | ---------------- |
| Files      | kebab-case           | `my-function.ts` |
| Functions  | camelCase            | `myFunction()`   |
| Classes    | PascalCase           | `MyClass`        |
| Interfaces | PascalCase           | `MyInterface`    |
| Types      | PascalCase           | `MyType`         |
| Constants  | SCREAMING_SNAKE_CASE | `MAX_LENGTH`     |
| Variables  | camelCase            | `myVariable`     |

### File Organization

```typescript
// 1. Imports - external
import { something } from 'external-package';

// 2. Imports - internal
import { internal } from './internal.js';

// 3. Types
export interface MyOptions {
  // ...
}

// 4. Constants
const DEFAULT_VALUE = 10;

// 5. Main exports
export function myFunction() {
  // ...
}

// 6. Helper functions (private)
function helperFunction() {
  // ...
}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @skillbolt/core test

# Run tests in watch mode
pnpm --filter @skillbolt/core test:watch

# Run tests with coverage
pnpm --filter @skillbolt/core test:coverage
```

### Writing Tests

Use Vitest for testing:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/index.js';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction({ name: 'test' });
    expect(result).toBe('test');
  });

  it('should handle edge cases', () => {
    expect(() => myFunction({ name: '' })).toThrow();
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Write tests for all public APIs
- Include edge cases and error scenarios

## Submitting Changes

### Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

| Type       | Description                     |
| ---------- | ------------------------------- |
| `feat`     | New feature                     |
| `fix`      | Bug fix                         |
| `docs`     | Documentation changes           |
| `style`    | Code style changes (formatting) |
| `refactor` | Code refactoring                |
| `test`     | Adding or updating tests        |
| `chore`    | Maintenance tasks               |

**Examples:**

```
feat(lint): add new rule for trigger validation

Add a new rule that validates trigger phrases meet minimum requirements.

Closes #123
```

```
fix(core): handle empty frontmatter correctly

Previously, parsing files without frontmatter would throw an unclear error.
Now it provides a helpful error message.

Fixes #456
```

### Pull Request Process

1. **Title**: Use conventional commit format

2. **Description**: Include:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Screenshots (if UI changes)

3. **Checklist**:
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Lint passes
   - [ ] Build succeeds

4. **Review**: Wait for at least one approval

5. **Merge**: Squash and merge (maintainers only)

### Pull Request Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe how to test the changes.

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated documentation as needed
```

## Release Process

Releases are managed by maintainers using Changesets.

### Creating a Changeset

When making changes that should be released:

```bash
pnpm changeset
```

Follow the prompts to:

1. Select packages that changed
2. Choose version bump type (major/minor/patch)
3. Write a summary of changes

### Version and Publish (Maintainers)

```bash
# Version packages
pnpm changeset version

# Publish to npm
pnpm release
```

## Getting Help

- **Questions**: Open a [Discussion](https://github.com/skillbolt/skillbolt/discussions)
- **Bugs**: Open an [Issue](https://github.com/skillbolt/skillbolt/issues)
- **Chat**: Join our Discord (coming soon)

## Recognition

Contributors are recognized in:

- The CHANGELOG for each release
- The project's README (significant contributions)
- GitHub's contributor list

Thank you for contributing to Skill Kit!

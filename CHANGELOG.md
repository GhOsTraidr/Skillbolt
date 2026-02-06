# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release preparation

## [1.0.0] - 2025-01-21

### Added

#### Core Infrastructure

- Monorepo setup with pnpm workspaces
- Turborepo for build orchestration
- Shared TypeScript configuration with strict mode
- ESLint and Prettier configuration
- Vitest test framework integration

#### @skillbolt/core

- YAML frontmatter parsing for SKILL.md files
- Markdown section extraction
- Configuration loading with cosmiconfig
- Multi-level logger with chalk
- Spinner support with ora
- Error hierarchy (SkillboltError, ParseError, ConfigError, ValidationError, FileError)
- Path and string utilities

#### @skillbolt/lint

- Format validation for SKILL.md files
- 15+ built-in lint rules
- Auto-fix support for common issues
- Multiple output formats (stylish, json, github)
- Rule severity configuration (error, warn, off)
- Custom rule support

#### @skillbolt/init

- Interactive skill scaffolding wizard
- Multiple templates (minimal, standard, advanced)
- Platform-specific configurations
- Git repository initialization
- Dependency installation

#### @skillbolt/registry

- Skill installation from multiple sources
  - GitHub repositories
  - Local file paths
  - Remote registry
- Version management
- Dependency resolution
- Skill updates and removal
- Installed skills listing

#### @skillbolt/cli

- Unified command-line interface
- 13 commands covering all functionality
- Help system and command documentation
- Version information
- Global and project configuration support

#### @skillbolt/distill

- Conversation history parsing
- Pattern recognition for skill extraction
- AI-assisted skill generation
- Multiple conversation formats support
- Output customization

#### @skillbolt/convert

- Cross-platform skill format conversion
- Supported platforms:
  - Claude Code
  - Cursor
  - Codex CLI
  - Continue
- Bidirectional conversion
- Format validation

#### @skillbolt/test

- Trigger phrase testing
- Skill validation testing
- Mock conversation simulation
- Test fixtures support
- Coverage reporting

#### @skillbolt/sync

- Cloud synchronization
- Multiple provider support
- Conflict resolution
- Selective sync
- Offline support with queue

#### @skillbolt/analytics

- Usage tracking
- Trigger activation metrics
- Performance statistics
- Privacy-respecting design
- Export capabilities

#### @skillbolt/compose

- Multi-skill workflow orchestration
- Sequential and parallel execution
- Conditional branching
- Variable passing between skills
- Error handling and rollback

#### @skillbolt/doc

- Automatic documentation generation
- Multiple output formats (Markdown, HTML, JSON)
- API documentation
- Usage examples extraction
- Cross-reference linking

### Documentation

- Comprehensive README
- Getting Started guide
- Command reference
- SKILL.md format specification
- Configuration guide
- API reference
- Contributing guide

---

## Version History

| Version | Date       | Description     |
| ------- | ---------- | --------------- |
| 1.0.0   | 2025-01-21 | Initial release |

[Unreleased]: https://github.com/skillbolt/skillbolt/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/skillbolt/skillbolt/releases/tag/v1.0.0

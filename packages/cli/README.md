# @skillbolt/cli

The unified command-line tool for Skill Kit, providing a single CLI entry point that coordinates all sub-packages.

## Features

- **Unified Command Entry**: Access all modules through a single `skill` command
- **Dynamic Package Loading**: Load packages on-demand to reduce startup time
- **Command Suggestions**: Smart suggestions for unknown commands based on Levenshtein distance
- **Error Handling**: Friendly error messages with solution hints
- **Subcommand Structure**: Support for complex multi-level command structures

## Command Structure

The `skill` CLI maps each module to different commands. Some commands support subcommands:

### Top-Level Commands

| Command     | Package              | Description                                  |
| ----------- | -------------------- | -------------------------------------------- |
| `init`      | @skillbolt/init      | Initialize a new skill project               |
| `lint`      | @skillbolt/lint      | Check skill file quality and standards       |
| `install`   | @skillbolt/registry  | Install a skill (alias: `i`)                 |
| `list`      | @skillbolt/registry  | List installed skills (alias: `ls`)          |
| `update`    | @skillbolt/registry  | Update skills (alias: `up`)                  |
| `remove`    | @skillbolt/registry  | Uninstall a skill (alias: `rm`, `uninstall`) |
| `outdated`  | @skillbolt/registry  | Check for outdated skills                    |
| `search`    | (built-in)           | Search skills on Skillbolt platform          |
| `test`      | @skillbolt/test      | Test skills                                  |
| `distill`   | @skillbolt/distill   | Extract skills from conversations            |
| `convert`   | @skillbolt/convert   | Convert skill formats                        |
| `sync`      | @skillbolt/sync      | Sync skills to cloud                         |
| `analytics` | @skillbolt/analytics | Analyze skill usage data                     |
| `compose`   | @skillbolt/compose   | Execute workflows                            |
| `doc`       | @skillbolt/doc       | Generate documentation                       |

### Subcommand Structure

Some commands support subcommands:

#### distill

```bash
skill distill run      # Extract session to SKILL.md
skill distill list     # List available sessions
skill distill show     # Show specific session details
```

#### convert

```bash
skill convert to       # Convert skill file to other formats
skill convert detect   # Detect skill file format
```

#### sync

```bash
skill sync push        # Push local skills to cloud
skill sync pull        # Pull skills from cloud
skill sync status      # Show sync status
skill sync backends    # List supported backends
```

#### analytics

```bash
skill analytics report     # Generate usage report
skill analytics analyze    # Analyze usage patterns
skill analytics suggest    # Get optimization suggestions
skill analytics config     # Configure analytics collection
```

#### compose

```bash
skill compose run          # Execute workflow
skill compose validate     # Validate workflow
skill compose visualize    # Visualize workflow (alias: viz)
```

#### doc

```bash
skill doc generate    # Generate documentation for skill files
skill doc batch       # Batch generate documentation
```

## Global Options

```bash
skill --version, -V           # Show version number
skill --help, -h              # Show help information
skill --verbose, -v           # Enable verbose output
skill --quiet, -q             # Suppress non-essential output
skill --config <path>         # Specify config file path
skill --no-color              # Disable colored output
```

## Command Details

### init - Initialize Skill Project

```bash
skill init <directory>

# Options
-n, --name <name>              # Skill name
-d, --desc <description>       # Skill description
-t, --triggers <triggers>      # Triggers (comma-separated)
--template <type>              # Template type: minimal, standard, complete
--platform <type>              # Target platform: claude-code, codex, cursor, all
--no-interactive               # Skip interactive prompts
-f, --force                    # Overwrite existing directory
--author <name>                # Author name
```

### lint - Check Skill Files

```bash
skill lint [patterns...]

# Options
-c, --config <path>            # Config file path
-f, --format <format>          # Output format: stylish, json, github (default: stylish)
--fix                          # Auto-fix issues
--dry-run                      # Show what would be fixed without modifying
--no-color                     # Disable colored output
--max-warnings <number>        # Warning count to trigger non-zero exit (default: -1)
```

### install - Install Skills

```bash
skill install <target>

# Options
-l, --link                     # Create symlink instead of copying
-f, --force                    # Force overwrite existing installation
-v, --version <version>        # Specify version to install
```

### list - List Installed Skills

```bash
skill list

# Options
-j, --json                     # Output in JSON format
-f, --filter <pattern>         # Filter skills by name pattern
```

### update - Update Skills

```bash
skill update [name]

# Options
-f, --force                    # Force update even if already latest
-v, --version <version>        # Update to specific version
```

### outdated - Check Outdated Skills

```bash
skill outdated
```

### remove - Uninstall Skills

```bash
skill remove <name>

# Options
-f, --force                    # Skip confirmation prompt
```

### test - Test Skills

```bash
skill test [patterns...]

# Options
-c, --config <path>            # Test config file path
-w, --watch                    # Watch mode - rerun tests on file changes
--coverage                     # Collect coverage information
-v, --verbose                  # Verbose output
```

### distill - Extract Skills

```bash
skill distill run
# Options
-l, --last                     # Use most recent session
-s, --session <id>             # Specify session ID
-p, --prompt <text>            # Additional prompts for extraction (can specify multiple)
-o, --output <dir>             # Output directory (default: current directory)
-f, --format <format>          # Output format (claude|codex|cursor)
-v, --verbose                  # Show verbose output
--skip-filter                  # Skip filtering of failed attempts
--overwrite                    # Overwrite existing files

skill distill list
# Options
-f, --format <format>          # Platform format (claude|codex|cursor)
-n, --limit <number>           # Limit result count (default: 20)

skill distill show <session-id>
# Options
-f, --format <format>          # Platform format (claude|codex|cursor)
```

### search - Search Skills

Search for skills on the Skillbolt platform.

```bash
skill search [query]

# Options
-n, --no-browser               # Only show URL, don't open browser
-w, --web                      # Directly open Skillbolt website

# Examples
skill search                   # Open Skillbolt website
skill search git               # Search for "git" related skills
skill search "code review"     # Search for "code review" related skills
skill search git --no-browser  # Only show URL
```

### convert - Convert Formats

```bash
skill convert to <path>
# Options
--to <format>                  # Target format: claude, codex, cursor, continue, all (required)
-o, --output <dir>             # Output directory
--overwrite                    # Overwrite existing files
-r, --recursive                # Process directory recursively

skill convert detect <file_path>
# Options
--json                         # Output in JSON format
```

### sync - Sync Skills

```bash
skill sync push
# Options
-d, --dir <path>               # Skill directory
-f, --force                    # Force push (overwrite remote conflicts)
-i, --include <patterns...>    # Include patterns (glob)
-e, --exclude <patterns...>    # Exclude patterns (glob)
--delete                       # Delete skills not present remotely
--dry-run                      # Show what would be done without executing
--queue                        # Queue operation if offline
--backend <type>               # Backend type (supabase, github-gist, default: supabase)

skill sync pull
# Options
-d, --dir <path>               # Skill directory
-f, --force                    # Force pull (overwrite local conflicts)
-i, --include <patterns...>    # Include patterns (glob)
-e, --exclude <patterns...>    # Exclude patterns (glob)
--delete                       # Delete skills not present locally
--dry-run                      # Show what would be done without executing
--conflict <strategy>          # Conflict resolution strategy
--backend <type>               # Backend type (supabase, github-gist, default: supabase)

skill sync status
# Options
-d, --dir <path>               # Skill directory
--backend <type>               # Backend type (supabase, github-gist, default: supabase)
-j, --json                     # Output in JSON format
```

### analytics - Analyze Usage Data

```bash
skill analytics report
# Options
--from <date>                  # Start date (YYYY-MM-DD)
--to <date>                    # End date (YYYY-MM-DD)
-d, --days <number>            # Number of days to include (default: 30)
-s, --skill <name>             # Filter by skill name
-f, --format <format>          # Output format (terminal, json, csv, html)
-o, --output <path>            # Output file path
--db <path>                    # Analytics database path
--no-suggestions               # Exclude optimization suggestions

skill analytics analyze
# Options
-d, --days <number>            # Days to analyze (default: 30)
--db <path>                    # Analytics database path
--triggers                     # Show trigger pattern analysis
--unused                       # Show unused skills
--suggestions                  # Show optimization suggestions

skill analytics suggest
# Options
-d, --days <number>            # Days to analyze (default: 30)
--db <path>                    # Analytics database path
--include-unused               # Include suggestions for unused skills

skill analytics config
# Options
--db <path>                    # Analytics database path
--status                       # Show current status
```

### compose - Workflow Orchestration

```bash
skill compose run <file>
# Options
-i, --input <key=value...>     # Input parameters (can specify multiple)
-d, --dry-run                  # Run without executing skills
-v, --verbose                  # Show detailed execution info
-t, --timeout <ms>             # Default step timeout (milliseconds)

skill compose validate <file>
# Options
-q, --quiet                    # Only output errors

skill compose visualize <file>
# Options
-f, --format <format>          # Output format (ascii, simple, mermaid, mermaid-styled)
-o, --output <file>            # Write to file instead of stdout
```

### doc - Generate Documentation

```bash
skill doc generate <path>
# Options
-o, --output <dir>             # Output directory
-f, --format <format>          # Output format (readme, html, json)
-t, --template <name>          # Template name
--overwrite                    # Overwrite existing files

skill doc batch <dir>
# Options
-o, --output <dir>             # Output directory
-f, --format <format>          # Output format (readme, html, json)
-r, --recursive                # Process directory recursively
--overwrite                    # Overwrite existing files
```

## Package Loading Mechanism

The CLI uses a dynamic package loader that only loads packages when needed:

```typescript
import { loadCommandPackage } from '@skillbolt/cli';

const result = await loadCommandPackage('analytics');
if (result.success) {
  // Use loaded package
  const analytics = result.module;
} else {
  // Handle package not installed
  console.error(result.error.message);
}
```

### Package Mapping

The CLI maintains a command-to-package mapping:

```typescript
const PACKAGE_MAP = {
  lint: '@skillbolt/lint',
  init: '@skillbolt/init',
  install: '@skillbolt/registry',
  list: '@skillbolt/registry',
  update: '@skillbolt/registry',
  outdated: '@skillbolt/registry',
  remove: '@skillbolt/registry',
  distill: '@skillbolt/distill',
  convert: '@skillbolt/convert',
  test: '@skillbolt/test',
  sync: '@skillbolt/sync',
  analytics: '@skillbolt/analytics',
  compose: '@skillbolt/compose',
  doc: '@skillbolt/doc',
};
```

## Command Suggestions

When users enter unknown commands, the CLI provides smart suggestions:

```bash
$ skill anlytics

Error: Unknown command "anlytics"

Did you mean "analytics"?

Available commands:
  - init
  - lint
  - install
  - list
  ...
```

The suggestion feature is based on string similarity algorithms (Levenshtein distance) and shows up to 3 suggestions.

## Error Handling

When a required package is not installed, the CLI provides clear installation guidance:

```bash
$ skill analytics
Error: Command "analytics" requires @skillbolt/analytics

Install it with:
  npm install @skillbolt/analytics
  or
  pnpm add @skillbolt/analytics
```

## Exit Codes

The CLI uses standard exit codes:

| Exit Code | Meaning           |
| --------- | ----------------- |
| 0         | Success           |
| 1         | General error     |
| 2         | Invalid argument  |
| 127       | Command not found |

## API Reference

### Main Types

```typescript
interface PackageLoadResult<T = unknown> {
  success: boolean;
  module?: T;
  error?: Error;
}

interface GlobalOptions {
  verbose?: boolean;
  quiet?: boolean;
  config?: string;
  color?: boolean;
}

const ExitCode = {
  SUCCESS: 0,
  ERROR: 1,
  INVALID_ARGUMENT: 2,
  COMMAND_NOT_FOUND: 127,
} as const;
```

### Utility Functions

```typescript
// Get package name for command
getPackageName(command: string): string | undefined;

// Get all command list
getAllCommands(): string[];

// Get all unique package names
getUniquePackages(): string[];

// Dynamically load package
loadPackage<T>(packageName: string): Promise<PackageLoadResult<T>>;

// Load command package
loadCommandPackage<T>(command: string): Promise<PackageLoadResult<T>>;

// Check if package is installed
isPackageInstalled(packageName: string): boolean;

// Print missing package error
printMissingPackageError(command: string, packageName: string): void;

// Suggest command
suggestCommand(input: string, maxSuggestions?: number): string[];

// Format suggestions
formatSuggestions(suggestions: string[]): string;
```

### Command Registration

```typescript
// Register various commands
registerLintCommand(program: Command): void;
registerInitCommand(program: Command): void;
registerInstallCommand(program: Command): void;
registerListCommand(program: Command): void;
registerUpdateCommand(program: Command): void;
registerOutdatedCommand(program: Command): void;
registerRemoveCommand(program: Command): void;
registerDistillCommand(program: Command): void;
registerConvertCommand(program: Command): void;
registerTestCommand(program: Command): void;
registerSyncCommand(program: Command): void;
registerAnalyticsCommand(program: Command): void;
registerComposeCommand(program: Command): void;
registerDocCommand(program: Command): void;
```

### Error Handling

```typescript
// Handle unknown command
handleUnknownCommand(): void;

// Handle missing package
handleMissingPackage(command: string): void;

// Handle error
handleError(error: unknown): void;

// Handle invalid argument
handleInvalidArgument(message: string): void;
```

## Usage Examples

### Basic Usage

```bash
# Show help
skill --help

# Show help for specific command
skill init --help

# Use verbose output
skill --verbose install my-skill
```

### Chaining Commands

```bash
# Initialize new skill and lint immediately
skill init my-skill && cd my-skill && skill lint

# Install skill and test
skill install git-workflow && skill test git-workflow
```

### Unknown Command Handling

```bash
# CLI will automatically provide suggestions
$ skill instll

Error: Unknown command "instll"

Did you mean "install"?

Available commands:
  - init
  - lint
  - install
  ...
```

## Troubleshooting

### Command Not Found

If you receive an "Unknown command" error, check:

1. Is the command spelled correctly
2. Is the corresponding package installed
3. Is the package in the correct location

The CLI will automatically provide suggestions for similar commands.

### Package Loading Failed

If you receive a package loading error:

1. Run `npm list @skillbolt/<package>` to check if package is installed
2. Reinstall the package: `npm install @skillbolt/<package>`
3. Clear npm cache: `npm cache clean --force`

### Subcommand Not Recognized

Some commands support subcommands. If a subcommand is not recognized:

1. Check if parent command is correct
2. Use `--help` to see supported subcommands
3. Ensure you're using the correct subcommand name

For example, `skill distill` requires specifying a subcommand (run, list, show).

## Development

### Project Structure

```
packages/cli/
├── src/
│   ├── cli.ts           # Main CLI entry
│   ├── index.ts         # API exports
│   ├── types.ts         # Type definitions
│   ├── commands/        # Command implementations
│   │   ├── index.ts
│   │   ├── init.ts
│   │   ├── lint.ts
│   │   ├── registry.ts
│   │   ├── distill.ts
│   │   ├── convert.ts
│   │   ├── test.ts
│   │   ├── sync.ts
│   │   ├── analytics.ts
│   │   ├── compose.ts
│   │   └── doc.ts
│   └── utils/           # Utility functions
│       ├── index.ts
│       ├── loader.ts    # Package loader
│       ├── suggest.ts   # Command suggestions
│       └── error.ts     # Error handling
├── tests/               # Test files
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Commands

To add a new CLI command:

1. Create new command file in `src/commands/`
2. Implement command registration function
3. Register command in `src/cli.ts`
4. Export in `src/commands/index.ts`
5. Update package mapping in `src/utils/loader.ts` (if needed)

```typescript
// src/commands/mycommand.ts
import type { Command } from 'commander';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface MyCommandModule {
  run: (options: unknown) => Promise<void>;
}

export function registerMyCommand(program: Command): void {
  program
    .command('mycommand')
    .description('My custom command')
    .option('--option <value>', 'An option')
    .action(async (options: { option?: string }) => {
      const result = await loadCommandPackage<MyCommandModule>('mycommand');
      if (!result.success || !result.module) {
        handleMissingPackage('mycommand');
        return;
      }

      try {
        await result.module.run(options);
      } catch (error) {
        handleError(error);
      }
    });
}
```

Then in `src/cli.ts`:

```typescript
import { registerMyCommand } from './commands/mycommand.js';

// ... other commands
registerMyCommand(program);
```

### Testing

```bash
# Run tests
pnpm test

# Run tests and watch for changes
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Building

```bash
# Build project
pnpm build

# Development mode (watch for changes)
pnpm dev

# Type check
pnpm typecheck
```

## Dependencies

### Core Dependencies

- `commander`: Command-line framework
- `chalk`: Terminal colored output
- `cli-table3`: Table output
- `@skillbolt/core`: Core library

### Optional Dependencies

CLI optional dependencies include all feature packages:

- `@skillbolt/lint`
- `@skillbolt/init`
- `@skillbolt/registry`
- `@skillbolt/distill`
- `@skillbolt/convert`
- `@skillbolt/test`
- `@skillbolt/sync`
- `@skillbolt/analytics`
- `@skillbolt/compose`
- `@skillbolt/doc`

These packages are dynamically loaded only when needed to reduce CLI startup time.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## License

MIT

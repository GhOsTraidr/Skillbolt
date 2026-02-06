import chalk from 'chalk';
import { ExitCode } from '../types.js';
import { suggestCommand, formatSuggestions } from './suggest.js';
import { getPackageName, printMissingPackageError } from './loader.js';

export function handleUnknownCommand(command: string): never {
  console.error(chalk.red(`\nError: Unknown command "${command}"`));

  const suggestions = suggestCommand(command);
  if (suggestions.length > 0) {
    console.error(chalk.yellow(`\n${formatSuggestions(suggestions)}`));
  }

  console.error(chalk.gray('\nRun "skill --help" for a list of available commands.'));
  process.exit(ExitCode.COMMAND_NOT_FOUND);
}

export function handleMissingPackage(command: string): never {
  const packageName = getPackageName(command);
  if (packageName) {
    printMissingPackageError(command, packageName);
  }
  process.exit(ExitCode.ERROR);
}

export function handleError(error: unknown, verbose = false): never {
  if (error instanceof Error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    if (verbose && error.stack) {
      console.error(chalk.gray(error.stack));
    }
  } else {
    console.error(chalk.red('\nAn unexpected error occurred'));
    if (verbose) {
      console.error(error);
    }
  }
  process.exit(ExitCode.ERROR);
}

export function handleInvalidArgument(message: string): never {
  console.error(chalk.red(`\nError: ${message}`));
  console.error(chalk.gray('\nRun the command with --help for usage information.'));
  process.exit(ExitCode.INVALID_ARGUMENT);
}

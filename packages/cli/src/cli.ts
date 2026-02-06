import { Command } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'node:module';

import {
  registerLintCommand,
  registerInitCommand,
  registerInstallCommand,
  registerListCommand,
  registerUpdateCommand,
  registerOutdatedCommand,
  registerRemoveCommand,
  registerDistillCommand,
  registerConvertCommand,
  registerTestCommand,
  registerSyncCommand,
  registerAnalyticsCommand,
  registerComposeCommand,
  registerDocCommand,
  registerSearchCommand,
  registerGroupsCommand,
  registerDemoCommand,
  registerTreeCommand,
  registerSkillSearchCommand,
  registerRunCommand,
  registerGuiCommand,
  registerOpenclawCommand,
} from './commands/index.js';
import { suggestCommand, formatSuggestions, getAllCommands } from './utils/index.js';
import { ExitCode } from './types.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

const program = new Command();

program
  .name('skill')
  .description('Skillbolt - AI Agent Skill ecosystem toolset')
  .version(pkg.version, '-V, --version', 'Output the current version')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Suppress non-essential output')
  .option('--config <path>', 'Path to config file')
  .option('--no-color', 'Disable colored output')
  .configureOutput({
    writeErr: (str: string) => process.stderr.write(str),
  });

registerLintCommand(program);
registerInitCommand(program);
registerInstallCommand(program);
registerListCommand(program);
registerUpdateCommand(program);
registerOutdatedCommand(program);
registerRemoveCommand(program);
registerDistillCommand(program);
registerConvertCommand(program);
registerTestCommand(program);
registerSyncCommand(program);
registerAnalyticsCommand(program);
registerComposeCommand(program);
registerDocCommand(program);
registerSearchCommand(program);
registerGroupsCommand(program);
registerDemoCommand(program);
registerTreeCommand(program);
registerSkillSearchCommand(program);
registerRunCommand(program);
registerGuiCommand(program);
registerOpenclawCommand(program);

program.on('command:*', (operands: string[]) => {
  const unknownCommand = operands[0];
  if (unknownCommand) {
    console.error(chalk.red(`\nError: Unknown command "${unknownCommand}"`));

    const suggestions = suggestCommand(unknownCommand);
    if (suggestions.length > 0) {
      console.error(chalk.yellow(`\n${formatSuggestions(suggestions)}`));
    }

    console.error(chalk.gray('\nAvailable commands:'));
    const commands = getAllCommands();
    const uniqueCommands = [...new Set(commands)];
    uniqueCommands.forEach((cmd) => {
      console.error(chalk.gray(`  - ${cmd}`));
    });

    console.error(chalk.gray('\nRun "skill --help" for more information.'));
    process.exit(ExitCode.COMMAND_NOT_FOUND);
  }
});

program.parse();

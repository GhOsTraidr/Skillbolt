import { Command } from 'commander';

import { createGenerateCommand } from './commands/generate.js';
import { createBatchCommand } from './commands/batch.js';

export function createDocCli(): Command {
  const program = new Command()
    .name('skill-doc')
    .description('Generate documentation from SKILL.md files')
    .version('1.0.0');

  program.addCommand(createGenerateCommand());
  program.addCommand(createBatchCommand());

  return program;
}

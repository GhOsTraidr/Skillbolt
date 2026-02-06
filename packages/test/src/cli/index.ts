#!/usr/bin/env node

import { Command } from 'commander';
import { registerRunCommand } from './commands/run.js';
import { registerWatchCommand } from './commands/watch.js';

const program = new Command();

program
  .name('skill-test')
  .description('Skill Kit Testing Framework - Test your skill triggers and behavior')
  .version('1.0.0');

registerRunCommand(program);
registerWatchCommand(program);

program.command('run', { isDefault: true }).description('Run skill tests (default command)');

program.parse();

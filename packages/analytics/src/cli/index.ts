#!/usr/bin/env node
import { Command } from 'commander';
import { reportCommand } from './commands/report.js';
import { exportCommand } from './commands/export.js';
import { analyzeCommand } from './commands/analyze.js';
import { clearCommand } from './commands/clear.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('skill-analytics')
  .description('Skill usage analytics and optimization suggestions')
  .version('1.0.0');

program.addCommand(reportCommand);
program.addCommand(exportCommand);
program.addCommand(analyzeCommand);
program.addCommand(clearCommand);
program.addCommand(configCommand);

program.parse();

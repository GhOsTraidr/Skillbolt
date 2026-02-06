#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import type { InitOptions, TemplateType, PlatformType } from './types.js';
import { initSkill, getTreeDisplay } from './init.js';
import { isValidTemplate, isValidPlatform } from './prompts/questions.js';

const program = new Command();

function parseTriggers(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function validateTemplateOption(value: string): TemplateType {
  if (!isValidTemplate(value)) {
    console.error(chalk.red(`Invalid template: ${value}`));
    console.error('Valid options: minimal, standard, complete');
    process.exit(1);
  }
  return value;
}

function validatePlatformOption(value: string): PlatformType {
  if (!isValidPlatform(value)) {
    console.error(chalk.red(`Invalid platform: ${value}`));
    console.error('Valid options: claude-code, codex, cursor, all');
    process.exit(1);
  }
  return value;
}

program
  .name('skill-init')
  .description('Create a new Skill project with interactive prompts')
  .version('1.0.0')
  .argument('<directory>', 'Target directory for the skill')
  .option('-n, --name <name>', 'Skill name')
  .option('-d, --desc <description>', 'Skill description')
  .option('-t, --triggers <triggers>', 'Trigger phrases (comma separated)', parseTriggers)
  .option('--template <type>', 'Template type: minimal, standard, complete', validateTemplateOption)
  .option(
    '--platform <type>',
    'Target platform: claude-code, codex, cursor, all',
    validatePlatformOption
  )
  .option('--no-interactive', 'Skip interactive prompts')
  .option('-f, --force', 'Overwrite existing directory')
  .option('--author <name>', 'Author name')
  .action(
    async (
      directory: string,
      opts: {
        name?: string;
        desc?: string;
        triggers?: string[];
        template?: TemplateType;
        platform?: PlatformType;
        interactive: boolean;
        force?: boolean;
        author?: string;
      }
    ) => {
      console.log();
      console.log(chalk.bold.cyan('  Creating new Skill'));
      console.log();

      const options: InitOptions = {
        directory,
        name: opts.name,
        description: opts.desc,
        triggers: opts.triggers,
        template: opts.template,
        platform: opts.platform,
        interactive: opts.interactive,
        force: opts.force,
        author: opts.author,
      };

      try {
        const result = await initSkill(options, {
          onStart: () => {
            if (!opts.interactive) {
              console.log(chalk.gray('  Running in non-interactive mode...'));
            }
          },
          onMetadataCollected: (metadata) => {
            console.log();
            console.log(chalk.gray('  Configuration:'));
            console.log(chalk.gray(`    Name: ${metadata.name}`));
            console.log(chalk.gray(`    Template: ${metadata.template}`));
            console.log(chalk.gray(`    Platform: ${metadata.platform}`));
          },
          onDirectoryCreated: () => {
            console.log();
            console.log(chalk.blue('  Creating directory structure...'));
          },
          onFilesGenerated: () => {
            console.log(chalk.blue('  Generating files...'));
          },
        });

        console.log();
        console.log(chalk.green.bold('  Skill created successfully!'));
        console.log();

        const tree = getTreeDisplay(result.directory, result.files);
        console.log(chalk.gray(tree));
        console.log();

        console.log(chalk.bold('  Next steps:'));
        console.log(chalk.gray(`    cd ${directory}`));
        console.log(chalk.gray('    Edit SKILL.md to add your content'));
        console.log(chalk.gray('    skill-lint . to check format'));
        console.log();
      } catch (error) {
        console.log();
        console.error(chalk.red.bold('  Error:'), error instanceof Error ? error.message : error);
        console.log();
        process.exit(1);
      }
    }
  );

program.parse();

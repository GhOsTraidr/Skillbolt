#!/usr/bin/env node

import { Command } from 'commander';
import { logger } from '@skillbolt/core';

import { installSkill } from './commands/install.js';
import { listSkills, formatSkillList } from './commands/list.js';
import { updateSkill, checkOutdated } from './commands/update.js';
import { uninstallSkill } from './commands/uninstall.js';

const program = new Command();

program
  .name('skill-registry')
  .description('Skill Kit Registry - Local skill package manager')
  .version('1.0.0');

program
  .command('install <target>')
  .alias('i')
  .description('Install a skill from local path, GitHub, or registry')
  .option('-l, --link', 'Create symlink instead of copying', false)
  .option('-f, --force', 'Force overwrite existing installation', false)
  .option('-v, --version <version>', 'Specify version to install')
  .action(async (target: string, options: { link: boolean; force: boolean; version?: string }) => {
    try {
      const result = await installSkill({
        target,
        version: options.version,
        link: options.link,
        force: options.force,
      });

      if (result.success) {
        logger.success(result.message);
        if (result.skill) {
          logger.info(`  Name: ${result.skill.name}`);
          logger.info(`  Version: ${result.skill.version}`);
          logger.info(`  Path: ${result.skill.path}`);
        }
      } else {
        logger.error(result.message);
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Installation failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .alias('ls')
  .description('List installed skills')
  .option('-j, --json', 'Output in JSON format', false)
  .option('-f, --filter <pattern>', 'Filter skills by name pattern')
  .action(async (options: { json: boolean; filter?: string }) => {
    try {
      const result = await listSkills({
        format: options.json ? 'json' : 'table',
        filter: options.filter,
      });

      const output = formatSkillList(result.skills, options.json ? 'json' : 'table');
      console.log(output);

      if (!options.json) {
        logger.info(`\nTotal: ${result.total} skill(s)`);
      }
    } catch (error) {
      logger.error(`Failed to list skills: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('update [name]')
  .alias('up')
  .description('Update installed skill(s)')
  .option('-f, --force', 'Force update even if up-to-date', false)
  .option('-v, --version <version>', 'Update to specific version')
  .action(async (name: string | undefined, options: { force: boolean; version?: string }) => {
    try {
      const results = await updateSkill({
        name,
        version: options.version,
        force: options.force,
      });

      let hasErrors = false;
      for (const result of results) {
        if (result.success) {
          logger.success(result.message);
        } else {
          logger.error(result.message);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Update failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('outdated')
  .description('Check for outdated skills')
  .action(async () => {
    try {
      const outdated = await checkOutdated();

      if (outdated.length === 0) {
        logger.success('All skills are up to date!');
        return;
      }

      console.log('\nOutdated skills:');
      console.log('NAME                           CURRENT   LATEST    TYPE');
      console.log('-'.repeat(60));

      for (const skill of outdated) {
        const name = skill.name.padEnd(30);
        const current = skill.currentVersion.padEnd(9);
        const latest = skill.latestVersion.padEnd(9);
        console.log(`${name} ${current} ${latest} ${skill.updateType}`);
      }

      console.log(`\nRun 'skill-registry update' to update all skills.`);
    } catch (error) {
      logger.error(`Failed to check for updates: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('uninstall <name>')
  .alias('rm')
  .alias('remove')
  .description('Uninstall a skill')
  .option('-f, --force', 'Skip confirmation prompt', false)
  .action(async (name: string, options: { force: boolean }) => {
    try {
      const result = await uninstallSkill({
        name,
        force: options.force,
      });

      if (result.success) {
        logger.success(result.message);
      } else {
        logger.error(result.message);
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Uninstall failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();

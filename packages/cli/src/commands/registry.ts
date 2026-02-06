import type { Command } from 'commander';
import chalk from 'chalk';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface RegistryModule {
  installSkill: (options: InstallOptions) => Promise<InstallResult>;
  listSkills: (options: ListOptions) => Promise<{ skills: InstalledSkill[]; total: number }>;
  formatSkillList: (skills: InstalledSkill[], format: string) => string;
  updateSkill: (options: UpdateOptions) => Promise<UpdateResult[]>;
  checkOutdated: () => Promise<OutdatedSkill[]>;
  uninstallSkill: (options: UninstallOptions) => Promise<OperationResult>;
}

interface InstallOptions {
  target: string;
  version?: string;
  link?: boolean;
  force?: boolean;
}

interface InstallResult {
  success: boolean;
  message: string;
  skill?: { name: string; version: string; path: string };
}

interface ListOptions {
  format: string;
  filter?: string;
}

interface InstalledSkill {
  name: string;
  version: string;
  path: string;
}

interface UpdateOptions {
  name?: string;
  version?: string;
  force?: boolean;
}

interface UpdateResult {
  success: boolean;
  message: string;
}

interface OutdatedSkill {
  name: string;
  currentVersion: string;
  latestVersion: string;
  updateType: string;
}

interface UninstallOptions {
  name: string;
  force?: boolean;
}

interface OperationResult {
  success: boolean;
  message: string;
}

async function getRegistryModule(): Promise<RegistryModule> {
  const result = await loadCommandPackage<RegistryModule>('install');
  if (!result.success || !result.module) {
    handleMissingPackage('install');
  }
  return result.module;
}

export function registerInstallCommand(program: Command): void {
  program
    .command('install <target>')
    .alias('i')
    .description('Install a skill from local path, GitHub, or registry')
    .option('-l, --link', 'Create symlink instead of copying', false)
    .option('-f, --force', 'Force overwrite existing installation', false)
    .option('-v, --version <version>', 'Specify version to install')
    .action(
      async (target: string, options: { link: boolean; force: boolean; version?: string }) => {
        try {
          const { installSkill } = await getRegistryModule();
          const result = await installSkill({
            target,
            version: options.version,
            link: options.link,
            force: options.force,
          });

          if (result.success) {
            console.log(chalk.green('✓'), result.message);
            if (result.skill) {
              console.log(chalk.gray(`  Name: ${result.skill.name}`));
              console.log(chalk.gray(`  Version: ${result.skill.version}`));
              console.log(chalk.gray(`  Path: ${result.skill.path}`));
            }
          } else {
            console.error(chalk.red('✗'), result.message);
            process.exit(1);
          }
        } catch (error) {
          handleError(error);
        }
      }
    );
}

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('List installed skills')
    .option('-j, --json', 'Output in JSON format', false)
    .option('-f, --filter <pattern>', 'Filter skills by name pattern')
    .action(async (options: { json: boolean; filter?: string }) => {
      try {
        const { listSkills, formatSkillList } = await getRegistryModule();
        const result = await listSkills({
          format: options.json ? 'json' : 'table',
          filter: options.filter,
        });

        const output = formatSkillList(result.skills, options.json ? 'json' : 'table');
        console.log(output);

        if (!options.json) {
          console.log(`\nTotal: ${result.total} skill(s)`);
        }
      } catch (error) {
        handleError(error);
      }
    });
}

export function registerUpdateCommand(program: Command): void {
  program
    .command('update [name]')
    .alias('up')
    .description('Update installed skill(s)')
    .option('-f, --force', 'Force update even if up-to-date', false)
    .option('-v, --version <version>', 'Update to specific version')
    .action(async (name: string | undefined, options: { force: boolean; version?: string }) => {
      try {
        const { updateSkill } = await getRegistryModule();
        const results = await updateSkill({
          name,
          version: options.version,
          force: options.force,
        });

        let hasErrors = false;
        for (const result of results) {
          if (result.success) {
            console.log(chalk.green('✓'), result.message);
          } else {
            console.error(chalk.red('✗'), result.message);
            hasErrors = true;
          }
        }

        if (hasErrors) {
          process.exit(1);
        }
      } catch (error) {
        handleError(error);
      }
    });
}

export function registerOutdatedCommand(program: Command): void {
  program
    .command('outdated')
    .description('Check for outdated skills')
    .action(async () => {
      try {
        const { checkOutdated } = await getRegistryModule();
        const outdated = await checkOutdated();

        if (outdated.length === 0) {
          console.log(chalk.green('✓'), 'All skills are up to date!');
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

        console.log(`\nRun 'skill update' to update all skills.`);
      } catch (error) {
        handleError(error);
      }
    });
}

export function registerRemoveCommand(program: Command): void {
  program
    .command('remove <name>')
    .alias('rm')
    .alias('uninstall')
    .description('Uninstall a skill')
    .option('-f, --force', 'Skip confirmation prompt', false)
    .action(async (name: string, options: { force: boolean }) => {
      try {
        const { uninstallSkill } = await getRegistryModule();
        const result = await uninstallSkill({
          name,
          force: options.force,
        });

        if (result.success) {
          console.log(chalk.green('✓'), result.message);
        } else {
          console.error(chalk.red('✗'), result.message);
          process.exit(1);
        }
      } catch (error) {
        handleError(error);
      }
    });
}

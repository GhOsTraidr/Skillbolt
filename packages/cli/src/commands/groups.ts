import type { Command } from 'commander';
import chalk from 'chalk';
import { loadPackage, handleError, printMissingPackageError } from '../utils/index.js';
import { ExitCode } from '../types.js';

interface RegistryModule {
  GroupManager: new (configDir?: string) => {
    listGroups(): Array<{
      id: string;
      name: string;
      description: string;
      skillsDir: string;
      active: boolean;
    }>;
    switchGroup(id: string): { id: string; name: string };
    setCustomGroupByName(
      name: string,
      skillsDir: string,
      treePath: string,
      description?: string
    ): { id: string; name: string };
  };
}

export function registerGroupsCommand(program: Command): void {
  const groups = program.command('groups').description('Manage skill groups');

  groups
    .command('list')
    .description('List available skill groups')
    .action(async () => {
      const result = await loadPackage<RegistryModule>('@skillbolt/registry');
      if (!result.module) {
        printMissingPackageError('groups', '@skillbolt/registry');
        process.exitCode = ExitCode.ERROR;
        return;
      }

      try {
        const { GroupManager } = result.module;
        const manager = new GroupManager();
        const allGroups = manager.listGroups();

        console.log(chalk.cyan('\n  Skill Groups\n'));
        for (const group of allGroups) {
          const marker = group.active ? chalk.green(' ● ') : '   ';
          console.log(`${marker}${chalk.bold(group.id)} — ${group.name}`);
          console.log(`      ${chalk.gray(group.description)}`);
          console.log(`      ${chalk.gray(`Skills: ${group.skillsDir}`)}`);
          console.log('');
        }
      } catch (error) {
        handleError(error);
      }
    });

  groups
    .command('switch <name>')
    .description('Switch active skill group')
    .option('--skills-dir <path>', 'Custom skills directory (for custom group)')
    .option('--tree-path <path>', 'Custom tree file path (for custom group)')
    .option('--desc <description>', 'Description for custom group')
    .action(async (name: string, options) => {
      const result = await loadPackage<RegistryModule>('@skillbolt/registry');
      if (!result.module) {
        printMissingPackageError('groups', '@skillbolt/registry');
        process.exitCode = ExitCode.ERROR;
        return;
      }

      try {
        const { GroupManager } = result.module;
        const manager = new GroupManager();

        // Check if name is a default group
        const defaultGroupIds = ['curated', 'top500', 'top1000'];
        const isDefaultGroup = defaultGroupIds.includes(name);

        if (isDefaultGroup) {
          // Switch to default group
          const group = manager.switchGroup(name);
          console.log(chalk.green(`\n  ✓ Switched to group: ${group.name}\n`));
        } else {
          // Create or update custom group with specified name
          if (!options.skillsDir || !options.treePath) {
            console.log(
              chalk.red(
                '\n  ✗ Error: --skills-dir and --tree-path are required for custom group\n'
              )
            );
            process.exitCode = ExitCode.ERROR;
            return;
          }

          const group = manager.setCustomGroupByName(
            name,
            options.skillsDir,
            options.treePath,
            options.desc
          );
          console.log(chalk.green(`\n  ✓ Switched to custom group: ${group.name}\n`));
        }
      } catch (error) {
        handleError(error);
      }
    });
}

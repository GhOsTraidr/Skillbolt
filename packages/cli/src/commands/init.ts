import type { Command } from 'commander';
import chalk from 'chalk';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface InitModule {
  initSkill: (
    options: InitOptions,
    callbacks?: InitCallbacks
  ) => Promise<{ directory: string; files: string[] }>;
  getTreeDisplay: (directory: string, files: string[]) => string;
  isValidTemplate: (value: string) => boolean;
  isValidPlatform: (value: string) => boolean;
}

interface InitOptions {
  directory: string;
  name?: string;
  description?: string;
  triggers?: string[];
  template?: string;
  platform?: string;
  interactive: boolean;
  force?: boolean;
  author?: string;
}

interface InitCallbacks {
  onStart?: () => void;
  onMetadataCollected?: (metadata: { name: string; template: string; platform: string }) => void;
  onDirectoryCreated?: () => void;
  onFilesGenerated?: () => void;
}

function parseTriggers(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function registerInitCommand(program: Command): void {
  program
    .command('init <directory>')
    .description('Create a new Skill project with interactive prompts')
    .option('-n, --name <name>', 'Skill name')
    .option('-d, --desc <description>', 'Skill description')
    .option('-t, --triggers <triggers>', 'Trigger phrases (comma separated)', parseTriggers)
    .option('--template <type>', 'Template type: minimal, standard, complete')
    .option('--platform <type>', 'Target platform: claude-code, codex, cursor, all')
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
          template?: string;
          platform?: string;
          interactive: boolean;
          force?: boolean;
          author?: string;
        }
      ) => {
        const result = await loadCommandPackage<InitModule>('init');

        if (!result.success || !result.module) {
          handleMissingPackage('init');
        }

        const { initSkill, getTreeDisplay, isValidTemplate, isValidPlatform } = result.module;

        if (opts.template && !isValidTemplate(opts.template)) {
          console.error(chalk.red(`Invalid template: ${opts.template}`));
          console.error('Valid options: minimal, standard, complete');
          process.exit(1);
        }

        if (opts.platform && !isValidPlatform(opts.platform)) {
          console.error(chalk.red(`Invalid platform: ${opts.platform}`));
          console.error('Valid options: claude-code, codex, cursor, all');
          process.exit(1);
        }

        console.log();
        console.log(chalk.bold.cyan('  Creating new Skill'));
        console.log();

        try {
          const initResult = await initSkill(
            {
              directory,
              name: opts.name,
              description: opts.desc,
              triggers: opts.triggers,
              template: opts.template,
              platform: opts.platform,
              interactive: opts.interactive,
              force: opts.force,
              author: opts.author,
            },
            {
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
            }
          );

          console.log();
          console.log(chalk.green.bold('  Skill created successfully!'));
          console.log();

          const tree = getTreeDisplay(initResult.directory, initResult.files);
          console.log(chalk.gray(tree));
          console.log();

          console.log(chalk.bold('  Next steps:'));
          console.log(chalk.gray(`    cd ${directory}`));
          console.log(chalk.gray('    Edit SKILL.md to add your content'));
          console.log(chalk.gray('    skill lint . to check format'));
          console.log();
        } catch (error) {
          handleError(error);
        }
      }
    );
}

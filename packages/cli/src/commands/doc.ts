import type { Command } from 'commander';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface DocModule {
  createDocCli: () => Command;
}

export function registerDocCommand(program: Command): void {
  const doc = program.command('doc').description('Generate documentation from SKILL.md files');

  doc
    .command('generate <path>')
    .description('Generate documentation for a skill file')
    .option('-o, --output <dir>', 'Output directory')
    .option('-f, --format <format>', 'Output format (readme, html, json)', 'readme')
    .option('-t, --template <name>', 'Template name')
    .option('--overwrite', 'Overwrite existing files', false)
    .action(
      async (
        inputPath: string,
        options: {
          output?: string;
          format: string;
          template?: string;
          overwrite: boolean;
        }
      ) => {
        const result = await loadCommandPackage<DocModule>('doc');
        if (!result.success || !result.module) {
          handleMissingPackage('doc');
        }

        try {
          const docCli = result.module.createDocCli();
          const generateCmd = docCli.commands.find((c: Command) => c.name() === 'generate');

          if (generateCmd) {
            const args = [inputPath];
            if (options.output) args.push('-o', options.output);
            if (options.format) args.push('-f', options.format);
            if (options.template) args.push('-t', options.template);
            if (options.overwrite) args.push('--overwrite');

            await generateCmd.parseAsync(args, { from: 'user' });
          }
        } catch (error) {
          handleError(error);
        }
      }
    );

  doc
    .command('batch <dir>')
    .description('Generate documentation for multiple skill files')
    .option('-o, --output <dir>', 'Output directory')
    .option('-f, --format <format>', 'Output format (readme, html, json)', 'readme')
    .option('-r, --recursive', 'Process directories recursively', false)
    .option('--overwrite', 'Overwrite existing files', false)
    .action(
      async (
        inputDir: string,
        options: {
          output?: string;
          format: string;
          recursive: boolean;
          overwrite: boolean;
        }
      ) => {
        const result = await loadCommandPackage<DocModule>('doc');
        if (!result.success || !result.module) {
          handleMissingPackage('doc');
        }

        try {
          const docCli = result.module.createDocCli();
          const batchCmd = docCli.commands.find((c: Command) => c.name() === 'batch');

          if (batchCmd) {
            const args = [inputDir];
            if (options.output) args.push('-o', options.output);
            if (options.format) args.push('-f', options.format);
            if (options.recursive) args.push('-r');
            if (options.overwrite) args.push('--overwrite');

            await batchCmd.parseAsync(args, { from: 'user' });
          }
        } catch (error) {
          handleError(error);
        }
      }
    );
}

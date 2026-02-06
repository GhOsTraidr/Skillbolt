import { Command } from 'commander';
import { parseSkillFile, logger } from '@skillbolt/core';
import { resolve, dirname } from 'node:path';

import type { OutputFormat, DocType } from '../../types/index.js';
import { generateReadme } from '../../generator/readme.js';
import { generateApiDocs } from '../../generator/api.js';
import { generateExamples } from '../../generator/examples.js';
import { toJson } from '../../output/json.js';
import { writeOutput } from '../../output/writer.js';

interface GenerateOptions {
  output?: string;
  format?: OutputFormat;
  type?: DocType;
  template?: string;
  toc?: boolean;
  timestamp?: boolean;
}

export function createGenerateCommand(): Command {
  const cmd = new Command('generate')
    .description('Generate documentation from a SKILL.md file')
    .argument('<input>', 'Path to SKILL.md file')
    .option('-o, --output <path>', 'Output file path')
    .option('-f, --format <format>', 'Output format (markdown|html|json)', 'markdown')
    .option('-t, --type <type>', 'Document type (readme|api|examples)', 'readme')
    .option('--template <path>', 'Custom template path')
    .option('--toc', 'Include table of contents', true)
    .option('--no-toc', 'Exclude table of contents')
    .option('--timestamp', 'Include generation timestamp')
    .action(async (input: string, options: GenerateOptions) => {
      try {
        const inputPath = resolve(input);
        const skill = await parseSkillFile(inputPath);

        logger.info(`Generating ${options.type} documentation for ${skill.manifest.name}...`);

        let content: string;
        const format = (options.format ?? 'markdown') as OutputFormat;
        const docType = (options.type ?? 'readme') as DocType;

        if (format === 'json') {
          content = toJson(skill, { prettyPrint: true });
        } else {
          const genOptions = {
            skill,
            format,
            templatePath: options.template,
            includeToc: options.toc,
            includeTimestamp: options.timestamp,
          };

          let result;
          switch (docType) {
            case 'api':
              result = await generateApiDocs(genOptions);
              break;
            case 'examples':
              result = await generateExamples(genOptions);
              break;
            default:
              result = await generateReadme(genOptions);
          }
          content = result.content;
        }

        const outputPath = options.output ?? getDefaultOutputPath(inputPath, docType, format);

        const writeResult = await writeOutput({
          outputPath: resolve(outputPath),
          content,
          createDirs: true,
        });

        if (writeResult.success) {
          logger.success(`Documentation generated: ${writeResult.path}`);
        } else {
          logger.error(`Failed to write: ${writeResult.error?.message}`);
          process.exit(1);
        }
      } catch (error) {
        logger.error(`Generation failed: ${(error as Error).message}`);
        process.exit(1);
      }
    });

  return cmd;
}

function getDefaultOutputPath(inputPath: string, docType: DocType, format: OutputFormat): string {
  const dir = dirname(inputPath);
  const ext = format === 'html' ? '.html' : format === 'json' ? '.json' : '.md';

  let fileName: string;
  switch (docType) {
    case 'api':
      fileName = 'API' + ext;
      break;
    case 'examples':
      fileName = 'EXAMPLES' + ext;
      break;
    default:
      fileName = 'README' + ext;
  }

  return resolve(dir, fileName);
}

import type { Command } from 'commander';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface ConvertModule {
  detectFormat: (content: string) => { format: string; confidence: number; indicators: string[] };
  detectFormatFromPath: (path: string) => string | null;
  parseSkill: (content: string, format: string) => unknown;
  convertWithWarnings: (
    skill: unknown,
    source: string,
    target: string
  ) => { content: string; warnings: string[] };
  convertToAll: (
    skill: unknown,
    source: string
  ) => Record<string, { content: string; warnings: string[] }>;
  ALL_FORMATS: string[];
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export function registerConvertCommand(program: Command): void {
  const convert = program
    .command('convert')
    .description('Convert skill files between different AI agent platform formats');

  convert
    .command('to <path>')
    .description('Convert a skill file to a different format')
    .requiredOption('--to <format>', 'Target format: claude, codex, cursor, continue, or "all"')
    .option('-o, --output <dir>', 'Output directory')
    .option('--overwrite', 'Overwrite existing files', false)
    .option('-r, --recursive', 'Process directories recursively', false)
    .action(
      async (
        inputPath: string,
        opts: { to: string; output?: string; overwrite: boolean; recursive: boolean }
      ) => {
        const result = await loadCommandPackage<ConvertModule>('convert');
        if (!result.success || !result.module) {
          handleMissingPackage('convert');
        }

        const { ALL_FORMATS, logger } = result.module;
        const targetFormat = opts.to.toLowerCase();

        if (targetFormat !== 'all' && !ALL_FORMATS.includes(targetFormat)) {
          logger.error(
            `Invalid format: ${opts.to}. Must be one of: ${ALL_FORMATS.join(', ')}, all`
          );
          process.exit(1);
        }

        try {
          const { stat } = await import('node:fs/promises');
          const inputStat = await stat(inputPath);

          if (inputStat.isDirectory()) {
            await batchConvert(result.module, inputPath, targetFormat, opts);
          } else {
            await convertSingleFile(result.module, inputPath, targetFormat, opts);
          }
        } catch (error) {
          handleError(error);
        }
      }
    );

  convert
    .command('detect <path>')
    .description('Detect the format of a skill file')
    .option('--json', 'Output as JSON', false)
    .action(async (inputPath: string, opts: { json: boolean }) => {
      const result = await loadCommandPackage<ConvertModule>('convert');
      if (!result.success || !result.module) {
        handleMissingPackage('convert');
      }

      const { detectFormat, detectFormatFromPath, logger } = result.module;

      try {
        const { readFile } = await import('node:fs/promises');
        const { resolve } = await import('node:path');
        const content = await readFile(resolve(inputPath), 'utf-8');
        const pathHint = detectFormatFromPath(inputPath);
        const detected = detectFormat(content);

        if (pathHint && pathHint !== detected.format) {
          detected.indicators.push(`Path suggests ${pathHint} format`);
        }

        if (opts.json) {
          console.log(JSON.stringify(detected, null, 2));
        } else {
          const formatNames: Record<string, string> = {
            claude: 'Claude Code',
            codex: 'Codex CLI',
            cursor: 'Cursor',
            continue: 'Continue',
          };
          logger.info(`Format: ${formatNames[detected.format] ?? detected.format}`);
          logger.info(`Confidence: ${detected.confidence}%`);
          logger.info('Indicators:');
          for (const indicator of detected.indicators) {
            logger.info(`  - ${indicator}`);
          }
        }
      } catch (error) {
        handleError(error);
      }
    });
}

async function convertSingleFile(
  mod: ConvertModule,
  inputPath: string,
  targetFormat: string,
  opts: { output?: string; overwrite: boolean }
): Promise<void> {
  const { readFile, writeFile, mkdir, stat } = await import('node:fs/promises');
  const { resolve, dirname, basename, join } = await import('node:path');

  const absolutePath = resolve(inputPath);
  const content = await readFile(absolutePath, 'utf-8');

  const pathFormat = mod.detectFormatFromPath(absolutePath);
  const sourceFormat = pathFormat ?? mod.detectFormat(content).format;
  const skill = mod.parseSkill(content, sourceFormat);

  const outputDir = opts.output ? resolve(opts.output) : dirname(absolutePath);
  await mkdir(outputDir, { recursive: true });

  const FORMAT_EXTENSIONS: Record<string, string> = {
    claude: '.skill.md',
    codex: '.agent.md',
    cursor: '.cursorrules',
    continue: '.config.json',
  };

  const baseName = basename(absolutePath).replace(
    /\.(skill\.md|agent\.md|cursorrules|config\.json|md)$/i,
    ''
  );

  if (targetFormat === 'all') {
    const results = mod.convertToAll(skill, sourceFormat);
    for (const [format, { content: converted, warnings }] of Object.entries(results)) {
      const outputPath = join(outputDir, baseName + FORMAT_EXTENSIONS[format]!);
      await writeFileIfAllowed(outputPath, converted, opts.overwrite, mod.logger, stat, writeFile);
      if (warnings.length > 0) {
        warnings.forEach((w) => mod.logger.warn(`  Warning: ${w}`));
      }
    }
  } else {
    const { content: converted, warnings } = mod.convertWithWarnings(
      skill,
      sourceFormat,
      targetFormat
    );
    const outputPath = join(outputDir, baseName + FORMAT_EXTENSIONS[targetFormat]!);
    await writeFileIfAllowed(outputPath, converted, opts.overwrite, mod.logger, stat, writeFile);
    if (warnings.length > 0) {
      warnings.forEach((w) => mod.logger.warn(`  Warning: ${w}`));
    }
  }
}

async function batchConvert(
  mod: ConvertModule,
  dirPath: string,
  targetFormat: string,
  opts: { output?: string; overwrite: boolean; recursive: boolean }
): Promise<void> {
  const { readdir } = await import('node:fs/promises');
  const { resolve, join } = await import('node:path');

  const absoluteDir = resolve(dirPath);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  let processed = 0;
  let failed = 0;

  for (const entry of entries) {
    const fullPath = join(absoluteDir, entry.name);

    if (entry.isDirectory() && opts.recursive) {
      await batchConvert(mod, fullPath, targetFormat, opts);
    } else if (entry.isFile()) {
      const ext = entry.name.toLowerCase();
      if (ext.endsWith('.md') || ext.endsWith('.cursorrules') || ext.endsWith('.json')) {
        try {
          await convertSingleFile(mod, fullPath, targetFormat, opts);
          processed++;
        } catch {
          failed++;
        }
      }
    }
  }

  mod.logger.info(`Batch conversion complete: ${processed} successful, ${failed} failed`);
}

async function writeFileIfAllowed(
  outputPath: string,
  content: string,
  overwrite: boolean,
  logger: ConvertModule['logger'],
  statFn: typeof import('node:fs/promises').stat,
  writeFn: typeof import('node:fs/promises').writeFile
): Promise<void> {
  if (!overwrite) {
    try {
      await statFn(outputPath);
      logger.error(`Output file already exists: ${outputPath}`);
      return;
    } catch {}
  }
  await writeFn(outputPath, content, 'utf-8');
  logger.info(`Converted: ${outputPath}`);
}

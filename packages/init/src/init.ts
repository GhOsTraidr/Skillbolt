import { resolve } from 'node:path';
import type { InitOptions, SkillMetadata, GeneratedResult, TemplateContext } from './types.js';
import { DEFAULTS } from './types.js';
import { runInteractivePrompts } from './prompts/index.js';
import { createTemplateContext } from './templates/renderer.js';
import { generateDirectory, generateFiles, displayTree } from './generators/index.js';
import { validateInitOptions, validateOutput } from './validators/index.js';

export interface InitSkillCallbacks {
  onStart?: () => void;
  onMetadataCollected?: (metadata: SkillMetadata) => void;
  onDirectoryCreated?: (dirs: string[]) => void;
  onFilesGenerated?: (files: string[]) => void;
  onComplete?: (result: GeneratedResult) => void;
  onError?: (error: Error) => void;
}

export async function initSkill(
  options: InitOptions,
  callbacks: InitSkillCallbacks = {}
): Promise<GeneratedResult> {
  const {
    onStart,
    onMetadataCollected,
    onDirectoryCreated,
    onFilesGenerated,
    onComplete,
    onError,
  } = callbacks;

  try {
    onStart?.();

    const validation = validateInitOptions(options);
    if (!validation.valid) {
      throw new Error(`Invalid options: ${validation.errors.join(', ')}`);
    }

    const targetDir = resolve(options.directory);
    const shouldInteract = options.interactive !== false;

    let metadata: SkillMetadata;

    if (shouldInteract) {
      const defaults: Partial<SkillMetadata> = {
        name: options.name,
        description: options.description,
        triggers: options.triggers,
        template: options.template,
        platform: options.platform,
        author: options.author,
      };
      metadata = await runInteractivePrompts(defaults);
    } else {
      if (!options.name || !options.description) {
        throw new Error('Name and description are required in non-interactive mode');
      }
      metadata = {
        name: options.name,
        description: options.description,
        triggers: options.triggers ?? [],
        template: options.template ?? DEFAULTS.template,
        platform: options.platform ?? DEFAULTS.platform,
        version: DEFAULTS.version,
        author: options.author,
      };
    }

    onMetadataCollected?.(metadata);

    const createdDirs = await generateDirectory(targetDir, metadata.template, {
      force: options.force,
    });
    onDirectoryCreated?.(createdDirs);

    const context: TemplateContext = createTemplateContext(
      metadata.name,
      metadata.description,
      metadata.triggers,
      metadata.platform,
      metadata.version,
      metadata.author
    );

    const generatedFiles = await generateFiles(targetDir, metadata.template, context);
    onFilesGenerated?.(generatedFiles);

    const outputValidation = await validateOutput(targetDir, metadata.template);
    if (!outputValidation.valid) {
      throw new Error(`Output validation failed: ${outputValidation.errors.join(', ')}`);
    }

    const result: GeneratedResult = {
      directory: targetDir,
      files: generatedFiles.map((f) => `${targetDir}/${f}`),
      metadata,
    };

    onComplete?.(result);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

export function getTreeDisplay(directory: string, files: string[]): string {
  const relativeFiles = files.map((f) => f.replace(`${directory}/`, ''));
  return displayTree(directory, relativeFiles);
}

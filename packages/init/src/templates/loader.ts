import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateType, TemplateFile, TemplateDefinition } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getTemplatesDir(): string {
  if (__dirname.endsWith('/dist') || __dirname.endsWith('\\dist')) {
    return join(__dirname, '..', 'templates');
  }
  return join(__dirname, '..', '..', 'templates');
}

const TEMPLATES_DIR = getTemplatesDir();

async function readFilesRecursively(dir: string, basePath: string = ''): Promise<TemplateFile[]> {
  const files: TemplateFile[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const subFiles = await readFilesRecursively(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.hbs')) {
      const content = await readFile(fullPath, 'utf-8');
      const outputPath = relativePath.replace(/\.hbs$/, '');
      files.push({ path: outputPath, content });
    }
  }

  return files;
}

function getDirectoriesForTemplate(type: TemplateType): string[] {
  switch (type) {
    case 'minimal':
      return [];
    case 'standard':
      return ['references'];
    case 'complete':
      return ['references', 'examples', 'scripts'];
    default:
      throw new Error(`Unknown template type: ${type}`);
  }
}

function getTemplateDescription(type: TemplateType): string {
  switch (type) {
    case 'minimal':
      return 'Minimal template with only SKILL.md';
    case 'standard':
      return 'Standard template with SKILL.md, references/, and README.md';
    case 'complete':
      return 'Complete template with examples/, scripts/, and full documentation';
    default:
      throw new Error(`Unknown template type: ${type}`);
  }
}

export async function loadTemplate(type: TemplateType): Promise<TemplateFile[]> {
  const templateDir = join(TEMPLATES_DIR, type);

  try {
    const stats = await stat(templateDir);
    if (!stats.isDirectory()) {
      throw new Error(`Template directory not found: ${type}`);
    }
  } catch {
    throw new Error(`Unknown template: ${type}`);
  }

  return readFilesRecursively(templateDir);
}

export async function getTemplateDefinition(type: TemplateType): Promise<TemplateDefinition> {
  const files = await loadTemplate(type);

  return {
    type,
    description: getTemplateDescription(type),
    directories: getDirectoriesForTemplate(type),
    files,
  };
}

export function getTemplateFiles(type: TemplateType): string[] {
  switch (type) {
    case 'minimal':
      return ['SKILL.md'];
    case 'standard':
      return ['SKILL.md', 'README.md', 'references/patterns.md'];
    case 'complete':
      return [
        'SKILL.md',
        'README.md',
        'references/patterns.md',
        'references/advanced.md',
        'examples/example.sh',
        'scripts/validate.sh',
      ];
    default:
      throw new Error(`Unknown template type: ${type}`);
  }
}

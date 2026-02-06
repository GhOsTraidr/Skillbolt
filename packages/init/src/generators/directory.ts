import { mkdir, rm, stat, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { TemplateType } from '../types.js';

export interface DirectoryOptions {
  force?: boolean;
}

export async function directoryExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function isDirectoryEmpty(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path);
    return entries.length === 0;
  } catch {
    return true;
  }
}

function getDirectoriesForTemplate(template: TemplateType): string[] {
  switch (template) {
    case 'minimal':
      return [];
    case 'standard':
      return ['references'];
    case 'complete':
      return ['references', 'examples', 'scripts'];
    default:
      throw new Error(`Unknown template: ${template}`);
  }
}

export async function generateDirectory(
  targetDir: string,
  template: TemplateType,
  options: DirectoryOptions = {}
): Promise<string[]> {
  const { force = false } = options;
  const exists = await directoryExists(targetDir);

  if (exists) {
    const empty = await isDirectoryEmpty(targetDir);
    if (!empty && !force) {
      throw new Error(
        `Directory already exists and is not empty: ${targetDir}. Use --force to overwrite.`
      );
    }
    if (force) {
      await rm(targetDir, { recursive: true, force: true });
    }
  }

  await mkdir(targetDir, { recursive: true });
  const createdDirs = [targetDir];

  const subDirs = getDirectoriesForTemplate(template);
  for (const subDir of subDirs) {
    const fullPath = join(targetDir, subDir);
    await mkdir(fullPath, { recursive: true });
    createdDirs.push(fullPath);
  }

  return createdDirs;
}

export function displayTree(directory: string, files: string[], indent: string = ''): string {
  const lines: string[] = [];
  const dirName = directory.split('/').pop() ?? directory;
  lines.push(`${indent}${dirName}/`);

  const sortedFiles = [...files].sort();
  const filesByDir = new Map<string, string[]>();

  for (const file of sortedFiles) {
    const parts = file.split('/');
    if (parts.length === 1) {
      filesByDir.set('', [...(filesByDir.get('') ?? []), parts[0] ?? '']);
    } else {
      const dir = parts[0] ?? '';
      const rest = parts.slice(1).join('/');
      filesByDir.set(dir, [...(filesByDir.get(dir) ?? []), rest]);
    }
  }

  const entries = Array.from(filesByDir.entries()).sort(([a], [b]) => {
    if (a === '') return 1;
    if (b === '') return -1;
    return a.localeCompare(b);
  });

  for (let i = 0; i < entries.length; i++) {
    const [dir, dirFiles] = entries[i] ?? ['', []];
    const isLast = i === entries.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    const childIndent = isLast ? '    ' : '│   ';

    if (dir === '') {
      for (let j = 0; j < dirFiles.length; j++) {
        const file = dirFiles[j];
        const fileIsLast = j === dirFiles.length - 1 && isLast;
        const filePrefix = fileIsLast ? '└── ' : '├── ';
        lines.push(`${indent}${filePrefix}${file}`);
      }
    } else {
      lines.push(`${indent}${prefix}${dir}/`);
      for (let j = 0; j < dirFiles.length; j++) {
        const file = dirFiles[j];
        const fileIsLast = j === dirFiles.length - 1;
        const filePrefix = fileIsLast ? '└── ' : '├── ';
        lines.push(`${indent}${childIndent}${filePrefix}${file}`);
      }
    }
  }

  return lines.join('\n');
}

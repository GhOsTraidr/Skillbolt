import { resolve, normalize, dirname, basename, extname, join, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import { stat } from 'node:fs/promises';

export function normalizePath(path: string): string {
  return normalize(path).replace(/\\/g, '/');
}

export function expandTilde(path: string): string {
  if (path.startsWith('~')) {
    return join(homedir(), path.slice(1));
  }
  return path;
}

export function resolveSkillPath(path: string, cwd: string = process.cwd()): string {
  const expanded = expandTilde(path);
  return isAbsolute(expanded) ? expanded : resolve(cwd, expanded);
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function isFile(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export function getSkillDir(skillPath: string): string {
  return dirname(skillPath);
}

export function getSkillName(skillPath: string): string {
  const base = basename(skillPath);
  const ext = extname(base);
  return ext ? base.slice(0, -ext.length) : base;
}

export function joinPath(...paths: string[]): string {
  return normalizePath(join(...paths));
}

export { resolve, dirname, basename, extname, isAbsolute };

import chalk from 'chalk';
import type { PackageLoadResult } from '../types.js';

const PACKAGE_MAP: Record<string, string> = {
  lint: '@skillbolt/lint',
  init: '@skillbolt/init',
  install: '@skillbolt/registry',
  list: '@skillbolt/registry',
  update: '@skillbolt/registry',
  remove: '@skillbolt/registry',
  uninstall: '@skillbolt/registry',
  distill: '@skillbolt/distill',
  convert: '@skillbolt/convert',
  test: '@skillbolt/test',
  groups: '@skillbolt/registry',
  demo: '@skillbolt/core',
  sync: '@skillbolt/sync',
  analytics: '@skillbolt/analytics',
  compose: '@skillbolt/compose',
  doc: '@skillbolt/doc',
  tree: '@skillbolt/tree',
  'tree-build': '@skillbolt/tree',
  'tree-show': '@skillbolt/tree',
  'tree-stats': '@skillbolt/tree',
  'skill-search': '@skillbolt/search',
  run: '@skillbolt/execute',
  gui: '@skillbolt/web-ui',
  openclaw: '@skillbolt/openclaw',
  oc: '@skillbolt/openclaw',
};

export function getPackageName(command: string): string | undefined {
  return PACKAGE_MAP[command];
}

export function getAllCommands(): string[] {
  return Object.keys(PACKAGE_MAP);
}

export function getUniquePackages(): string[] {
  return [...new Set(Object.values(PACKAGE_MAP))];
}

export async function loadPackage<T = unknown>(packageName: string): Promise<PackageLoadResult<T>> {
  try {
    const module = (await import(packageName)) as T;
    return { success: true, module };
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
      return {
        success: false,
        error: new Error(`Package "${packageName}" is not installed`),
      };
    }
    return { success: false, error: err };
  }
}

export async function loadCommandPackage<T = unknown>(
  command: string
): Promise<PackageLoadResult<T>> {
  const packageName = getPackageName(command);
  if (!packageName) {
    return {
      success: false,
      error: new Error(`Unknown command: ${command}`),
    };
  }
  return loadPackage<T>(packageName);
}

export function printMissingPackageError(command: string, packageName: string): void {
  console.error(chalk.red(`\nError: Command "${command}" requires ${packageName}`));
  console.error(chalk.gray(`\nInstall it with:`));
  console.error(chalk.cyan(`  npm install ${packageName}`));
  console.error(chalk.gray(`  or`));
  console.error(chalk.cyan(`  pnpm add ${packageName}`));
  console.error();
}

export function isPackageInstalled(packageName: string): boolean {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

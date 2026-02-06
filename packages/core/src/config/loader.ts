import { homedir } from 'node:os';
import { join } from 'node:path';
import { cosmiconfig } from 'cosmiconfig';

import type {
  SkillboltConfig,
  GlobalConfig,
  ProjectConfig,
  ResolvedConfig,
} from '../types/config.js';
import { DEFAULT_CONFIG } from '../types/config.js';
import { ConfigError } from '../errors/index.js';

const GLOBAL_CONFIG_DIR = '.skill-kit';
const GLOBAL_CONFIG_FILE = 'config.json';

const explorer = cosmiconfig('skillbolt', {
  searchPlaces: [
    '.skillboltrc',
    '.skillboltrc.json',
    '.skillboltrc.yaml',
    '.skillboltrc.yml',
    '.skillboltrc.js',
    '.skillboltrc.cjs',
    'skillbolt.config.js',
    'skillbolt.config.cjs',
  ],
});

function getGlobalConfigPath(): string {
  return join(homedir(), GLOBAL_CONFIG_DIR, GLOBAL_CONFIG_FILE);
}

export async function loadGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    const configPath = getGlobalConfigPath();
    const result = await explorer.load(configPath);
    if (result) {
      return {
        ...(result.config as SkillboltConfig),
        configPath: result.filepath,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export interface LoadProjectConfigOptions {
  cwd?: string;
  stopDir?: string;
}

export async function loadProjectConfig(
  options: LoadProjectConfigOptions = {}
): Promise<ProjectConfig | null> {
  const { cwd = process.cwd(), stopDir } = options;

  try {
    const result = await explorer.search(cwd);
    if (result && !result.isEmpty) {
      if (stopDir && !result.filepath.startsWith(stopDir)) {
        return null;
      }
      return {
        ...(result.config as SkillboltConfig),
        configPath: result.filepath,
      };
    }
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConfigError(`Failed to load project config: ${message}`);
  }
}

function deepMerge(target: SkillboltConfig, source: SkillboltConfig): SkillboltConfig {
  const result: SkillboltConfig = { ...target };

  if (source.extends !== undefined) result.extends = source.extends;
  if (source.lint) result.lint = { ...target.lint, ...source.lint };
  if (source.registry) result.registry = { ...target.registry, ...source.registry };
  if (source.sync) result.sync = { ...target.sync, ...source.sync };
  if (source.analytics) result.analytics = { ...target.analytics, ...source.analytics };
  if (source.defaults) result.defaults = { ...target.defaults, ...source.defaults };
  if (source.test) result.test = { ...target.test, ...source.test };
  if (source.openclaw) result.openclaw = { ...target.openclaw, ...source.openclaw };

  return result;
}

export interface LoadConfigOptions {
  cwd?: string;
  global?: boolean;
}

export async function loadConfig(options: LoadConfigOptions = {}): Promise<ResolvedConfig> {
  const { cwd, global: loadGlobal = true } = options;

  let config: SkillboltConfig = { ...DEFAULT_CONFIG };
  let hasGlobal = false;
  let hasProject = false;

  if (loadGlobal) {
    const globalConfig = await loadGlobalConfig();
    if (globalConfig) {
      config = deepMerge(config, globalConfig);
      hasGlobal = true;
    }
  }

  const projectConfig = await loadProjectConfig({ cwd });
  if (projectConfig) {
    config = deepMerge(config, projectConfig);
    hasProject = true;
  }

  const defaultLint = DEFAULT_CONFIG.lint!;
  const defaultRegistry = DEFAULT_CONFIG.registry!;
  const defaultSync = DEFAULT_CONFIG.sync!;
  const defaultAnalytics = DEFAULT_CONFIG.analytics!;
  const defaultDefaults = DEFAULT_CONFIG.defaults!;
  const defaultTest = DEFAULT_CONFIG.test!;

  return {
    extends: config.extends,
    lint: {
      extends: config.lint?.extends ?? defaultLint.extends ?? 'recommended',
      rules: config.lint?.rules ?? defaultLint.rules ?? {},
      ignore: config.lint?.ignore ?? defaultLint.ignore ?? [],
    },
    registry: {
      remote: config.registry?.remote ?? defaultRegistry.remote ?? '',
      cache: config.registry?.cache ?? defaultRegistry.cache ?? '',
    },
    sync: {
      provider: config.sync?.provider ?? defaultSync.provider ?? 'supabase',
      autoSync: config.sync?.autoSync ?? defaultSync.autoSync ?? false,
    },
    analytics: {
      enabled: config.analytics?.enabled ?? defaultAnalytics.enabled ?? true,
      anonymous: config.analytics?.anonymous ?? defaultAnalytics.anonymous ?? true,
    },
    defaults: {
      platform: config.defaults?.platform ?? defaultDefaults.platform ?? 'claude-code',
      template: config.defaults?.template ?? defaultDefaults.template ?? 'standard',
    },
    test: {
      timeout: config.test?.timeout ?? defaultTest.timeout ?? 5000,
    },
    isGlobal: hasGlobal,
    isProject: hasProject,
  };
}

export function getConfigPath(): { global: string; project: string | null } {
  return {
    global: getGlobalConfigPath(),
    project: null,
  };
}

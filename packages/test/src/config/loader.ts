import { cosmiconfig } from 'cosmiconfig';
import { parse as parseYaml } from 'yaml';
import type {
  SkillTestConfig,
  PartialSkillTestConfig,
  CliOptions,
  LoadedConfig,
} from '../types/index.js';
import { DEFAULT_TEST_CONFIG } from '../types/config.js';

const MODULE_NAME = 'skilltest';

function mergeConfig(
  base: SkillTestConfig,
  fileConfig: PartialSkillTestConfig,
  cliOptions: CliOptions
): SkillTestConfig {
  const config: SkillTestConfig = {
    testDir: fileConfig.testDir ?? base.testDir,
    include: fileConfig.include ?? base.include,
    exclude: fileConfig.exclude ?? base.exclude,
    timeout: fileConfig.timeout ?? base.timeout,
    coverage: { ...base.coverage, ...fileConfig.coverage },
    reporters: fileConfig.reporters ?? base.reporters,
    mockDir: fileConfig.mockDir ?? base.mockDir,
    watch: { ...base.watch, ...fileConfig.watch },
    parallel: fileConfig.parallel ?? base.parallel,
    maxWorkers: fileConfig.maxWorkers ?? base.maxWorkers,
    failFast: fileConfig.failFast ?? base.failFast,
    verbose: fileConfig.verbose ?? base.verbose,
    updateSnapshots: fileConfig.updateSnapshots ?? base.updateSnapshots,
    matchTypes: { ...base.matchTypes, ...fileConfig.matchTypes },
  };

  if (cliOptions.testDir !== undefined) {
    config.testDir = cliOptions.testDir;
  }
  if (cliOptions.timeout !== undefined) {
    config.timeout = cliOptions.timeout;
  }
  if (cliOptions.coverage !== undefined) {
    config.coverage.enabled = cliOptions.coverage;
  }
  if (cliOptions.reporter !== undefined) {
    config.reporters = [cliOptions.reporter];
  }
  if (cliOptions.verbose !== undefined) {
    config.verbose = cliOptions.verbose;
  }
  if (cliOptions.failFast !== undefined) {
    config.failFast = cliOptions.failFast;
  }
  if (cliOptions.pattern !== undefined) {
    config.include = [cliOptions.pattern];
  }
  if (cliOptions.updateSnapshots !== undefined) {
    config.updateSnapshots = cliOptions.updateSnapshots;
  }

  return config;
}

export interface LoadConfigOptions {
  cwd?: string;
  cliOptions?: CliOptions;
  configPath?: string;
}

export async function loadTestConfig(options: LoadConfigOptions = {}): Promise<LoadedConfig> {
  const cwd = options.cwd ?? process.cwd();
  const cliOptions = options.cliOptions ?? {};

  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      'package.json',
      `.${MODULE_NAME}rc`,
      `.${MODULE_NAME}rc.json`,
      `.${MODULE_NAME}rc.yaml`,
      `.${MODULE_NAME}rc.yml`,
      `.${MODULE_NAME}rc.js`,
      `.${MODULE_NAME}rc.cjs`,
      `.${MODULE_NAME}rc.mjs`,
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.cjs`,
      `${MODULE_NAME}.config.mjs`,
      `${MODULE_NAME}.config.ts`,
    ],
    loaders: {
      '.yaml': (_: string, content: string) => parseYaml(content),
      '.yml': (_: string, content: string) => parseYaml(content),
    },
  });

  try {
    let result;

    if (options.configPath) {
      result = await explorer.load(options.configPath);
    } else {
      result = await explorer.search(cwd);
    }

    if (result && result.config) {
      const fileConfig = result.config as PartialSkillTestConfig;
      const config = mergeConfig(DEFAULT_TEST_CONFIG, fileConfig, cliOptions);

      return {
        config,
        filepath: result.filepath,
        fromFile: true,
      };
    }
  } catch {
    // Config file not found or parse error - use defaults
  }

  const config = mergeConfig(DEFAULT_TEST_CONFIG, {}, cliOptions);

  return {
    config,
    fromFile: false,
  };
}

export function defineConfig(config: PartialSkillTestConfig): PartialSkillTestConfig {
  return config;
}

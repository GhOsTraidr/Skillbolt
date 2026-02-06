import { cosmiconfig } from 'cosmiconfig';
import type { LintConfigInput, ResolvedLintConfig, LoadedConfig } from '../types/index.js';
import { defaultConfig, presets } from './defaults.js';

const MODULE_NAME = 'skilllint';

const explorer = cosmiconfig(MODULE_NAME, {
  searchPlaces: [
    'package.json',
    `.${MODULE_NAME}rc`,
    `.${MODULE_NAME}rc.json`,
    `.${MODULE_NAME}rc.yaml`,
    `.${MODULE_NAME}rc.yml`,
    `.${MODULE_NAME}rc.js`,
    `.${MODULE_NAME}rc.cjs`,
    `${MODULE_NAME}.config.js`,
    `${MODULE_NAME}.config.cjs`,
  ],
});

export async function loadLintConfig(
  configFile?: string,
  cwd?: string
): Promise<LoadedConfig | null> {
  try {
    const result = configFile ? await explorer.load(configFile) : await explorer.search(cwd);

    if (!result || result.isEmpty) {
      return null;
    }

    return {
      config: result.config as LintConfigInput,
      filepath: result.filepath,
    };
  } catch {
    return null;
  }
}

export function getResolvedConfig(input?: LintConfigInput): ResolvedLintConfig {
  if (!input) {
    return { ...defaultConfig };
  }

  let baseConfig = { ...defaultConfig };

  if (input.extends) {
    const extendsArray = Array.isArray(input.extends) ? input.extends : [input.extends];

    for (const ext of extendsArray) {
      const preset = presets[ext];
      if (preset) {
        baseConfig = {
          rules: { ...baseConfig.rules, ...preset.rules },
          ignore: [
            ...baseConfig.ignore,
            ...preset.ignore.filter((i) => !baseConfig.ignore.includes(i)),
          ],
        };
      }
    }
  }

  return {
    rules: { ...baseConfig.rules, ...input.rules },
    ignore: input.ignore ?? baseConfig.ignore,
  };
}

export function defineConfig(config: LintConfigInput): LintConfigInput {
  return config;
}

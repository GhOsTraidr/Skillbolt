/**
 * CLI global options
 */
export interface GlobalOptions {
  verbose?: boolean;
  quiet?: boolean;
  config?: string;
  color?: boolean;
}

/**
 * Command metadata for registration
 */
export interface CommandMeta {
  name: string;
  description: string;
  packageName: string;
  aliases?: string[];
}

/**
 * Package load result
 */
export interface PackageLoadResult<T = unknown> {
  success: boolean;
  module?: T;
  error?: Error;
}

/**
 * Exit codes
 */
export const ExitCode = {
  SUCCESS: 0,
  ERROR: 1,
  INVALID_ARGUMENT: 2,
  COMMAND_NOT_FOUND: 127,
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];

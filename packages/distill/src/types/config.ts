export type Platform = 'claude' | 'codex' | 'cursor';

export interface Config {
  defaultPlatform: Platform;
  apiKey?: string;
  outputDir: string;
  autoInstall: boolean;
  sessionSources: {
    claude?: string;
    codex?: string;
    cursor?: string;
  };
}

export interface DistillOptions {
  sessionId?: string;
  last?: boolean;
  prompts?: string[];
  format?: Platform | 'all';
  outputDir?: string;
  install?: boolean;
  interactive?: boolean;
}

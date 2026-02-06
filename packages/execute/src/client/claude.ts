import type { AgentClient } from '../types.js';

export interface ClaudeAgentOptions {
  sessionId: string;
  cwd?: string;
  logCallback?: (message: string, level: string) => void;
  allowedTools?: string[];
  disallowedTools?: string[];
}

export class ClaudeAgentClient implements AgentClient {
  constructor(_options: ClaudeAgentOptions) {
    // Will be implemented when Claude Agent SDK is available
  }

  async execute(_prompt: string): Promise<string> {
    throw new Error(
      'Claude Agent SDK is not installed. Install claude-agent-sdk to use this client.'
    );
  }

  async close(): Promise<void> {}
}

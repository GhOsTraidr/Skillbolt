import type { AgentClient } from '../types.js';

export type { AgentClient } from '../types.js';

export class MockAgentClient implements AgentClient {
  responses: string[];
  callCount: number;

  constructor(responses: string[] = []) {
    this.responses = [...responses];
    this.callCount = 0;
  }

  async execute(_prompt: string): Promise<string> {
    const response = this.responses[this.callCount] ?? '';
    this.callCount += 1;
    return response;
  }

  async close(): Promise<void> {}
}

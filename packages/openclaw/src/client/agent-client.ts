/**
 * AgentClient implementation that executes prompts via the OpenClaw gateway.
 * Implements the @skillbolt/execute AgentClient interface.
 */

import type { AgentClient } from '@skillbolt/execute';
import { OpenClawGatewayClient } from './gateway-client.js';
import type { OpenClawAgentClientOptions } from './types.js';

export class OpenClawAgentClient implements AgentClient {
  private gateway: OpenClawGatewayClient;
  private agentId: string;
  private sessionKey?: string;
  private logCallback?: (message: string, level: string) => void;
  private ownsGateway: boolean;

  constructor(options: OpenClawAgentClientOptions = {}) {
    this.agentId = options.agentId ?? 'default';
    this.sessionKey = options.sessionKey;
    this.logCallback = options.logCallback;

    // Create a gateway client if URL provided, otherwise expect connect() to be called
    this.gateway = new OpenClawGatewayClient({ url: options.gatewayUrl });
    this.ownsGateway = true;
  }

  /**
   * Create an OpenClawAgentClient using an existing gateway connection.
   */
  static fromGateway(
    gateway: OpenClawGatewayClient,
    options?: Omit<OpenClawAgentClientOptions, 'gatewayUrl'>
  ): OpenClawAgentClient {
    const client = new OpenClawAgentClient(options);
    client.gateway = gateway;
    client.ownsGateway = false;
    return client;
  }

  /**
   * Execute a prompt via the OpenClaw agent and return the response.
   */
  async execute(prompt: string): Promise<string> {
    if (!this.gateway.connected) {
      this.log('Connecting to OpenClaw gateway...', 'info');
      await this.gateway.connect();
      this.log('Connected to gateway', 'ok');
    }

    this.log(`Sending prompt to agent "${this.agentId}"...`, 'info');

    try {
      const result = await this.gateway.call<{ text: string }>('agent.execute', {
        agentId: this.agentId,
        prompt,
        ...(this.sessionKey ? { sessionKey: this.sessionKey } : {}),
      });

      const response = typeof result === 'string' ? result : result?.text ?? '';
      this.log('Agent response received', 'ok');
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log(`Agent execution failed: ${message}`, 'error');
      throw error;
    }
  }

  /**
   * Close the connection. If we created the gateway, disconnect it.
   */
  async close(): Promise<void> {
    if (this.ownsGateway) {
      await this.gateway.disconnect();
    }
  }

  private log(message: string, level: string): void {
    this.logCallback?.(message, level);
  }
}

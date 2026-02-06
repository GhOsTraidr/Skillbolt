/**
 * WebSocket client for communicating with the OpenClaw gateway.
 * Implements JSON-RPC over WebSocket protocol.
 */

import type {
  GatewayClientOptions,
  GatewayStatus,
  ChannelInfo,
  RPCRequest,
  RPCResponse,
} from './types.js';

type PendingCall = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class OpenClawGatewayClient {
  private url: string;
  private connectTimeout: number;
  private callTimeout: number;
  private autoReconnect: boolean;
  private maxReconnectAttempts: number;

  private ws: WebSocket | null = null;
  private pendingCalls: Map<string, PendingCall> = new Map();
  private callCounter = 0;
  private reconnectAttempts = 0;
  private _connected = false;

  constructor(options: GatewayClientOptions = {}) {
    this.url = options.url ?? 'ws://127.0.0.1:18789';
    this.connectTimeout = options.connectTimeout ?? 5000;
    this.callTimeout = options.callTimeout ?? 30000;
    this.autoReconnect = options.autoReconnect ?? true;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 3;
  }

  /** Whether the WebSocket connection is currently open */
  get connected(): boolean {
    return this._connected;
  }

  /**
   * Connect to the OpenClaw gateway.
   * Resolves when the WebSocket is open, rejects on timeout or error.
   */
  async connect(): Promise<void> {
    if (this._connected) return;

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Connection timeout after ${this.connectTimeout}ms to ${this.url}`));
      }, this.connectTimeout);

      try {
        this.ws = new WebSocket(this.url);

        this.ws.addEventListener('open', () => {
          clearTimeout(timer);
          this._connected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.ws.addEventListener('message', (event) => {
          this.handleMessage(typeof event.data === 'string' ? event.data : String(event.data));
        });

        this.ws.addEventListener('close', () => {
          this._connected = false;
          this.rejectAllPending('Connection closed');
          if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connect().catch(() => {});
            }, 1000 * this.reconnectAttempts);
          }
        });

        this.ws.addEventListener('error', () => {
          clearTimeout(timer);
          if (!this._connected) {
            reject(new Error(`Failed to connect to OpenClaw gateway at ${this.url}`));
          }
        });
      } catch (error) {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Disconnect from the gateway.
   */
  async disconnect(): Promise<void> {
    this.autoReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
    this.rejectAllPending('Disconnected');
  }

  /**
   * Make an RPC call to the gateway.
   */
  async call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.ws || !this._connected) {
      throw new Error('Not connected to OpenClaw gateway. Call connect() first.');
    }

    const id = `sk_${++this.callCounter}_${Date.now()}`;
    const request: RPCRequest = { id, method, ...(params ? { params } : {}) };

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingCalls.delete(id);
        reject(new Error(`RPC call "${method}" timed out after ${this.callTimeout}ms`));
      }, this.callTimeout);

      this.pendingCalls.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timer,
      });

      this.ws!.send(JSON.stringify(request));
    });
  }

  // --- Convenience methods ---

  async getStatus(): Promise<GatewayStatus> {
    return this.call<GatewayStatus>('gateway.status');
  }

  async listChannels(): Promise<ChannelInfo[]> {
    return this.call<ChannelInfo[]>('channels.list');
  }

  async sendMessage(options: {
    channel: string;
    to: string;
    text: string;
    agentId?: string;
  }): Promise<void> {
    await this.call('message.send', options);
  }

  // --- Internal ---

  private handleMessage(data: string): void {
    let response: RPCResponse;
    try {
      response = JSON.parse(data) as RPCResponse;
    } catch {
      return; // Ignore non-JSON messages (e.g., events)
    }

    if (!response.id) return; // Not an RPC response

    const pending = this.pendingCalls.get(response.id);
    if (!pending) return;

    this.pendingCalls.delete(response.id);
    clearTimeout(pending.timer);

    if (response.ok) {
      pending.resolve(response.result);
    } else {
      pending.reject(
        new Error(response.error?.message ?? `RPC call failed: ${response.id}`)
      );
    }
  }

  private rejectAllPending(reason: string): void {
    for (const [, pending] of this.pendingCalls) {
      clearTimeout(pending.timer);
      pending.reject(new Error(reason));
    }
    this.pendingCalls.clear();
  }
}

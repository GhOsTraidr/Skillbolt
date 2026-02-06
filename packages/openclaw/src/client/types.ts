/**
 * Type definitions for OpenClaw gateway communication.
 */

export interface GatewayStatus {
  version: string;
  uptime: number;
  channels: string[];
  agents: string[];
}

export interface ChannelInfo {
  id: string;
  label: string;
  connected: boolean;
  accounts: number;
}

export interface GatewayMessage {
  text: string;
  channel: string;
  peerId: string;
  timestamp: string;
  agentId?: string;
  sessionKey?: string;
}

/** JSON-RPC request frame sent to gateway */
export interface RPCRequest {
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

/** JSON-RPC response frame received from gateway */
export interface RPCResponse {
  id: string;
  ok: boolean;
  result?: unknown;
  error?: {
    code?: number;
    message: string;
  };
}

export interface GatewayClientOptions {
  /** WebSocket URL, default ws://127.0.0.1:18789 */
  url?: string;
  /** Connection timeout in ms, default 5000 */
  connectTimeout?: number;
  /** RPC call timeout in ms, default 30000 */
  callTimeout?: number;
  /** Auto-reconnect on disconnect, default true */
  autoReconnect?: boolean;
  /** Max reconnect attempts, default 3 */
  maxReconnectAttempts?: number;
}

export interface OpenClawAgentClientOptions {
  /** Gateway client instance */
  gatewayUrl?: string;
  /** Agent ID for routing, default 'default' */
  agentId?: string;
  /** Session key override */
  sessionKey?: string;
  /** Log callback for streaming progress */
  logCallback?: (message: string, level: string) => void;
}

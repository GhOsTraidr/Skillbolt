import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import type { WSMessage } from './types.js';

type HandlerOptions = {
  onMessage: (ws: WebSocket, msg: WSMessage) => void;
};

const safeJsonParse = (value: string): WSMessage | null => {
  try {
    const parsed = JSON.parse(value) as WSMessage;
    if (!parsed || typeof parsed.type !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const broadcast = (
  wss: WebSocketServer,
  type: string,
  data: Record<string, unknown>
): void => {
  const payload = JSON.stringify({ type, data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

export function createWebSocketHandler(options: HandlerOptions): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  const pingInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  wss.on('connection', (ws, _request: IncomingMessage) => {
    ws.on('message', (raw) => {
      const parsed = safeJsonParse(raw.toString());
      if (!parsed) {
        ws.send(JSON.stringify({ type: 'error', data: { message: 'Invalid message' } }));
        return;
      }
      options.onMessage(ws, parsed);
    });
  });

  return wss;
}

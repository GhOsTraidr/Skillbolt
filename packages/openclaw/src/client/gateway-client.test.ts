import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenClawGatewayClient } from './gateway-client.js';

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  listeners: Record<string, Array<(event?: unknown) => void>> = {};
  sentMessages: string[] = [];
  readyState = 0;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  addEventListener(event: string, handler: (event?: unknown) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(handler);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = 3;
    this.emit('close');
  }

  emit(event: string, data?: unknown) {
    for (const handler of this.listeners[event] ?? []) {
      handler(data);
    }
  }
}

vi.stubGlobal('WebSocket', MockWebSocket);

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('OpenClawGatewayClient', () => {
  it('creates with default options', () => {
    const client = new OpenClawGatewayClient();
    expect(client.connected).toBe(false);
  });

  it('creates with custom URL', () => {
    const client = new OpenClawGatewayClient({ url: 'ws://10.0.0.1:9999' });
    expect(client.connected).toBe(false);
  });

  it('connects successfully', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const connectPromise = client.connect();

    const ws = MockWebSocket.instances[0]!;
    ws.emit('open');

    await connectPromise;
    expect(client.connected).toBe(true);
  });

  it('rejects on connection error', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const connectPromise = client.connect();

    const ws = MockWebSocket.instances[0]!;
    ws.emit('error');

    await expect(connectPromise).rejects.toThrow('Failed to connect');
  });

  it('rejects on connection timeout', async () => {
    const client = new OpenClawGatewayClient({ connectTimeout: 100, autoReconnect: false });
    const connectPromise = client.connect();

    vi.advanceTimersByTime(150);

    await expect(connectPromise).rejects.toThrow('Connection timeout');
  });

  it('skips connect when already connected', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p1 = client.connect();
    MockWebSocket.instances[0]!.emit('open');
    await p1;

    await client.connect();
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it('disconnects', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p = client.connect();
    MockWebSocket.instances[0]!.emit('open');
    await p;

    await client.disconnect();
    expect(client.connected).toBe(false);
  });

  it('throws on call when not connected', async () => {
    const client = new OpenClawGatewayClient();
    await expect(client.call('test')).rejects.toThrow('Not connected');
  });

  it('sends RPC call and resolves on success response', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p = client.connect();
    const ws = MockWebSocket.instances[0]!;
    ws.emit('open');
    await p;

    const callPromise = client.call('gateway.status');

    const sent = JSON.parse(ws.sentMessages[0]!) as { id: string; method: string };
    expect(sent.method).toBe('gateway.status');

    ws.emit('message', { data: JSON.stringify({ id: sent.id, ok: true, result: { version: '1.0' } }) });

    const result = await callPromise;
    expect(result).toEqual({ version: '1.0' });
  });

  it('rejects RPC call on error response', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p = client.connect();
    const ws = MockWebSocket.instances[0]!;
    ws.emit('open');
    await p;

    const callPromise = client.call('bad.method');
    const sent = JSON.parse(ws.sentMessages[0]!) as { id: string };

    ws.emit('message', { data: JSON.stringify({ id: sent.id, ok: false, error: { message: 'Not found' } }) });

    await expect(callPromise).rejects.toThrow('Not found');
  });

  it('times out RPC calls', async () => {
    const client = new OpenClawGatewayClient({ callTimeout: 100, autoReconnect: false });
    const p = client.connect();
    MockWebSocket.instances[0]!.emit('open');
    await p;

    const callPromise = client.call('slow.method');
    vi.advanceTimersByTime(150);

    await expect(callPromise).rejects.toThrow('timed out');
  });

  it('ignores non-JSON messages', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p = client.connect();
    const ws = MockWebSocket.instances[0]!;
    ws.emit('open');
    await p;

    ws.emit('message', { data: 'not json' });
  });

  it('ignores messages without id', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p = client.connect();
    const ws = MockWebSocket.instances[0]!;
    ws.emit('open');
    await p;

    ws.emit('message', { data: JSON.stringify({ event: 'ping' }) });
  });

  it('convenience getStatus calls gateway.status', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p = client.connect();
    const ws = MockWebSocket.instances[0]!;
    ws.emit('open');
    await p;

    const statusPromise = client.getStatus();
    const sent = JSON.parse(ws.sentMessages[0]!) as { id: string; method: string };
    expect(sent.method).toBe('gateway.status');

    ws.emit('message', { data: JSON.stringify({ id: sent.id, ok: true, result: { version: '1.0', uptime: 100, channels: [], agents: [] } }) });
    const result = await statusPromise;
    expect(result.version).toBe('1.0');
  });

  it('rejects pending calls on disconnect', async () => {
    const client = new OpenClawGatewayClient({ autoReconnect: false });
    const p = client.connect();
    const ws = MockWebSocket.instances[0]!;
    ws.emit('open');
    await p;

    const callPromise = client.call('test');
    await client.disconnect();

    await expect(callPromise).rejects.toThrow('Connection closed');
  });
});

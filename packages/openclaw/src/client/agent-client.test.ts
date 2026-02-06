import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenClawAgentClient } from './agent-client.js';
import { OpenClawGatewayClient } from './gateway-client.js';

vi.mock('./gateway-client.js', () => {
  return {
    OpenClawGatewayClient: vi.fn().mockImplementation(() => ({
      connected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      call: vi.fn(),
      sendMessage: vi.fn(),
    })),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

function getGateway(client: OpenClawAgentClient): ReturnType<typeof vi.mocked<() => { connected: boolean; connect: ReturnType<typeof vi.fn>; call: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }>> {
  return (client as unknown as { gateway: { connected: boolean; connect: ReturnType<typeof vi.fn>; call: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> } }).gateway;
}

describe('OpenClawAgentClient', () => {
  it('creates with default options', () => {
    const client = new OpenClawAgentClient();
    expect(OpenClawGatewayClient).toHaveBeenCalled();
  });

  it('creates with custom agentId', () => {
    const client = new OpenClawAgentClient({ agentId: 'custom' });
    expect(client).toBeDefined();
  });

  it('connects to gateway before first execute', async () => {
    const client = new OpenClawAgentClient();
    const gw = getGateway(client);
    gw.connect.mockResolvedValue(undefined);
    gw.call.mockResolvedValue({ text: 'response' });

    const result = await client.execute('hello');
    expect(gw.connect).toHaveBeenCalled();
    expect(result).toBe('response');
  });

  it('skips connect when already connected', async () => {
    const client = new OpenClawAgentClient();
    const gw = getGateway(client);
    Object.defineProperty(gw, 'connected', { value: true, writable: true });
    gw.call.mockResolvedValue({ text: 'response' });

    await client.execute('hello');
    expect(gw.connect).not.toHaveBeenCalled();
  });

  it('handles string response', async () => {
    const client = new OpenClawAgentClient();
    const gw = getGateway(client);
    Object.defineProperty(gw, 'connected', { value: true });
    gw.call.mockResolvedValue('plain string');

    const result = await client.execute('test');
    expect(result).toBe('plain string');
  });

  it('handles missing text field', async () => {
    const client = new OpenClawAgentClient();
    const gw = getGateway(client);
    Object.defineProperty(gw, 'connected', { value: true });
    gw.call.mockResolvedValue({});

    const result = await client.execute('test');
    expect(result).toBe('');
  });

  it('passes sessionKey when provided', async () => {
    const client = new OpenClawAgentClient({ sessionKey: 'sess-123' });
    const gw = getGateway(client);
    Object.defineProperty(gw, 'connected', { value: true });
    gw.call.mockResolvedValue({ text: 'ok' });

    await client.execute('test');
    expect(gw.call).toHaveBeenCalledWith('agent.execute', expect.objectContaining({ sessionKey: 'sess-123' }));
  });

  it('throws on execution failure', async () => {
    const client = new OpenClawAgentClient();
    const gw = getGateway(client);
    Object.defineProperty(gw, 'connected', { value: true });
    gw.call.mockRejectedValue(new Error('Agent error'));

    await expect(client.execute('test')).rejects.toThrow('Agent error');
  });

  it('calls logCallback on events', async () => {
    const logFn = vi.fn();
    const client = new OpenClawAgentClient({ logCallback: logFn });
    const gw = getGateway(client);
    gw.connect.mockResolvedValue(undefined);
    gw.call.mockResolvedValue({ text: 'ok' });

    await client.execute('test');
    expect(logFn).toHaveBeenCalledWith(expect.stringContaining('Connecting'), 'info');
    expect(logFn).toHaveBeenCalledWith(expect.stringContaining('response received'), 'ok');
  });

  it('close disconnects owned gateway', async () => {
    const client = new OpenClawAgentClient();
    const gw = getGateway(client);
    gw.disconnect.mockResolvedValue(undefined);

    await client.close();
    expect(gw.disconnect).toHaveBeenCalled();
  });

  it('fromGateway does not disconnect on close', async () => {
    const mockGw = {
      connected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
      call: vi.fn(),
      sendMessage: vi.fn(),
    };
    const client = OpenClawAgentClient.fromGateway(mockGw as unknown as OpenClawGatewayClient);
    await client.close();
    expect(mockGw.disconnect).not.toHaveBeenCalled();
  });

  it('logs error on execution failure', async () => {
    const logFn = vi.fn();
    const client = new OpenClawAgentClient({ logCallback: logFn });
    const gw = getGateway(client);
    Object.defineProperty(gw, 'connected', { value: true });
    gw.call.mockRejectedValue(new Error('boom'));

    await expect(client.execute('test')).rejects.toThrow('boom');
    expect(logFn).toHaveBeenCalledWith(expect.stringContaining('boom'), 'error');
  });
});

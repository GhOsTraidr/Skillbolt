import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChannelVisualizer } from './channel-visualizer.js';

function createMockGateway(connected = true) {
  return {
    connected,
    sendMessage: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn(),
    disconnect: vi.fn(),
    call: vi.fn(),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ChannelVisualizer', () => {
  it('sends task message on setTask', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'user1' });
    await viz.setTask('Deploy app');
    expect(gw.sendMessage).toHaveBeenCalledWith({
      channel: 'telegram',
      to: 'user1',
      text: expect.stringContaining('Deploy app'),
    });
  });

  it('sends plan summary on setNodes', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'discord', peerId: 'g1' });
    await viz.setNodes(
      [{ id: 'a' }, { id: 'b' }] as never,
      [{ phase: 1 }] as never,
    );
    expect(gw.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('2 skills in 1 phase'),
    }));
  });

  it('sends phase marker', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u' });
    await viz.setPhase(3);
    expect(gw.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('Phase 3'),
    }));
  });

  it('sends error logs only', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u' });

    await viz.addLog('info message', 'info');
    expect(gw.sendMessage).not.toHaveBeenCalled();

    await viz.addLog('error message', 'error');
    expect(gw.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('error message'),
    }));
  });

  it('auto-selects first plan', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u' });

    const idx = await viz.selectPlan([{ a: 1 }, { b: 2 }]);
    expect(idx).toBe(0);
    expect(gw.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('2 plans'),
    }));
  });

  it('returns 0 for single plan without message', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u' });

    const idx = await viz.selectPlan([{ a: 1 }]);
    expect(idx).toBe(0);
    expect(gw.sendMessage).not.toHaveBeenCalled();
  });

  it('does not send when gateway disconnected', async () => {
    const gw = createMockGateway(false);
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u' });
    await viz.setTask('test');
    expect(gw.sendMessage).not.toHaveBeenCalled();
  });

  it('throttles rapid updateStatus calls', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u', throttleMs: 1000 });

    await viz.updateStatus('node-1', 'running');
    expect(gw.sendMessage).toHaveBeenCalledTimes(1);

    await viz.updateStatus('node-2', 'running');
    expect(gw.sendMessage).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1100);
    expect(gw.sendMessage).toHaveBeenCalledTimes(2);
  });

  it('combines buffered messages', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u', throttleMs: 1000 });

    await viz.updateStatus('a', 'running');
    await viz.updateStatus('b', 'running');
    await viz.updateStatus('c', 'completed');

    await vi.advanceTimersByTimeAsync(1100);
    const lastCall = gw.sendMessage.mock.calls[gw.sendMessage.mock.calls.length - 1];
    const text = (lastCall as [{ text: string }])[0].text;
    expect(text).toContain('b');
    expect(text).toContain('c');
  });

  it('uses correct icons for statuses', async () => {
    const gw = createMockGateway();
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u', throttleMs: 0 });

    await viz.updateStatus('n1', 'completed');
    expect(gw.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('✅'),
    }));

    await viz.updateStatus('n2', 'failed');
    expect(gw.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('❌'),
    }));
  });

  it('silently ignores send failures', async () => {
    const gw = createMockGateway();
    gw.sendMessage.mockRejectedValue(new Error('network error'));
    const viz = new ChannelVisualizer({ gateway: gw as never, channel: 'telegram', peerId: 'u' });

    await viz.setTask('test');
  });
});

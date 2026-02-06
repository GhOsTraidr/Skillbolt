import { describe, it, expect, vi } from 'vitest';
import { createEventEmitter } from '../src/events/index.js';

describe('createEventEmitter', () => {
  it('emits events to the callback', () => {
    const callback = vi.fn();
    const emitter = createEventEmitter(callback);

    emitter.emit('search_start', { query: 'test' });

    expect(callback).toHaveBeenCalledTimes(1);
    const event = callback.mock.calls[0]![0];
    expect(event.type).toBe('search_start');
    expect(event.data).toEqual({ query: 'test' });
    expect(event.timestamp).toEqual(expect.any(String));
  });

  it('does not throw when no callback is set', () => {
    const emitter = createEventEmitter();
    expect(() => emitter.emit('search_complete', { llmCalls: 0 })).not.toThrow();
  });

  it('setCallback updates the callback', () => {
    const callback = vi.fn();
    const emitter = createEventEmitter();

    emitter.setCallback(callback);
    emitter.emit('node_enter', { nodeId: 'root' });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

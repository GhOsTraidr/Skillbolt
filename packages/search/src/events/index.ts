import type { SearchEvent, SearchEventCallback, SearchEventType } from '../types.js';

export function createEventEmitter(callback?: SearchEventCallback): {
  emit: (type: SearchEventType, data: Record<string, unknown>) => void;
  setCallback: (cb: SearchEventCallback) => void;
} {
  let currentCallback = callback;

  return {
    emit(type, data) {
      if (!currentCallback) {
        return;
      }
      const event: SearchEvent = {
        type,
        data,
        timestamp: new Date().toISOString(),
      };
      currentCallback(event);
    },
    setCallback(cb) {
      currentCallback = cb;
    },
  };
}

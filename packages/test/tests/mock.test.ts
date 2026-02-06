import { describe, it, expect } from 'vitest';
import { createMockProvider } from '../src/mock/provider.js';

describe('createMockProvider', () => {
  it('should return predefined responses', async () => {
    const mock = createMockProvider({
      responses: {
        'test-skill': 'Mocked test response',
        'deploy-skill': 'Mocked deploy response',
      },
    });

    const response = await mock.respond('test-skill', 'test input');
    expect(response).toBe('Mocked test response');
  });

  it('should return default response for unknown skills', async () => {
    const mock = createMockProvider({
      defaultResponse: 'Default response',
    });

    const response = await mock.respond('unknown-skill', 'input');
    expect(response).toBe('Default response');
  });

  it('should support response templates', async () => {
    const mock = createMockProvider({
      templates: {
        'test-skill': (input) => `Processed: ${input}`,
      },
    });

    const response = await mock.respond('test-skill', 'my input');
    expect(response).toBe('Processed: my input');
  });

  it('should support async templates', async () => {
    const mock = createMockProvider({
      templates: {
        'async-skill': async (input) => {
          await new Promise((r) => setTimeout(r, 10));
          return `Async: ${input}`;
        },
      },
    });

    const response = await mock.respond('async-skill', 'data');
    expect(response).toBe('Async: data');
  });

  it('should simulate delays', async () => {
    const mock = createMockProvider({
      delay: 50,
      responses: { 'test-skill': 'response' },
    });

    const start = Date.now();
    await mock.respond('test-skill', 'input');
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(45);
  });

  it('should simulate errors', async () => {
    const mock = createMockProvider({
      errors: {
        'error-skill': new Error('Simulated error'),
      },
    });

    await expect(mock.respond('error-skill', 'input')).rejects.toThrow('Simulated error');
  });

  it('should allow setting responses dynamically', async () => {
    const mock = createMockProvider();

    mock.setResponse('dynamic-skill', 'Dynamic response');
    const response = await mock.respond('dynamic-skill', 'input');

    expect(response).toBe('Dynamic response');
  });

  it('should allow setting templates dynamically', async () => {
    const mock = createMockProvider();

    mock.setTemplate('template-skill', (input) => `Template: ${input}`);
    const response = await mock.respond('template-skill', 'data');

    expect(response).toBe('Template: data');
  });

  it('should allow setting errors dynamically', async () => {
    const mock = createMockProvider();

    mock.setError('error-skill', new Error('Dynamic error'));
    await expect(mock.respond('error-skill', 'input')).rejects.toThrow('Dynamic error');
  });

  it('should reset to initial state', async () => {
    const mock = createMockProvider({
      responses: { 'initial-skill': 'Initial' },
    });

    mock.setResponse('initial-skill', 'Changed');
    mock.setResponse('new-skill', 'New');

    mock.reset();

    const initial = await mock.respond('initial-skill', 'input');
    expect(initial).toBe('Initial');

    const newResp = await mock.respond('new-skill', 'input');
    expect(newResp).toBe('Mock response');
  });
});

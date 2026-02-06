import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIAdapter } from '../../src/llm/openai.js';
import { AnthropicAdapter } from '../../src/llm/anthropic.js';
import { createLLMAdapter } from '../../src/llm/factory.js';
import { LLMError, TimeoutError } from '../../src/errors/index.js';
import { ConfigError } from '../../src/errors/index.js';

// Helper to create a mock Response
function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
    headers: new Headers(),
    redirected: false,
    statusText: status === 200 ? 'OK' : 'Error',
    type: 'basic' as ResponseType,
    url: '',
    clone: () => mockResponse(body, status),
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    bytes: async () => new Uint8Array(),
  } as Response;
}

describe('OpenAIAdapter', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should call OpenAI chat completions endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: 'Hello back!' } }],
      })
    );

    const adapter = new OpenAIAdapter({ apiKey: 'test-key', model: 'gpt-4o-mini' });
    const result = await adapter.complete([{ role: 'user', content: 'Hello' }]);

    expect(result).toBe('Hello back!');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer test-key');
  });

  it('should throw LLMError on non-ok response (4xx)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse({ error: 'bad request' }, 400));

    const adapter = new OpenAIAdapter({ apiKey: 'test-key', retries: 0 });

    await expect(adapter.complete([{ role: 'user', content: 'Hello' }])).rejects.toThrow(LLMError);
  });

  it('should retry on 500 errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({ error: 'server error' }, 500))
      .mockResolvedValueOnce(mockResponse({ choices: [{ message: { content: 'ok' } }] }));
    globalThis.fetch = fetchMock;

    const adapter = new OpenAIAdapter({ apiKey: 'test-key', retries: 1, timeout: 5000 });
    const result = await adapter.complete([{ role: 'user', content: 'Hello' }]);

    expect(result).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should not retry on 401', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse({ error: 'unauthorized' }, 401));

    const adapter = new OpenAIAdapter({ apiKey: 'bad-key', retries: 3 });

    await expect(adapter.complete([{ role: 'user', content: 'Hello' }])).rejects.toThrow(LLMError);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('completeJSON should parse JSON from response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: '```json\n{"name": "test"}\n```' } }],
      })
    );

    const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
    const result = await adapter.completeJSON<{ name: string }>([
      { role: 'user', content: 'Give me JSON' },
    ]);

    expect(result).toEqual({ name: 'test' });
  });

  it('completeJSON should throw on non-JSON response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        choices: [{ message: { content: 'just plain text' } }],
      })
    );

    const adapter = new OpenAIAdapter({ apiKey: 'test-key' });

    await expect(adapter.completeJSON([{ role: 'user', content: 'Give me JSON' }])).rejects.toThrow(
      LLMError
    );
  });

  it('should call embeddings endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      })
    );

    const adapter = new OpenAIAdapter({ apiKey: 'test-key' });
    const result = await adapter.embedSingle('hello');

    expect(result).toEqual([0.1, 0.2, 0.3]);
  });
});

describe('AnthropicAdapter', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should call Anthropic messages endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        content: [{ type: 'text', text: 'Hello from Claude!' }],
      })
    );

    const adapter = new AnthropicAdapter({ apiKey: 'ant-key', model: 'claude-3-haiku-20240307' });
    const result = await adapter.complete([{ role: 'user', content: 'Hello' }]);

    expect(result).toBe('Hello from Claude!');

    const [url, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(options.headers['x-api-key']).toBe('ant-key');
    expect(options.headers['anthropic-version']).toBe('2023-06-01');
  });

  it('should separate system messages', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        content: [{ type: 'text', text: 'response' }],
      })
    );

    const adapter = new AnthropicAdapter({ apiKey: 'ant-key' });
    await adapter.complete([
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hello' },
    ]);

    const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.system).toBe('You are helpful');
    expect(body.messages).toEqual([{ role: 'user', content: 'Hello' }]);
  });

  it('should throw LLMError on API error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse({ error: 'bad' }, 400));

    const adapter = new AnthropicAdapter({ apiKey: 'ant-key', retries: 0 });

    await expect(adapter.complete([{ role: 'user', content: 'Hello' }])).rejects.toThrow(LLMError);
  });

  it('completeJSON should parse JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        content: [{ type: 'text', text: '{"score": 42}' }],
      })
    );

    const adapter = new AnthropicAdapter({ apiKey: 'ant-key' });
    const result = await adapter.completeJSON<{ score: number }>([
      { role: 'user', content: 'JSON please' },
    ]);

    expect(result).toEqual({ score: 42 });
  });
});

describe('createLLMAdapter', () => {
  const originalEnv = process.env.LLM_PROVIDER;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.LLM_PROVIDER;
    } else {
      process.env.LLM_PROVIDER = originalEnv;
    }
  });

  it('should create OpenAIAdapter by default', () => {
    delete process.env.LLM_PROVIDER;
    const adapter = createLLMAdapter();
    expect(adapter).toBeInstanceOf(OpenAIAdapter);
  });

  it('should create AnthropicAdapter when configured', () => {
    const adapter = createLLMAdapter({ provider: 'anthropic' });
    expect(adapter).toBeInstanceOf(AnthropicAdapter);
  });

  it('should read LLM_PROVIDER env var', () => {
    process.env.LLM_PROVIDER = 'anthropic';
    const adapter = createLLMAdapter();
    expect(adapter).toBeInstanceOf(AnthropicAdapter);
  });

  it('should throw ConfigError for unknown provider', () => {
    expect(() => createLLMAdapter({ provider: 'unknown' })).toThrow(ConfigError);
  });
});

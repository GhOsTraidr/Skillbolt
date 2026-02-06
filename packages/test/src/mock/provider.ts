import type { MockConfig } from '../types/index.js';

export interface MockLLMProvider {
  respond(skillName: string, input: string): Promise<string>;
  setResponse(skillName: string, response: string): void;
  setTemplate(skillName: string, template: (input: string) => string | Promise<string>): void;
  setError(skillName: string, error: Error): void;
  setDelay(ms: number): void;
  reset(): void;
}

export interface MockProviderOptions extends MockConfig {
  defaultResponse?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockProvider(options: MockProviderOptions = {}): MockLLMProvider {
  const responses = new Map<string, string>(Object.entries(options.responses ?? {}));
  const templates = new Map<string, (input: string) => string | Promise<string>>(
    Object.entries(options.templates ?? {})
  );
  const errors = new Map<string, Error>(Object.entries(options.errors ?? {}));
  let delay = options.delay ?? 0;
  const defaultResponse = options.defaultResponse ?? 'Mock response';

  return {
    async respond(skillName: string, input: string): Promise<string> {
      if (delay > 0) {
        await sleep(delay);
      }

      const error = errors.get(skillName);
      if (error) {
        throw error;
      }

      const template = templates.get(skillName);
      if (template) {
        return template(input);
      }

      const staticResponse = responses.get(skillName);
      if (staticResponse !== undefined) {
        return staticResponse;
      }

      return defaultResponse;
    },

    setResponse(skillName: string, response: string): void {
      responses.set(skillName, response);
    },

    setTemplate(skillName: string, template: (input: string) => string | Promise<string>): void {
      templates.set(skillName, template);
    },

    setError(skillName: string, error: Error): void {
      errors.set(skillName, error);
    },

    setDelay(ms: number): void {
      delay = ms;
    },

    reset(): void {
      responses.clear();
      templates.clear();
      errors.clear();
      delay = 0;

      if (options.responses) {
        for (const [key, value] of Object.entries(options.responses)) {
          responses.set(key, value);
        }
      }
      if (options.templates) {
        for (const [key, value] of Object.entries(options.templates)) {
          templates.set(key, value);
        }
      }
      if (options.errors) {
        for (const [key, value] of Object.entries(options.errors)) {
          errors.set(key, value);
        }
      }
      delay = options.delay ?? 0;
    },
  };
}

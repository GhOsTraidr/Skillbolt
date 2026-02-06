import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createMockProvider, type MockLLMProvider } from './provider.js';

export interface RecordedResponse {
  skillName: string;
  input: string;
  response: string;
  timestamp: string;
}

export interface RecordingSession {
  version: string;
  createdAt: string;
  responses: RecordedResponse[];
}

export interface ResponseRecorder {
  record(skillName: string, input: string, response: string): void;
  save(filePath: string): Promise<void>;
  getRecording(): RecordingSession;
}

export interface ResponsePlayer {
  provider: MockLLMProvider;
  loadedFrom: string;
}

export function createRecorder(): ResponseRecorder {
  const responses: RecordedResponse[] = [];
  const createdAt = new Date().toISOString();

  return {
    record(skillName: string, input: string, response: string): void {
      responses.push({
        skillName,
        input,
        response,
        timestamp: new Date().toISOString(),
      });
    },

    async save(filePath: string): Promise<void> {
      const session: RecordingSession = {
        version: '1.0.0',
        createdAt,
        responses,
      };

      const fullPath = resolve(filePath);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, JSON.stringify(session, null, 2), 'utf-8');
    },

    getRecording(): RecordingSession {
      return {
        version: '1.0.0',
        createdAt,
        responses: [...responses],
      };
    },
  };
}

export async function loadRecording(filePath: string): Promise<RecordingSession> {
  const fullPath = resolve(filePath);
  const content = await readFile(fullPath, 'utf-8');
  return JSON.parse(content) as RecordingSession;
}

export async function createPlayerFromRecording(filePath: string): Promise<ResponsePlayer> {
  const recording = await loadRecording(filePath);
  const responseMap: Record<string, string> = {};

  for (const rec of recording.responses) {
    const key = `${rec.skillName}:${rec.input}`;
    responseMap[key] = rec.response;
  }

  const provider = createMockProvider({
    templates: {
      '*': (input: string) => {
        for (const rec of recording.responses) {
          if (rec.input === input) {
            return rec.response;
          }
        }
        return `No recorded response for input: ${input}`;
      },
    },
  });

  return {
    provider,
    loadedFrom: filePath,
  };
}

export function recordResponses(): ResponseRecorder {
  return createRecorder();
}

export async function replayResponses(filePath: string): Promise<MockLLMProvider> {
  const player = await createPlayerFromRecording(filePath);
  return player.provider;
}

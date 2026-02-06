import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { SessionLoader, type SessionLoaderOptions } from './base.js';
import type { Session, Message, SessionInfo } from '../types/session.js';

interface TranscriptEntry {
  type: 'user' | 'assistant' | 'tool_use' | 'tool_result';
  timestamp: string;
  content?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: { preview?: string; truncated?: boolean };
}

interface ProjectEntry {
  type: 'user' | 'assistant' | 'file-history-snapshot';
  timestamp: string;
  sessionId?: string;
  cwd?: string;
  message?: {
    role: 'user' | 'assistant';
    content: string | Array<{ type: string; text?: string }>;
  };
  toolUseResult?: {
    name: string;
    result: string;
    error?: boolean;
  };
}

interface SessionSource {
  id: string;
  filePath: string;
  projectPath: string;
  source: 'transcripts' | 'projects';
}

export class ClaudeSessionLoader extends SessionLoader {
  private transcriptsPath: string;
  private projectsPath: string;

  constructor(options: SessionLoaderOptions = {}) {
    super(options);
    const claudeDir = join(homedir(), '.claude');
    this.transcriptsPath = join(claudeDir, 'transcripts');
    this.projectsPath = join(claudeDir, 'projects');
  }

  getDefaultBasePath(): string {
    return join(homedir(), '.claude');
  }

  async listSessions(): Promise<SessionInfo[]> {
    const sessions: SessionInfo[] = [];

    const transcriptSessions = await this.listTranscriptSessions();
    const projectSessions = await this.listProjectSessions();

    sessions.push(...transcriptSessions, ...projectSessions);

    return sessions.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  private async listTranscriptSessions(): Promise<SessionInfo[]> {
    const sessions: SessionInfo[] = [];

    try {
      const files = await fs.readdir(this.transcriptsPath);

      for (const file of files) {
        if (!file.endsWith('.jsonl') || !file.startsWith('ses_')) continue;

        const filePath = join(this.transcriptsPath, file);
        const sessionId = file.replace('.jsonl', '');

        try {
          const entries = await this.readTranscriptFile(filePath);
          if (entries.length === 0) continue;

          const userMessages = entries.filter((e) => e.type === 'user');
          const firstEntry = entries[0];
          const lastEntry = entries[entries.length - 1];

          if (!firstEntry || !lastEntry) continue;

          sessions.push({
            id: sessionId,
            projectPath: '[transcripts]',
            startTime: firstEntry.timestamp,
            endTime: lastEntry.timestamp,
            messageCount: userMessages.length,
            summary: this.extractTranscriptSummary(entries),
          });
        } catch {
          continue;
        }
      }
    } catch {
      // empty catch - folder may not exist
    }

    return sessions;
  }

  private async listProjectSessions(): Promise<SessionInfo[]> {
    const sessions: SessionInfo[] = [];
    const sessionMap = new Map<string, SessionSource>();

    try {
      const projectDirs = await fs.readdir(this.projectsPath);

      for (const projectDir of projectDirs) {
        if (projectDir.startsWith('.')) continue;

        const projectPath = join(this.projectsPath, projectDir);
        const stat = await fs.stat(projectPath);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(projectPath);

        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue;
          if (file.startsWith('agent-')) continue;

          const filePath = join(projectPath, file);
          const sessionId = file.replace('.jsonl', '');

          sessionMap.set(sessionId, {
            id: sessionId,
            filePath,
            projectPath: this.decodeProjectPath(projectDir),
            source: 'projects',
          });
        }
      }

      for (const [sessionId, source] of sessionMap) {
        try {
          const entries = await this.readProjectFile(source.filePath);
          if (entries.length === 0) continue;

          const userMessages = entries.filter(
            (e) => e.type === 'user' && e.message?.role === 'user'
          );
          const timestamps = entries.filter((e) => e.timestamp).map((e) => e.timestamp);

          if (timestamps.length === 0) continue;

          const firstTimestamp = timestamps[0];
          const lastTimestamp = timestamps[timestamps.length - 1];

          if (!firstTimestamp || !lastTimestamp) continue;

          sessions.push({
            id: sessionId,
            projectPath: source.projectPath,
            startTime: firstTimestamp,
            endTime: lastTimestamp,
            messageCount: userMessages.length,
            summary: this.extractProjectSummary(entries),
          });
        } catch {
          continue;
        }
      }
    } catch {
      // projects folder doesn't exist
    }

    return sessions;
  }

  async getSession(id: string): Promise<Session> {
    const transcriptPath = join(this.transcriptsPath, `${id}.jsonl`);
    try {
      await fs.access(transcriptPath);
      const entries = await this.readTranscriptFile(transcriptPath);
      if (entries.length > 0) {
        return this.transformTranscriptSession(id, entries);
      }
    } catch {
      // not in transcripts
    }

    const projectFile = await this.findProjectSessionFile(id);
    if (projectFile) {
      const entries = await this.readProjectFile(projectFile.filePath);
      return this.transformProjectSession(id, entries, projectFile.projectPath);
    }

    throw new Error(`Session not found: ${id}`);
  }

  private async findProjectSessionFile(
    sessionId: string
  ): Promise<{ filePath: string; projectPath: string } | null> {
    try {
      const projectDirs = await fs.readdir(this.projectsPath);

      for (const projectDir of projectDirs) {
        if (projectDir.startsWith('.')) continue;

        const projectPath = join(this.projectsPath, projectDir);
        const stat = await fs.stat(projectPath);
        if (!stat.isDirectory()) continue;

        const sessionFile = join(projectPath, `${sessionId}.jsonl`);
        try {
          await fs.access(sessionFile);
          return {
            filePath: sessionFile,
            projectPath: this.decodeProjectPath(projectDir),
          };
        } catch {
          continue;
        }
      }
    } catch {
      // projects folder doesn't exist
    }

    return null;
  }

  private async readTranscriptFile(path: string): Promise<TranscriptEntry[]> {
    try {
      const content = await fs.readFile(path, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      return lines.map((line) => JSON.parse(line) as TranscriptEntry);
    } catch {
      return [];
    }
  }

  private async readProjectFile(path: string): Promise<ProjectEntry[]> {
    try {
      const content = await fs.readFile(path, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      return lines.map((line) => JSON.parse(line) as ProjectEntry);
    } catch {
      return [];
    }
  }

  private transformTranscriptSession(id: string, entries: TranscriptEntry[]): Session {
    const messages: Message[] = [];
    let currentAssistantContent = '';
    let currentToolCalls: Message['toolCalls'] = [];
    let currentToolResults: Message['toolResults'] = [];
    let lastTimestamp = '';

    for (const entry of entries) {
      if (entry.type === 'user') {
        if (currentAssistantContent || (currentToolCalls && currentToolCalls.length > 0)) {
          messages.push({
            role: 'assistant',
            content: currentAssistantContent.trim(),
            timestamp: lastTimestamp,
            toolCalls:
              currentToolCalls && currentToolCalls.length > 0 ? currentToolCalls : undefined,
            toolResults:
              currentToolResults && currentToolResults.length > 0 ? currentToolResults : undefined,
          });
          currentAssistantContent = '';
          currentToolCalls = [];
          currentToolResults = [];
        }

        messages.push({
          role: 'user',
          content: entry.content ?? '',
          timestamp: entry.timestamp,
        });
      } else if (entry.type === 'assistant') {
        currentAssistantContent += (entry.content ?? '') + '\n';
        lastTimestamp = entry.timestamp;
      } else if (entry.type === 'tool_use') {
        currentToolCalls = currentToolCalls ?? [];
        currentToolCalls.push({
          name: entry.tool_name ?? 'unknown',
          input: entry.tool_input ?? {},
        });
        lastTimestamp = entry.timestamp;
      } else if (entry.type === 'tool_result') {
        currentToolResults = currentToolResults ?? [];
        currentToolResults.push({
          name: entry.tool_name ?? 'unknown',
          output: entry.tool_output?.preview ?? '',
          success: true,
        });
        lastTimestamp = entry.timestamp;
      }
    }

    if (currentAssistantContent || (currentToolCalls && currentToolCalls.length > 0)) {
      messages.push({
        role: 'assistant',
        content: currentAssistantContent.trim(),
        timestamp: lastTimestamp,
        toolCalls: currentToolCalls && currentToolCalls.length > 0 ? currentToolCalls : undefined,
        toolResults:
          currentToolResults && currentToolResults.length > 0 ? currentToolResults : undefined,
      });
    }

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];

    return {
      id,
      projectPath: '[transcripts]',
      startTime: firstEntry?.timestamp ?? '',
      endTime: lastEntry?.timestamp ?? '',
      messages,
    };
  }

  private transformProjectSession(
    id: string,
    entries: ProjectEntry[],
    projectPath: string
  ): Session {
    const messages: Message[] = [];

    for (const entry of entries) {
      if (entry.type === 'file-history-snapshot') continue;

      if (entry.message) {
        const content = this.extractMessageContent(entry.message.content);
        if (content) {
          messages.push({
            role: entry.message.role === 'user' ? 'user' : 'assistant',
            content,
            timestamp: entry.timestamp,
          });
        }
      }
    }

    const timestamps = entries.filter((e) => e.timestamp).map((e) => e.timestamp);
    const firstTimestamp = timestamps[0];
    const lastTimestamp = timestamps[timestamps.length - 1];

    return {
      id,
      projectPath,
      startTime: firstTimestamp ?? '',
      endTime: lastTimestamp ?? '',
      messages,
    };
  }

  private extractMessageContent(content: string | Array<{ type: string; text?: string }>): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .filter((c) => c.type === 'text' && c.text)
        .map((c) => c.text)
        .join('\n');
    }

    return '';
  }

  private decodeProjectPath(encoded: string): string {
    return encoded.replace(/-/g, '/').replace(/^\//, '');
  }

  private extractTranscriptSummary(entries: TranscriptEntry[]): string {
    const firstUserEntry = entries.find((e) => e.type === 'user');
    if (!firstUserEntry?.content) return '';

    const content = firstUserEntry.content;
    const firstLine = content.split('\n')[0] ?? '';
    return firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine;
  }

  private extractProjectSummary(entries: ProjectEntry[]): string {
    const firstUserEntry = entries.find((e) => e.type === 'user' && e.message?.role === 'user');
    if (!firstUserEntry?.message) return '';

    const content = this.extractMessageContent(firstUserEntry.message.content);
    const firstLine = content.split('\n')[0] ?? '';
    return firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine;
  }
}

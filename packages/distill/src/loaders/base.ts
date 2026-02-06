import type { Session, SessionInfo } from '../types/session.js';

export interface SessionLoaderOptions {
  basePath?: string;
  projectPath?: string;
}

export abstract class SessionLoader {
  protected basePath: string;
  protected projectPath?: string;

  constructor(options: SessionLoaderOptions = {}) {
    this.basePath = options.basePath ?? this.getDefaultBasePath();
    this.projectPath = options.projectPath;
  }

  abstract getDefaultBasePath(): string;
  abstract listSessions(): Promise<SessionInfo[]>;
  abstract getSession(id: string): Promise<Session>;

  async getLatestSession(): Promise<Session> {
    const sessions = await this.listSessions();
    if (sessions.length === 0) {
      throw new Error('No sessions found');
    }
    const sorted = sessions.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    const firstSession = sorted[0];
    if (!firstSession) {
      throw new Error('No sessions found');
    }
    return this.getSession(firstSession.id);
  }

  async searchSessions(query: string): Promise<SessionInfo[]> {
    const sessions = await this.listSessions();
    const lowerQuery = query.toLowerCase();
    return sessions.filter(
      (s) =>
        s.summary?.toLowerCase().includes(lowerQuery) ||
        s.projectPath.toLowerCase().includes(lowerQuery)
    );
  }
}

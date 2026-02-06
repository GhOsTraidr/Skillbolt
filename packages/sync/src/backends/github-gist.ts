import { BaseBackend } from './base.js';
import type {
  Credentials,
  GitHubCredentials,
  UploadResult,
  DeleteResult,
} from '../types/backend.js';
import type { LocalSkill, RemoteSkill, SyncMetadata, BackendType } from '../types/sync.js';
import { computeHashFromString } from '../utils/hash.js';

const GITHUB_API = 'https://api.github.com';
const METADATA_FILENAME = '__sync_metadata__.json';
const GIST_DESCRIPTION = 'Skill Kit - Synced Skills';

interface GistFile {
  filename: string;
  content: string;
  size: number;
  raw_url: string;
  truncated: boolean;
}

interface Gist {
  id: string;
  description: string;
  files: Record<string, GistFile>;
  created_at: string;
  updated_at: string;
}

export class GitHubGistBackend extends BaseBackend {
  readonly name = 'github-gist';
  private token: string | null = null;
  private gistId: string | null = null;

  async authenticate(credentials: Credentials): Promise<void> {
    if (credentials.type !== 'github') {
      throw new Error('Invalid credentials type for GitHub Gist backend');
    }

    const { token, gistId } = credentials as GitHubCredentials;
    this.token = token;

    await this.verifyToken();

    if (gistId) {
      this.gistId = gistId;
      await this.verifyGist();
    } else {
      await this.findOrCreateGist();
    }

    this.authenticated = true;
  }

  private async verifyToken(): Promise<void> {
    const response = await this.fetch('/user');
    if (!response.ok) {
      throw new Error('Invalid GitHub token');
    }
  }

  private async verifyGist(): Promise<void> {
    if (!this.gistId) return;

    const response = await this.fetch(`/gists/${this.gistId}`);
    if (!response.ok) {
      throw new Error(`Gist not found: ${this.gistId}`);
    }
  }

  private async findOrCreateGist(): Promise<void> {
    const response = await this.fetch('/gists?per_page=100');
    const gists = (await response.json()) as Gist[];

    const existingGist = gists.find((g) => g.description === GIST_DESCRIPTION);

    if (existingGist) {
      this.gistId = existingGist.id;
    } else {
      const createResponse = await this.fetch('/gists', {
        method: 'POST',
        body: JSON.stringify({
          description: GIST_DESCRIPTION,
          public: false,
          files: {
            [METADATA_FILENAME]: {
              content: JSON.stringify({
                backend: 'github-gist',
                lastSyncAt: null,
                skillHashes: {},
                skillTimestamps: {},
              }),
            },
          },
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create Gist');
      }

      const newGist = (await createResponse.json()) as Gist;
      this.gistId = newGist.id;
    }
  }

  async list(): Promise<RemoteSkill[]> {
    this.requireAuth();

    const gist = await this.getGist();
    if (!gist) return [];

    const skills: RemoteSkill[] = [];

    for (const [filename, file] of Object.entries(gist.files)) {
      if (filename === METADATA_FILENAME || filename.startsWith('.')) {
        continue;
      }

      let content = file.content;

      if (file.truncated) {
        const fullResponse = await fetch(file.raw_url);
        content = await fullResponse.text();
      }

      skills.push({
        id: filename,
        name: filename.replace(/\.md$/, ''),
        relativePath: filename,
        content,
        hash: computeHashFromString(content),
        createdAt: new Date(gist.created_at),
        updatedAt: new Date(gist.updated_at),
        metadata: {},
      });
    }

    return skills;
  }

  async get(idOrName: string): Promise<RemoteSkill | null> {
    this.requireAuth();

    const gist = await this.getGist();
    if (!gist) return null;

    const filename = this.toFilename(idOrName);
    const file = gist.files[filename];

    if (!file) return null;

    let content = file.content;
    if (file.truncated) {
      const fullResponse = await fetch(file.raw_url);
      content = await fullResponse.text();
    }

    return {
      id: filename,
      name: filename.replace(/\.md$/, ''),
      relativePath: filename,
      content,
      hash: computeHashFromString(content),
      createdAt: new Date(gist.created_at),
      updatedAt: new Date(gist.updated_at),
      metadata: {},
    };
  }

  async put(skill: LocalSkill): Promise<UploadResult> {
    this.requireAuth();
    if (!this.gistId) {
      return { success: false, error: 'No gist configured' };
    }

    const filename = this.toFilename(skill.relativePath);

    const response = await this.fetch(`/gists/${this.gistId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        files: {
          [filename]: {
            content: skill.content,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const gist = (await response.json()) as Gist;

    return {
      success: true,
      skill: {
        id: filename,
        name: skill.name,
        relativePath: filename,
        content: skill.content,
        hash: skill.hash,
        createdAt: new Date(gist.created_at),
        updatedAt: new Date(gist.updated_at),
        metadata: {},
      },
    };
  }

  async delete(idOrName: string): Promise<DeleteResult> {
    this.requireAuth();
    if (!this.gistId) {
      return { success: false, error: 'No gist configured' };
    }

    const filename = this.toFilename(idOrName);

    const response = await this.fetch(`/gists/${this.gistId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        files: {
          [filename]: null,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  }

  async getMetadata(): Promise<SyncMetadata | null> {
    this.requireAuth();

    const gist = await this.getGist();
    if (!gist) return null;

    const metaFile = gist.files[METADATA_FILENAME];
    if (!metaFile) return null;

    try {
      const parsed = JSON.parse(metaFile.content) as {
        backend: BackendType;
        lastSyncAt: string | null;
        skillHashes: Record<string, string>;
        skillTimestamps: Record<string, string>;
      };

      return {
        backend: parsed.backend,
        lastSyncAt: parsed.lastSyncAt ? new Date(parsed.lastSyncAt) : null,
        skillHashes: parsed.skillHashes,
        skillTimestamps: parsed.skillTimestamps,
      };
    } catch {
      return null;
    }
  }

  async setMetadata(metadata: SyncMetadata): Promise<void> {
    this.requireAuth();
    if (!this.gistId) return;

    const content = JSON.stringify({
      backend: metadata.backend,
      lastSyncAt: metadata.lastSyncAt?.toISOString() ?? null,
      skillHashes: metadata.skillHashes,
      skillTimestamps: metadata.skillTimestamps,
    });

    await this.fetch(`/gists/${this.gistId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        files: {
          [METADATA_FILENAME]: { content },
        },
      }),
    });
  }

  async disconnect(): Promise<void> {
    this.token = null;
    this.gistId = null;
    this.authenticated = false;
  }

  getGistId(): string | null {
    return this.gistId;
  }

  private async getGist(): Promise<Gist | null> {
    if (!this.gistId) return null;

    const response = await this.fetch(`/gists/${this.gistId}`);
    if (!response.ok) return null;

    return response.json() as Promise<Gist>;
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    return fetch(`${GITHUB_API}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  private toFilename(path: string): string {
    return path.replace(/\//g, '__');
  }
}

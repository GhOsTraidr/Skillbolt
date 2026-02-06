import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { BaseBackend } from './base.js';
import type {
  Credentials,
  SupabaseCredentials,
  UploadResult,
  DeleteResult,
} from '../types/backend.js';
import type { LocalSkill, RemoteSkill, SyncMetadata, BackendType } from '../types/sync.js';
import { computeHashFromString } from '../utils/hash.js';

const SKILLS_BUCKET = 'skills';
const METADATA_KEY = '.sync-metadata.json';

interface SkillRecord {
  id: string;
  name: string;
  relative_path: string;
  content: string;
  hash: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export class SupabaseBackend extends BaseBackend {
  readonly name = 'supabase';
  private client: SupabaseClient | null = null;
  private userId: string | null = null;

  async authenticate(credentials: Credentials): Promise<void> {
    if (credentials.type !== 'supabase') {
      throw new Error('Invalid credentials type for Supabase backend');
    }

    const { url, key, user } = credentials as SupabaseCredentials;
    this.client = createClient(url, key);

    if (user) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        throw new Error(`Supabase authentication failed: ${error.message}`);
      }

      this.userId = data.user?.id ?? null;
    }

    await this.ensureBucketExists();
    this.authenticated = true;
  }

  private async ensureBucketExists(): Promise<void> {
    if (!this.client) return;

    const { data: buckets } = await this.client.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === SKILLS_BUCKET);

    if (!bucketExists) {
      const { error } = await this.client.storage.createBucket(SKILLS_BUCKET, {
        public: false,
      });

      if (error && !error.message.includes('already exists')) {
        throw new Error(`Failed to create storage bucket: ${error.message}`);
      }
    }
  }

  async list(): Promise<RemoteSkill[]> {
    this.requireAuth();
    if (!this.client) return [];

    const prefix = this.getPathPrefix();
    const { data, error } = await this.client.storage
      .from(SKILLS_BUCKET)
      .list(prefix, { limit: 1000 });

    if (error) {
      throw new Error(`Failed to list skills: ${error.message}`);
    }

    const skills: RemoteSkill[] = [];

    for (const file of data ?? []) {
      if (file.name === METADATA_KEY || file.name.startsWith('.')) {
        continue;
      }

      const skill = await this.get(file.name);
      if (skill) {
        skills.push(skill);
      }
    }

    return skills;
  }

  async get(idOrName: string): Promise<RemoteSkill | null> {
    this.requireAuth();
    if (!this.client) return null;

    const path = this.buildPath(idOrName);
    const { data, error } = await this.client.storage.from(SKILLS_BUCKET).download(path);

    if (error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        return null;
      }
      throw new Error(`Failed to get skill: ${error.message}`);
    }

    const content = await data.text();

    let metadata: SkillRecord['metadata'] = {};
    try {
      const metaPath = `${path}.meta.json`;
      const { data: metaData } = await this.client.storage.from(SKILLS_BUCKET).download(metaPath);

      if (metaData) {
        const metaText = await metaData.text();
        metadata = JSON.parse(metaText) as SkillRecord['metadata'];
      }
    } catch {
      // Metadata file doesn't exist, use defaults
    }

    const hash = computeHashFromString(content);
    const now = new Date();

    return {
      id: idOrName,
      name: (metadata['name'] as string) ?? idOrName.replace(/\.md$/, ''),
      relativePath: idOrName,
      content,
      hash,
      createdAt: metadata['created_at'] ? new Date(metadata['created_at'] as string) : now,
      updatedAt: metadata['updated_at'] ? new Date(metadata['updated_at'] as string) : now,
      metadata,
    };
  }

  async put(skill: LocalSkill): Promise<UploadResult> {
    this.requireAuth();
    if (!this.client) {
      return { success: false, error: 'Not connected' };
    }

    const path = this.buildPath(skill.relativePath);
    const now = new Date().toISOString();

    const { error: uploadError } = await this.client.storage
      .from(SKILLS_BUCKET)
      .upload(path, skill.content, {
        contentType: 'text/markdown',
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const metadata: SkillRecord['metadata'] = {
      name: skill.name,
      hash: skill.hash,
      size: skill.size,
      created_at: now,
      updated_at: now,
    };

    const metaPath = `${path}.meta.json`;
    await this.client.storage.from(SKILLS_BUCKET).upload(metaPath, JSON.stringify(metadata), {
      contentType: 'application/json',
      upsert: true,
    });

    return {
      success: true,
      skill: {
        id: skill.relativePath,
        name: skill.name,
        relativePath: skill.relativePath,
        content: skill.content,
        hash: skill.hash,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        metadata,
      },
    };
  }

  async delete(idOrName: string): Promise<DeleteResult> {
    this.requireAuth();
    if (!this.client) {
      return { success: false, error: 'Not connected' };
    }

    const path = this.buildPath(idOrName);
    const metaPath = `${path}.meta.json`;

    const { error } = await this.client.storage.from(SKILLS_BUCKET).remove([path, metaPath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async getMetadata(): Promise<SyncMetadata | null> {
    this.requireAuth();
    if (!this.client) return null;

    const path = this.buildPath(METADATA_KEY);

    try {
      const { data, error } = await this.client.storage.from(SKILLS_BUCKET).download(path);

      if (error) {
        return null;
      }

      const text = await data.text();
      const parsed = JSON.parse(text) as {
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
    if (!this.client) return;

    const path = this.buildPath(METADATA_KEY);
    const content = JSON.stringify({
      backend: metadata.backend,
      lastSyncAt: metadata.lastSyncAt?.toISOString() ?? null,
      skillHashes: metadata.skillHashes,
      skillTimestamps: metadata.skillTimestamps,
    });

    await this.client.storage.from(SKILLS_BUCKET).upload(path, content, {
      contentType: 'application/json',
      upsert: true,
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.auth.signOut();
      this.client = null;
      this.userId = null;
      this.authenticated = false;
    }
  }

  private getPathPrefix(): string {
    return this.userId ? `users/${this.userId}` : 'shared';
  }

  private buildPath(fileName: string): string {
    const prefix = this.getPathPrefix();
    return `${prefix}/${fileName}`;
  }
}

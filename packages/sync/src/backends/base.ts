import type { Backend, Credentials, UploadResult, DeleteResult } from '../types/backend.js';
import type { LocalSkill, RemoteSkill, SyncMetadata } from '../types/sync.js';

export abstract class BaseBackend implements Backend {
  abstract readonly name: string;
  protected authenticated = false;

  abstract authenticate(credentials: Credentials): Promise<void>;
  abstract list(): Promise<RemoteSkill[]>;
  abstract get(idOrName: string): Promise<RemoteSkill | null>;
  abstract put(skill: LocalSkill): Promise<UploadResult>;
  abstract delete(idOrName: string): Promise<DeleteResult>;
  abstract getMetadata(): Promise<SyncMetadata | null>;
  abstract setMetadata(metadata: SyncMetadata): Promise<void>;
  abstract disconnect(): Promise<void>;

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  protected requireAuth(): void {
    if (!this.authenticated) {
      throw new Error(`Backend "${this.name}" requires authentication`);
    }
  }
}

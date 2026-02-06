import type { Backend, Credentials } from '../types/backend.js';
import type { PullOptions, SyncResult } from '../types/sync.js';
import type { SyncConfiguration } from '../types/config.js';
import { SyncEngine } from '../core/sync-engine.js';
import { checkNetworkConnectivity } from '../utils/network.js';

export interface PullCommandOptions extends PullOptions {
  credentials?: Credentials;
}

export async function pull(
  backend: Backend,
  options: PullCommandOptions = {},
  config: Partial<SyncConfiguration> = {}
): Promise<SyncResult> {
  const engine = new SyncEngine(backend, config);

  if (options.credentials) {
    await backend.authenticate(options.credentials);
  }

  const isOnline = await checkNetworkConnectivity();

  if (!isOnline) {
    return {
      success: false,
      uploaded: 0,
      downloaded: 0,
      deletedLocal: 0,
      deletedRemote: 0,
      conflicts: 0,
      skipped: 0,
      messages: ['Pull requires network connectivity'],
      errors: [new Error('No network connectivity')],
      duration: 0,
    };
  }

  return engine.pull(options);
}

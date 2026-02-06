import type { Backend, Credentials } from '../types/backend.js';
import type { PushOptions, SyncResult } from '../types/sync.js';
import type { SyncConfiguration } from '../types/config.js';
import { SyncEngine } from '../core/sync-engine.js';
import { OfflineQueue } from '../queue/offline-queue.js';
import { checkNetworkConnectivity } from '../utils/network.js';
import { scanLocalSkills, filterSkills } from '../utils/scanner.js';
import { expandTilde } from '@skillbolt/core';

export interface PushCommandOptions extends PushOptions {
  credentials?: Credentials;
  queueOffline?: boolean;
}

export async function push(
  backend: Backend,
  options: PushCommandOptions = {},
  config: Partial<SyncConfiguration> = {}
): Promise<SyncResult> {
  const engine = new SyncEngine(backend, config);

  if (options.credentials) {
    await backend.authenticate(options.credentials);
  }

  const isOnline = await checkNetworkConnectivity();

  if (!isOnline && options.queueOffline) {
    return await queuePushOperations(backend, options, config);
  }

  return engine.push(options);
}

async function queuePushOperations(
  backend: Backend,
  options: PushCommandOptions,
  config: Partial<SyncConfiguration>
): Promise<SyncResult> {
  const queue = new OfflineQueue();
  queue.setBackend(backend);
  await queue.load();

  const skillsDir = expandTilde(options.skillsDir ?? config.skillsDir ?? '~/.skill-kit/skills');
  const skills = await scanLocalSkills(skillsDir);
  const filteredSkills = filterSkills(skills, options.include, options.exclude);

  for (const skill of filteredSkills) {
    await queue.enqueue('push', skill);
  }

  return {
    success: true,
    uploaded: 0,
    downloaded: 0,
    deletedLocal: 0,
    deletedRemote: 0,
    conflicts: 0,
    skipped: filteredSkills.length,
    messages: [
      `Offline: Queued ${filteredSkills.length} skills for push`,
      'Operations will be executed when network is available',
    ],
    errors: [],
    duration: 0,
  };
}

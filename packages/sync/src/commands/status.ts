import type { Backend, Credentials } from '../types/backend.js';
import type { StatusOptions, OverallStatus, SyncStatus } from '../types/sync.js';
import type { SyncConfiguration } from '../types/config.js';
import { SyncEngine } from '../core/sync-engine.js';

export interface StatusCommandOptions extends StatusOptions {
  credentials?: Credentials;
}

export async function syncStatus(
  backend: Backend,
  options: StatusCommandOptions = {},
  config: Partial<SyncConfiguration> = {}
): Promise<OverallStatus> {
  const engine = new SyncEngine(backend, config);

  if (options.credentials && !backend.isAuthenticated()) {
    await backend.authenticate(options.credentials);
  }

  return engine.status(options.skillsDir);
}

export function formatStatus(status: OverallStatus): string {
  const lines: string[] = [];

  lines.push(`Backend: ${status.backend}`);
  lines.push(`Authenticated: ${status.authenticated ? 'Yes' : 'No'}`);
  lines.push(`Last sync: ${status.lastSyncAt?.toLocaleString() ?? 'Never'}`);
  lines.push('');
  lines.push(`Local skills:  ${status.totalLocal}`);
  lines.push(`Remote skills: ${status.totalRemote}`);
  lines.push('');

  const counts = [
    { label: 'In sync', count: status.synced, symbol: '=' },
    { label: 'Modified locally', count: status.modifiedLocal, symbol: 'M' },
    { label: 'Modified remotely', count: status.modifiedRemote, symbol: 'U' },
    { label: 'New locally', count: status.newLocal, symbol: '+' },
    { label: 'New remotely', count: status.newRemote, symbol: 'A' },
    { label: 'Conflicts', count: status.conflicts, symbol: '!' },
  ];

  for (const { label, count, symbol } of counts) {
    if (count > 0) {
      lines.push(`  [${symbol}] ${label}: ${count}`);
    }
  }

  if (status.skills.length > 0) {
    lines.push('');
    lines.push('Skills:');

    for (const skill of status.skills) {
      const symbol = getStatusSymbol(skill.status);
      lines.push(`  ${symbol} ${skill.name}`);
    }
  }

  return lines.join('\n');
}

function getStatusSymbol(status: SyncStatus): string {
  switch (status) {
    case 'synced':
      return '=';
    case 'modified-local':
      return 'M';
    case 'modified-remote':
      return 'U';
    case 'new-local':
      return '+';
    case 'new-remote':
      return 'A';
    case 'deleted-local':
      return 'D';
    case 'deleted-remote':
      return 'R';
    case 'conflict':
      return '!';
    default:
      return '?';
  }
}

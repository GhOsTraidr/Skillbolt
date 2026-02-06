#!/usr/bin/env node

import { Command } from 'commander';
import { logger, expandTilde } from '@skillbolt/core';

import { createBackend, getSupportedBackends } from './backends/index.js';
import { push } from './commands/push.js';
import { pull } from './commands/pull.js';
import { syncStatus, formatStatus } from './commands/status.js';
import { OfflineQueue } from './queue/offline-queue.js';
import type { SupabaseCredentials, GitHubCredentials } from './types/backend.js';
import type { BackendType, ConflictStrategy } from './types/sync.js';

const program = new Command();

program
  .name('skill-sync')
  .description('Skill Kit Sync - Cross-device skill synchronization')
  .version('1.0.0');

interface PushCliOptions {
  dir?: string;
  force: boolean;
  include?: string[];
  exclude?: string[];
  delete: boolean;
  dryRun: boolean;
  queue: boolean;
  backend: string;
}

program
  .command('push')
  .description('Push local skills to cloud')
  .option('-d, --dir <path>', 'Skills directory')
  .option('-f, --force', 'Force push (overwrite remote conflicts)', false)
  .option('-i, --include <patterns...>', 'Include patterns (glob)')
  .option('-e, --exclude <patterns...>', 'Exclude patterns (glob)')
  .option('--delete', 'Delete remote skills not present locally', false)
  .option('--dry-run', 'Show what would happen without making changes', false)
  .option('--queue', 'Queue operations if offline', false)
  .option('--backend <type>', 'Backend type (supabase, github-gist)', 'supabase')
  .action(async (options: PushCliOptions) => {
    try {
      const credentials = await getCredentials(options.backend as BackendType);
      const backend = createBackend(options.backend as BackendType);

      await backend.authenticate(credentials);

      const result = await push(
        backend,
        {
          skillsDir: options.dir,
          force: options.force,
          include: options.include,
          exclude: options.exclude,
          deleteRemote: options.delete,
          dryRun: options.dryRun,
          queueOffline: options.queue,
        },
        {
          skillsDir: options.dir ?? expandTilde('~/.skill-kit/skills'),
        }
      );

      if (result.success) {
        logger.success('Push completed');
        logger.info(`  Uploaded: ${result.uploaded}`);
        if (result.deletedRemote > 0) {
          logger.info(`  Deleted remote: ${result.deletedRemote}`);
        }
        if (result.conflicts > 0) {
          logger.warn(`  Conflicts: ${result.conflicts}`);
        }
      } else {
        logger.error('Push failed');
        for (const error of result.errors) {
          logger.error(`  ${error.message}`);
        }
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Push failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

interface PullCliOptions {
  dir?: string;
  force: boolean;
  include?: string[];
  exclude?: string[];
  delete: boolean;
  dryRun: boolean;
  conflict: string;
  backend: string;
}

program
  .command('pull')
  .description('Pull skills from cloud to local')
  .option('-d, --dir <path>', 'Skills directory')
  .option('-f, --force', 'Force pull (overwrite local conflicts)', false)
  .option('-i, --include <patterns...>', 'Include patterns (glob)')
  .option('-e, --exclude <patterns...>', 'Exclude patterns (glob)')
  .option('--delete', 'Delete local skills not present remotely', false)
  .option('--dry-run', 'Show what would happen without making changes', false)
  .option('--conflict <strategy>', 'Conflict resolution strategy', 'manual')
  .option('--backend <type>', 'Backend type (supabase, github-gist)', 'supabase')
  .action(async (options: PullCliOptions) => {
    try {
      const credentials = await getCredentials(options.backend as BackendType);
      const backend = createBackend(options.backend as BackendType);

      await backend.authenticate(credentials);

      const result = await pull(
        backend,
        {
          skillsDir: options.dir,
          force: options.force,
          include: options.include,
          exclude: options.exclude,
          deleteLocal: options.delete,
          dryRun: options.dryRun,
        },
        {
          skillsDir: options.dir ?? expandTilde('~/.skill-kit/skills'),
          conflictStrategy: options.conflict as ConflictStrategy,
        }
      );

      if (result.success) {
        logger.success('Pull completed');
        logger.info(`  Downloaded: ${result.downloaded}`);
        if (result.deletedLocal > 0) {
          logger.info(`  Deleted local: ${result.deletedLocal}`);
        }
        if (result.conflicts > 0) {
          logger.warn(`  Conflicts: ${result.conflicts}`);
        }
      } else {
        logger.error('Pull failed');
        for (const error of result.errors) {
          logger.error(`  ${error.message}`);
        }
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Pull failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

interface StatusCliOptions {
  dir?: string;
  backend: string;
  json: boolean;
}

program
  .command('status')
  .description('Show sync status')
  .option('-d, --dir <path>', 'Skills directory')
  .option('--backend <type>', 'Backend type (supabase, github-gist)', 'supabase')
  .option('-j, --json', 'Output as JSON', false)
  .action(async (options: StatusCliOptions) => {
    try {
      const credentials = await getCredentials(options.backend as BackendType);
      const backend = createBackend(options.backend as BackendType);

      try {
        await backend.authenticate(credentials);
      } catch {
        logger.warn('Could not authenticate - showing local status only');
      }

      const status = await syncStatus(
        backend,
        {
          skillsDir: options.dir,
        },
        {
          skillsDir: options.dir ?? expandTilde('~/.skill-kit/skills'),
        }
      );

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
      } else {
        console.log(formatStatus(status));
      }
    } catch (error) {
      logger.error(`Status check failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

interface QueueCliOptions {
  list: boolean;
  flush: boolean;
  clear: boolean;
  backend: string;
}

program
  .command('queue')
  .description('Manage offline queue')
  .option('--list', 'List queued operations', false)
  .option('--flush', 'Process queued operations', false)
  .option('--clear', 'Clear all queued operations', false)
  .option('--backend <type>', 'Backend type for flush', 'supabase')
  .action(async (options: QueueCliOptions) => {
    try {
      const queue = new OfflineQueue();
      await queue.load();

      if (options.list || (!options.flush && !options.clear)) {
        const status = queue.getStatus();
        console.log(`Pending: ${status.pending}`);
        console.log(`Failed: ${status.failed}`);
        console.log(`Processing: ${status.processing}`);

        if (status.operations.length > 0) {
          console.log('\nOperations:');
          for (const op of status.operations) {
            console.log(`  [${op.type}] ${op.skillName} (retries: ${op.retryCount})`);
          }
        }
      }

      if (options.flush) {
        const credentials = await getCredentials(options.backend as BackendType);
        const backend = createBackend(options.backend as BackendType);
        await backend.authenticate(credentials);

        queue.setBackend(backend);
        const result = await queue.flush();

        logger.success(`Flushed queue: ${result.success} succeeded, ${result.failed} failed`);
        if (result.remaining > 0) {
          logger.info(`${result.remaining} operations remaining`);
        }
      }

      if (options.clear) {
        await queue.clear();
        logger.success('Queue cleared');
      }
    } catch (error) {
      logger.error(`Queue operation failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('backends')
  .description('List supported backends')
  .action(() => {
    const backends = getSupportedBackends();
    console.log('Supported backends:');
    for (const backend of backends) {
      console.log(`  - ${backend}`);
    }
  });

async function getCredentials(
  backendType: BackendType
): Promise<SupabaseCredentials | GitHubCredentials> {
  switch (backendType) {
    case 'supabase': {
      const url = process.env['SUPABASE_URL'];
      const key = process.env['SUPABASE_KEY'];

      if (!url || !key) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
      }

      const credentials: SupabaseCredentials = { type: 'supabase', url, key };

      const email = process.env['SUPABASE_EMAIL'];
      const password = process.env['SUPABASE_PASSWORD'];

      if (email && password) {
        credentials.user = { email, password };
      }

      return credentials;
    }

    case 'github-gist': {
      const token = process.env['GITHUB_TOKEN'];

      if (!token) {
        throw new Error('Missing GITHUB_TOKEN environment variable');
      }

      const gistId = process.env['GITHUB_GIST_ID'];

      return {
        type: 'github',
        token,
        gistId,
      };
    }

    default:
      throw new Error(`Unknown backend type: ${backendType as string}`);
  }
}

program.parse();

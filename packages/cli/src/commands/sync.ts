import type { Command } from 'commander';
import { loadCommandPackage, handleMissingPackage, handleError } from '../utils/index.js';

interface SyncModule {
  createBackend: (type: string) => Backend;
  getSupportedBackends: () => string[];
  push: (backend: Backend, options: PushOptions, config: SyncConfig) => Promise<PushResult>;
  pull: (backend: Backend, options: PullOptions, config: SyncConfig) => Promise<PullResult>;
  syncStatus: (backend: Backend, options: StatusOptions, config: SyncConfig) => Promise<SyncStatus>;
  formatStatus: (status: SyncStatus) => string;
  OfflineQueue: new () => OfflineQueue;
  logger: Logger;
  expandTilde: (path: string) => string;
}

interface Backend {
  authenticate: (credentials: unknown) => Promise<void>;
}

interface Logger {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warn: (msg: string) => void;
}

interface SyncConfig {
  skillsDir: string;
  conflictStrategy?: string;
}

interface PushOptions {
  skillsDir?: string;
  force?: boolean;
  include?: string[];
  exclude?: string[];
  deleteRemote?: boolean;
  dryRun?: boolean;
  queueOffline?: boolean;
}

interface PullOptions {
  skillsDir?: string;
  force?: boolean;
  include?: string[];
  exclude?: string[];
  deleteLocal?: boolean;
  dryRun?: boolean;
}

interface StatusOptions {
  skillsDir?: string;
}

interface PushResult {
  success: boolean;
  uploaded: number;
  deletedRemote: number;
  conflicts: number;
  errors: Array<{ message: string }>;
}

interface PullResult {
  success: boolean;
  downloaded: number;
  deletedLocal: number;
  conflicts: number;
  errors: Array<{ message: string }>;
}

interface SyncStatus {
  local: number;
  remote: number;
  conflicts: number;
}

interface OfflineQueue {
  load: () => Promise<void>;
  getStatus: () => {
    pending: number;
    failed: number;
    processing: number;
    operations: Array<{ type: string; skillName: string; retryCount: number }>;
  };
  setBackend: (backend: Backend) => void;
  flush: () => Promise<{ success: number; failed: number; remaining: number }>;
  clear: () => Promise<void>;
}

export function registerSyncCommand(program: Command): void {
  const sync = program.command('sync').description('Sync skills across devices');

  sync
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
    .action(
      async (options: {
        dir?: string;
        force: boolean;
        include?: string[];
        exclude?: string[];
        delete: boolean;
        dryRun: boolean;
        queue: boolean;
        backend: string;
      }) => {
        const result = await loadCommandPackage<SyncModule>('sync');
        if (!result.success || !result.module) {
          handleMissingPackage('sync');
        }

        const { createBackend, push, logger, expandTilde } = result.module;

        try {
          const credentials = getCredentials(options.backend);
          const backend = createBackend(options.backend);
          await backend.authenticate(credentials);

          const pushResult = await push(
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

          if (pushResult.success) {
            logger.success('Push completed');
            logger.info(`  Uploaded: ${pushResult.uploaded}`);
            if (pushResult.deletedRemote > 0) {
              logger.info(`  Deleted remote: ${pushResult.deletedRemote}`);
            }
            if (pushResult.conflicts > 0) {
              logger.warn(`  Conflicts: ${pushResult.conflicts}`);
            }
          } else {
            logger.error('Push failed');
            for (const error of pushResult.errors) {
              logger.error(`  ${error.message}`);
            }
            process.exit(1);
          }
        } catch (error) {
          handleError(error);
        }
      }
    );

  sync
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
    .action(
      async (options: {
        dir?: string;
        force: boolean;
        include?: string[];
        exclude?: string[];
        delete: boolean;
        dryRun: boolean;
        conflict: string;
        backend: string;
      }) => {
        const result = await loadCommandPackage<SyncModule>('sync');
        if (!result.success || !result.module) {
          handleMissingPackage('sync');
        }

        const { createBackend, pull, logger, expandTilde } = result.module;

        try {
          const credentials = getCredentials(options.backend);
          const backend = createBackend(options.backend);
          await backend.authenticate(credentials);

          const pullResult = await pull(
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
              conflictStrategy: options.conflict,
            }
          );

          if (pullResult.success) {
            logger.success('Pull completed');
            logger.info(`  Downloaded: ${pullResult.downloaded}`);
            if (pullResult.deletedLocal > 0) {
              logger.info(`  Deleted local: ${pullResult.deletedLocal}`);
            }
            if (pullResult.conflicts > 0) {
              logger.warn(`  Conflicts: ${pullResult.conflicts}`);
            }
          } else {
            logger.error('Pull failed');
            for (const error of pullResult.errors) {
              logger.error(`  ${error.message}`);
            }
            process.exit(1);
          }
        } catch (error) {
          handleError(error);
        }
      }
    );

  sync
    .command('status')
    .description('Show sync status')
    .option('-d, --dir <path>', 'Skills directory')
    .option('--backend <type>', 'Backend type (supabase, github-gist)', 'supabase')
    .option('-j, --json', 'Output as JSON', false)
    .action(async (options: { dir?: string; backend: string; json: boolean }) => {
      const result = await loadCommandPackage<SyncModule>('sync');
      if (!result.success || !result.module) {
        handleMissingPackage('sync');
      }

      const { createBackend, syncStatus, formatStatus, logger, expandTilde } = result.module;

      try {
        const credentials = getCredentials(options.backend);
        const backend = createBackend(options.backend);

        try {
          await backend.authenticate(credentials);
        } catch {
          logger.warn('Could not authenticate - showing local status only');
        }

        const status = await syncStatus(
          backend,
          { skillsDir: options.dir },
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
        handleError(error);
      }
    });

  sync
    .command('backends')
    .description('List supported backends')
    .action(async () => {
      const result = await loadCommandPackage<SyncModule>('sync');
      if (!result.success || !result.module) {
        handleMissingPackage('sync');
      }

      const backends = result.module.getSupportedBackends();
      console.log('Supported backends:');
      for (const backend of backends) {
        console.log(`  - ${backend}`);
      }
    });
}

function getCredentials(backendType: string): unknown {
  switch (backendType) {
    case 'supabase': {
      const url = process.env['SUPABASE_URL'];
      const key = process.env['SUPABASE_KEY'];

      if (!url || !key) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
      }

      const credentials: Record<string, unknown> = { type: 'supabase', url, key };
      const email = process.env['SUPABASE_EMAIL'];
      const password = process.env['SUPABASE_PASSWORD'];

      if (email && password) {
        credentials['user'] = { email, password };
      }

      return credentials;
    }

    case 'github-gist': {
      const token = process.env['GITHUB_TOKEN'];

      if (!token) {
        throw new Error('Missing GITHUB_TOKEN environment variable');
      }

      return {
        type: 'github',
        token,
        gistId: process.env['GITHUB_GIST_ID'],
      };
    }

    default:
      throw new Error(`Unknown backend type: ${backendType}`);
  }
}

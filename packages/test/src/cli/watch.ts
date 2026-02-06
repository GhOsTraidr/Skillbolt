import { watch as chokidarWatch, type FSWatcher } from 'chokidar';
import { resolve } from 'node:path';
import type { SkillTestConfig, TestRunResult } from '../types/index.js';
import { createTestRunner } from '../runner/index.js';
import { createConsoleReporter } from '../reporters/index.js';

export interface WatchOptions {
  config: SkillTestConfig;
  cwd?: string;
  onReady?: () => void;
  onRun?: (result: TestRunResult) => void;
  onError?: (error: Error) => void;
}

export interface WatchHandle {
  close(): Promise<void>;
  runAll(): Promise<void>;
}

export function createWatcher(options: WatchOptions): WatchHandle {
  const { config, cwd = process.cwd() } = options;
  const { debounce, clearScreen, additionalPatterns } = config.watch;

  let watcher: FSWatcher | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;

  const patterns = [
    ...config.include.map((p) => resolve(cwd, config.testDir, p)),
    ...additionalPatterns.map((p) => resolve(cwd, p)),
  ];

  const runner = createTestRunner({ config, cwd });
  const reporter = createConsoleReporter({ verbose: config.verbose });

  async function runTests(): Promise<void> {
    if (isRunning) return;

    isRunning = true;

    if (clearScreen) {
      console.clear();
    }

    console.log('\nRunning tests...\n');

    try {
      const result = await runner.runAll();
      reporter.reportRunResult(result);
      options.onRun?.(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error running tests:', err.message);
      options.onError?.(err);
    } finally {
      isRunning = false;
      console.log('\nWatching for changes... (press Ctrl+C to exit)\n');
    }
  }

  function scheduleRun(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      void runTests();
    }, debounce);
  }

  function start(): void {
    watcher = chokidarWatch(patterns, {
      ignored: config.exclude,
      persistent: true,
      ignoreInitial: true,
      cwd,
    });

    watcher
      .on('ready', () => {
        console.log('Watch mode started.');
        console.log(`Watching: ${patterns.join(', ')}`);
        options.onReady?.();
        void runTests();
      })
      .on('change', (path) => {
        console.log(`File changed: ${path}`);
        scheduleRun();
      })
      .on('add', (path) => {
        console.log(`File added: ${path}`);
        scheduleRun();
      })
      .on('unlink', (path) => {
        console.log(`File removed: ${path}`);
        scheduleRun();
      })
      .on('error', (error) => {
        console.error('Watcher error:', error);
        options.onError?.(error);
      });
  }

  start();

  return {
    async close(): Promise<void> {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (watcher) {
        await watcher.close();
        watcher = null;
      }
    },

    async runAll(): Promise<void> {
      await runTests();
    },
  };
}

export async function startWatch(options: WatchOptions): Promise<WatchHandle> {
  const handle = createWatcher(options);

  process.on('SIGINT', async () => {
    console.log('\nStopping watch mode...');
    await handle.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await handle.close();
    process.exit(0);
  });

  return handle;
}

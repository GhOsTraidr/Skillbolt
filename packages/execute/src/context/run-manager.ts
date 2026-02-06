import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { RunMeta } from '../types.js';

export class RunManager {
  private baseDir: string;

  constructor(baseDir = 'runs') {
    this.baseDir = resolve(baseDir);
  }

  cleanupOldRuns(keepCount = 20): number {
    if (!existsSync(this.baseDir)) {
      return 0;
    }

    const runDirs = readdirSync(this.baseDir)
      .map((entry) => join(this.baseDir, entry))
      .filter((entry) => existsSync(entry) && statSync(entry).isDirectory())
      .map((entry) => ({
        path: entry,
        name: entry.split('/').pop() ?? entry,
        mtimeMs: statSync(entry).mtimeMs,
      }))
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    const toRemove = runDirs.slice(keepCount);
    for (const run of toRemove) {
      rmSync(run.path, { recursive: true, force: true });
    }

    return toRemove.length;
  }

  listRuns(): RunMeta[] {
    if (!existsSync(this.baseDir)) {
      return [];
    }

    const entries = readdirSync(this.baseDir)
      .map((entry) => join(this.baseDir, entry))
      .filter((entry) => existsSync(entry) && statSync(entry).isDirectory());

    const runs: RunMeta[] = [];
    for (const dir of entries) {
      const metaPath = join(dir, 'meta.json');
      if (!existsSync(metaPath)) {
        continue;
      }

      try {
        const content = readFileSync(metaPath, 'utf8');
        const meta = JSON.parse(content) as RunMeta;
        runs.push({ ...meta, runDir: meta.runDir ?? dir });
      } catch {
        continue;
      }
    }

    return runs.sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));
  }

  getRun(runId: string): RunMeta | null {
    const runDir = join(this.baseDir, runId);
    const metaPath = join(runDir, 'meta.json');
    if (!existsSync(metaPath)) {
      return null;
    }

    try {
      const content = readFileSync(metaPath, 'utf8');
      const meta = JSON.parse(content) as RunMeta;
      const resultPath = join(runDir, 'result.json');
      if (existsSync(resultPath)) {
        try {
          const resultContent = readFileSync(resultPath, 'utf8');
          const result = JSON.parse(resultContent) as Record<string, unknown>;
          meta.result = result;
        } catch {
          // ignore
        }
      }
      return { ...meta, runDir: meta.runDir ?? runDir };
    } catch {
      return null;
    }
  }
}

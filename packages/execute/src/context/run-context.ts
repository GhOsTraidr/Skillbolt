import {
  mkdirSync,
  cpSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
} from 'node:fs';
import { join, resolve, extname, basename } from 'node:path';
import { createHash } from 'node:crypto';

import type { ExecutionMode, RunMeta } from '../types.js';

interface RunContextCreateOptions {
  baseDir?: string;
  mode?: ExecutionMode;
  taskName?: string;
}

interface RunContextSetupOptions {
  copyAll?: boolean;
}

export class RunContext {
  readonly runId: string;
  readonly runDir: string;
  readonly skillsDir: string;
  readonly workspaceDir: string;
  readonly logsDir: string;

  private constructor(runId: string, runDir: string) {
    this.runId = runId;
    this.runDir = runDir;
    this.skillsDir = join(runDir, '.claude', 'skills');
    this.workspaceDir = join(runDir, 'workspace');
    this.logsDir = join(runDir, 'logs');
  }

  static create(task: string, options: RunContextCreateOptions = {}): RunContext {
    const mode = options.mode ?? 'dag';
    const taskName = sanitizeTaskName(options.taskName ?? task);
    const taskHash = createHash('sha256').update(task).digest('hex').slice(0, 4);
    const timestamp = formatTimestamp(new Date());
    const runId = `${timestamp}-${mode}-${taskName}-${taskHash}`;
    const baseDir = options.baseDir ?? 'runs';
    const runDir = resolve(baseDir, runId);
    return new RunContext(runId, runDir);
  }

  setup(skillNames: string[], sourceSkillDir: string, options: RunContextSetupOptions = {}): void {
    this.ensureDirectories();
    const resolvedSource = resolve(sourceSkillDir);

    if (options.copyAll) {
      if (existsSync(resolvedSource)) {
        cpSync(resolvedSource, this.skillsDir, { recursive: true });
      }
      return;
    }

    for (const skillName of skillNames) {
      const sourceDir = join(resolvedSource, skillName);
      const destDir = join(this.skillsDir, skillName);
      if (!existsSync(sourceDir)) {
        continue;
      }
      cpSync(sourceDir, destDir, { recursive: true });
    }
  }

  copyFiles(filePaths: string[]): string[] {
    mkdirSync(this.workspaceDir, { recursive: true });
    const copiedPaths: string[] = [];

    for (const filePath of filePaths) {
      const absolutePath = resolve(filePath);
      if (!existsSync(absolutePath)) {
        continue;
      }

      const fileStat = statSync(absolutePath);
      const fileExtension = extname(absolutePath);
      const fileName = fileExtension ? basename(absolutePath) : basename(absolutePath);
      const destPath = join(this.workspaceDir, fileName);

      if (fileStat.isDirectory()) {
        cpSync(absolutePath, destPath, { recursive: true });
      } else {
        copyFileSync(absolutePath, destPath);
      }

      copiedPaths.push(destPath);
    }

    return copiedPaths;
  }

  saveMeta(task: string, mode: ExecutionMode, skills: string[]): void {
    const meta: RunMeta = {
      runId: this.runId,
      task,
      mode,
      skills,
      startedAt: new Date().toISOString(),
      runDir: this.runDir,
    };
    this.writeJson(join(this.runDir, 'meta.json'), { ...meta });
  }

  updateMeta(fields: Record<string, unknown>): void {
    const metaPath = join(this.runDir, 'meta.json');
    const existing = this.readJson(metaPath);
    const updated = { ...existing, ...fields };
    this.writeJson(metaPath, updated);
  }

  saveResult(result: Record<string, unknown>): void {
    this.writeJson(join(this.runDir, 'result.json'), result);
    this.updateMeta({ completedAt: new Date().toISOString(), result });
  }

  savePlan(plan: Record<string, unknown>): void {
    this.writeJson(join(this.runDir, 'plan.json'), plan);
  }

  private ensureDirectories(): void {
    mkdirSync(this.runDir, { recursive: true });
    mkdirSync(this.skillsDir, { recursive: true });
    mkdirSync(this.workspaceDir, { recursive: true });
    mkdirSync(this.logsDir, { recursive: true });
  }

  private writeJson(targetPath: string, data: Record<string, unknown>): void {
    writeFileSync(targetPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }

  private readJson(targetPath: string): Record<string, unknown> {
    if (!existsSync(targetPath)) {
      return {};
    }

    try {
      const content = readFileSync(targetPath, 'utf8');
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

const sanitizeTaskName = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  const sanitized = trimmed.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return sanitized.length > 0 ? sanitized.slice(0, 40) : 'task';
};

const formatTimestamp = (date: Date): string => {
  const pad = (num: number) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import type {
  AnalyticsEvent,
  AnalyticsEventInput,
  EventQueryOptions,
  ClearOptions,
  PrivacyLevel,
  ResolvedAnalyticsConfig,
} from '../types/index.js';
import { SCHEMA_VERSION, MIGRATION_SCRIPTS } from './schema.js';

function expandPath(path: string): string {
  if (path.startsWith('~')) {
    return join(homedir(), path.slice(1));
  }
  return path;
}

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class AnalyticsStorage {
  private db: DatabaseType;
  private config: ResolvedAnalyticsConfig;

  constructor(config: ResolvedAnalyticsConfig) {
    this.config = config;
    const dbPath = expandPath(config.dbPath);

    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeSchema();
  }

  private initializeSchema(): void {
    const versionRow = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'")
      .get() as { name: string } | undefined;

    if (!versionRow) {
      this.db.exec(MIGRATION_SCRIPTS[1] ?? '');
      this.db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(SCHEMA_VERSION);
      return;
    }

    const currentVersion = this.db.prepare('SELECT version FROM schema_version').get() as
      | { version: number }
      | undefined;
    const version = currentVersion?.version ?? 0;

    for (let v = version + 1; v <= SCHEMA_VERSION; v++) {
      const script = MIGRATION_SCRIPTS[v];
      if (script) {
        this.db.exec(script);
      }
    }

    if (version < SCHEMA_VERSION) {
      this.db.prepare('UPDATE schema_version SET version = ?').run(SCHEMA_VERSION);
    }
  }

  insert(input: AnalyticsEventInput): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      skillName: input.skillName,
      eventType: input.eventType,
      triggerPhrase: input.triggerPhrase,
      parameters: input.parameters,
      duration: input.duration,
      success: input.success,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
      privacyLevel: this.config.privacyLevel,
    };

    const stmt = this.db.prepare(`
      INSERT INTO events (id, timestamp, skill_name, event_type, trigger_phrase, parameters, duration, success, error_code, error_message, privacy_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.id,
      event.timestamp,
      event.skillName,
      event.eventType,
      event.triggerPhrase ?? null,
      event.parameters ? JSON.stringify(event.parameters) : null,
      event.duration ?? null,
      event.success === undefined ? null : event.success ? 1 : 0,
      event.errorCode ?? null,
      event.errorMessage ?? null,
      event.privacyLevel
    );

    return event;
  }

  query(options: EventQueryOptions = {}): AnalyticsEvent[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options.skillName) {
      conditions.push('skill_name = ?');
      params.push(options.skillName);
    }

    if (options.eventType) {
      conditions.push('event_type = ?');
      params.push(options.eventType);
    }

    if (options.startDate) {
      const startStr =
        typeof options.startDate === 'string' ? options.startDate : options.startDate.toISOString();
      conditions.push('timestamp >= ?');
      params.push(startStr);
    }

    if (options.endDate) {
      const endStr =
        typeof options.endDate === 'string' ? options.endDate : options.endDate.toISOString();
      conditions.push('timestamp <= ?');
      params.push(endStr);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = options.orderBy ?? 'timestamp';
    const order = options.order ?? 'desc';
    const limit = options.limit ?? 1000;
    const offset = options.offset ?? 0;

    const sql = `
      SELECT * FROM events
      ${whereClause}
      ORDER BY ${orderBy === 'skillName' ? 'skill_name' : 'timestamp'} ${order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const rows = this.db.prepare(sql).all(...params) as Array<{
      id: string;
      timestamp: string;
      skill_name: string;
      event_type: string;
      trigger_phrase: string | null;
      parameters: string | null;
      duration: number | null;
      success: number | null;
      error_code: string | null;
      error_message: string | null;
      privacy_level: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      skillName: row.skill_name,
      eventType: row.event_type as AnalyticsEvent['eventType'],
      triggerPhrase: row.trigger_phrase ?? undefined,
      parameters: row.parameters
        ? (JSON.parse(row.parameters) as Record<string, unknown>)
        : undefined,
      duration: row.duration ?? undefined,
      success: row.success === null ? undefined : row.success === 1,
      errorCode: row.error_code ?? undefined,
      errorMessage: row.error_message ?? undefined,
      privacyLevel: row.privacy_level as PrivacyLevel,
    }));
  }

  count(options: Omit<EventQueryOptions, 'limit' | 'offset' | 'orderBy' | 'order'> = {}): number {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options.skillName) {
      conditions.push('skill_name = ?');
      params.push(options.skillName);
    }

    if (options.eventType) {
      conditions.push('event_type = ?');
      params.push(options.eventType);
    }

    if (options.startDate) {
      const startStr =
        typeof options.startDate === 'string' ? options.startDate : options.startDate.toISOString();
      conditions.push('timestamp >= ?');
      params.push(startStr);
    }

    if (options.endDate) {
      const endStr =
        typeof options.endDate === 'string' ? options.endDate : options.endDate.toISOString();
      conditions.push('timestamp <= ?');
      params.push(endStr);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) as count FROM events ${whereClause}`;

    const result = this.db.prepare(sql).get(...params) as { count: number };
    return result.count;
  }

  getUniqueSkills(): string[] {
    const rows = this.db
      .prepare('SELECT DISTINCT skill_name FROM events ORDER BY skill_name')
      .all() as Array<{ skill_name: string }>;
    return rows.map((row) => row.skill_name);
  }

  getDateRange(): { startDate: string; endDate: string } | null {
    const result = this.db
      .prepare('SELECT MIN(timestamp) as start_date, MAX(timestamp) as end_date FROM events')
      .get() as {
      start_date: string | null;
      end_date: string | null;
    };

    if (!result.start_date || !result.end_date) {
      return null;
    }

    return {
      startDate: result.start_date,
      endDate: result.end_date,
    };
  }

  clear(options: ClearOptions = {}): number {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options.olderThan) {
      const dateStr =
        typeof options.olderThan === 'string' ? options.olderThan : options.olderThan.toISOString();
      conditions.push('timestamp < ?');
      params.push(dateStr);
    }

    if (options.skillName) {
      conditions.push('skill_name = ?');
      params.push(options.skillName);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `DELETE FROM events ${whereClause}`;

    const result = this.db.prepare(sql).run(...params);
    return result.changes;
  }

  cleanup(): number {
    if (!this.config.autoCleanup) {
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    return this.clear({ olderThan: cutoffDate });
  }

  close(): void {
    this.db.close();
  }

  getStats(): {
    totalEvents: number;
    dbSizeBytes: number;
    oldestEvent: string | null;
    newestEvent: string | null;
  } {
    const countResult = this.db.prepare('SELECT COUNT(*) as count FROM events').get() as {
      count: number;
    };
    const dateResult = this.db
      .prepare('SELECT MIN(timestamp) as oldest, MAX(timestamp) as newest FROM events')
      .get() as {
      oldest: string | null;
      newest: string | null;
    };

    const pageSizeResult = this.db.prepare('PRAGMA page_size').get() as { page_size: number };
    const pageCountResult = this.db.prepare('PRAGMA page_count').get() as { page_count: number };
    const dbSizeBytes = pageSizeResult.page_size * pageCountResult.page_count;

    return {
      totalEvents: countResult.count,
      dbSizeBytes,
      oldestEvent: dateResult.oldest,
      newestEvent: dateResult.newest,
    };
  }
}

export function createStorage(config: ResolvedAnalyticsConfig): AnalyticsStorage {
  return new AnalyticsStorage(config);
}

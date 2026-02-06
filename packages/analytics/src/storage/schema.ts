export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    trigger_phrase TEXT,
    parameters TEXT,
    duration INTEGER,
    success INTEGER,
    error_code TEXT,
    error_message TEXT,
    privacy_level TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
  CREATE INDEX IF NOT EXISTS idx_events_skill_name ON events(skill_name);
  CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
`;

export const MIGRATION_SCRIPTS: Record<number, string> = {
  1: CREATE_TABLES_SQL,
};

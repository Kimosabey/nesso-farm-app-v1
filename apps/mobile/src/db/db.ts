/**
 * Local SQLite — outbox + read cache.
 * Phase 6 adds more tables (farmers_cache, activities_cache, etc.). For now
 * we keep the schema small and ship the outbox + a tiny meta table.
 */
import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('nesso.db').then(async (db) => {
      await migrate(db);
      return db;
    });
  }
  return dbPromise;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS mutation_outbox (
      id TEXT PRIMARY KEY,
      clientRequestId TEXT NOT NULL UNIQUE,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      retries INTEGER NOT NULL DEFAULT 0,
      lastError TEXT,
      createdAt INTEGER NOT NULL,
      nextAttemptAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outbox_status_next
      ON mutation_outbox (status, nextAttemptAt);

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

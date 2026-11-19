import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { SCHEMA_SQL, seedInitialData, runSchemaMigrations } from './schema';

// Module singleton for SQLite database connection
let globalDb: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (globalDb) {
    return globalDb;
  }

  // Determine database file path: in serverless (e.g. Vercel), use /tmp for ephemeral execution
  const dbDir = process.env.VERCEL ? '/tmp' : process.cwd();
  const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'zyvo.db');

  // Ensure storage/audio directory exists as well for voice submissions
  const audioDir = path.join(dbDir, 'storage', 'audio');
  if (!fs.existsSync(audioDir)) {
    try {
      fs.mkdirSync(audioDir, { recursive: true });
    } catch {
      // Graceful fallback for read-only containers
    }
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL mode for high concurrency and foreign key enforcement
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Initialize schema DDL
  db.exec(SCHEMA_SQL);

  // Seed default demonstration users, workspaces and domain catalogs
  seedInitialData(db);

  // Run schema migrations and integrity updates
  runSchemaMigrations(db);

  globalDb = db;
  return db;
}

export function closeDb(): void {
  if (globalDb) {
    globalDb.close();
    globalDb = null;
  }
}

import Database from 'better-sqlite3';
import path from 'path';

interface SessionRow {
  id: string;
  name: string;
  messages: string;
  created_at: number;
  updated_at: number;
}

export interface Session {
  id: string;
  name: string;
  messages: any[];
  created_at: number;
  updated_at: number;
}

const DB_PATH = path.join(process.cwd(), 'data', 'cognee.db');

let db: Database.Database | null = null;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        messages TEXT NOT NULL DEFAULT '[]',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }
  return db;
}

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    name: row.name,
    messages: JSON.parse(row.messages),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getAllSessions(): Session[] {
  const rows = getDb().prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all() as SessionRow[];
  return rows.map(rowToSession);
}

export function getSession(id: string): Session | null {
  const row = getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined;
  return row ? rowToSession(row) : null;
}

export function upsertSession(id: string, name: string, messages: any[]): Session {
  const now = Date.now();
  const existing = getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined;
  const messagesJson = JSON.stringify(messages);
  if (existing) {
    getDb().prepare('UPDATE sessions SET name = ?, messages = ?, updated_at = ? WHERE id = ?').run(name, messagesJson, now, id);
  } else {
    getDb().prepare('INSERT INTO sessions (id, name, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, name, messagesJson, now, now);
  }
  return { id, name, messages, created_at: existing?.created_at ?? now, updated_at: now };
}

export function deleteSession(id: string): boolean {
  const result = getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
  return result.changes > 0;
}

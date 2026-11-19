import crypto from 'node:crypto';
import { getDb } from './db/index';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  created_at: string;
}

export interface WorkspaceMembership {
  workspace_id: string;
  workspace_name: string;
  vertical_type: string;
  role: string;
}

export interface SessionData {
  sessionId: string;
  user: User;
  token: string;
  expiresAt: string;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createSession(userId: string): { token: string; expiresAt: string; sessionId: string } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const sessionId = `sess_${crypto.randomUUID()}`;
  
  // 7 days expiration
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(sessionId, userId, tokenHash, expiresAt, createdAt);

  return { token, expiresAt, sessionId };
}

export function validateSession(token: string): User | null {
  if (!token) return null;
  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    SELECT u.id, u.name, u.phone, u.email, u.role, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `);

  const user = stmt.get(tokenHash, now) as User | undefined;
  return user || null;
}

export function deleteSession(token: string): void {
  if (!token) return;
  const db = getDb();
  const tokenHash = hashToken(token);
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function getUserWorkspaces(userId: string): WorkspaceMembership[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT w.id as workspace_id, w.name as workspace_name, w.vertical_type, wm.role
    FROM workspace_memberships wm
    JOIN workspaces w ON wm.workspace_id = w.id
    WHERE wm.user_id = ?
    ORDER BY w.name ASC
  `);
  return stmt.all(userId) as unknown as WorkspaceMembership[];
}

export function getDemoUsers(): User[] {
  const db = getDb();
  return db.prepare('SELECT id, name, phone, email, role, created_at FROM users ORDER BY role DESC').all() as unknown as User[];
}

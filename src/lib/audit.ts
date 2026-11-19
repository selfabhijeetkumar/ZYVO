import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { getDb } from './db/index';

export interface AuditEventParams {
  submissionId: string;
  actionType: string;
  priorState?: string | null;
  newState: string;
  transcriptSpan?: string | null;
  actorId: string;
}

export function logAuditEvent(params: AuditEventParams, existingDb?: DatabaseSync): string {
  const db = existingDb || getDb();
  const eventId = `aud_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO audit_events (id, submission_id, action_type, prior_state, new_state, transcript_span, actor_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    eventId,
    params.submissionId,
    params.actionType,
    params.priorState || null,
    params.newState,
    params.transcriptSpan || null,
    params.actorId,
    now
  );

  return eventId;
}

export function getAuditEvents(submissionId?: string, limit: number = 50): any[] {
  const db = getDb();
  if (submissionId) {
    return db.prepare(`
      SELECT ae.*, u.name as actor_name, u.role as actor_role
      FROM audit_events ae
      JOIN users u ON ae.actor_id = u.id
      WHERE ae.submission_id = ?
      ORDER BY ae.created_at DESC
      LIMIT ?
    `).all(submissionId, limit) as any[];
  }

  return db.prepare(`
    SELECT ae.*, u.name as actor_name, u.role as actor_role, vs.vertical_type, vs.transcript_raw
    FROM audit_events ae
    JOIN users u ON ae.actor_id = u.id
    LEFT JOIN voice_submissions vs ON ae.submission_id = vs.id
    ORDER BY ae.created_at DESC
    LIMIT ?
  `).all(limit) as any[];
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  const user = token ? validateSession(token) : null;
  const db = getDb();

  let workspaces = [];
  if (user && user.role !== 'operator') {
    // Return workspaces user belongs to
    workspaces = db.prepare(`
      SELECT w.*, wm.role as member_role
      FROM workspaces w
      JOIN workspace_memberships wm ON w.id = wm.workspace_id
      WHERE wm.user_id = ?
      ORDER BY w.name ASC
    `).all(user.id);
  } else {
    // Return all workspaces for platform operator
    workspaces = db.prepare(`
      SELECT w.*, 'operator' as member_role
      FROM workspaces w
      ORDER BY w.name ASC
    `).all();
  }

  return NextResponse.json({ workspaces });
}

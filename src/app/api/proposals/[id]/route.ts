import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const submission = db.prepare(`
    SELECT vs.*, u.name as user_name, u.phone as user_phone, w.name as workspace_name
    FROM voice_submissions vs
    JOIN users u ON vs.user_id = u.id
    JOIN workspaces w ON vs.workspace_id = w.id
    WHERE vs.id = ?
  `).get(id) as any;

  if (!submission) {
    return NextResponse.json({ error: 'Proposal submission not found' }, { status: 404 });
  }

  const proposal = submission.proposal_json ? JSON.parse(submission.proposal_json) : null;

  return NextResponse.json({
    submission,
    proposal,
  });
}

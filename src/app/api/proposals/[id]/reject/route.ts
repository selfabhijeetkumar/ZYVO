import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const submission = db.prepare('SELECT * FROM voice_submissions WHERE id = ?').get(id) as any;
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status === 'APPLIED') {
      return NextResponse.json({ error: 'Cannot reject an already applied proposal' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'User cancelled/rejected proposal';

    db.prepare(`
      UPDATE voice_submissions
      SET state = 'REJECTED',
          status = 'REJECTED',
          status_reason = ?
      WHERE id = ?
    `).run(reason, id);

    logAuditEvent({
      submissionId: id,
      actionType: 'PROPOSAL_REJECTED',
      priorState: submission.status,
      newState: 'REJECTED',
      transcriptSpan: submission.transcript_raw,
      actorId: submission.user_id,
    }, db);

    return NextResponse.json({
      success: true,
      submissionId: id,
      status: 'REJECTED',
      reason,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getVerticalModule } from '@/lib/vertical-registry';
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
      return NextResponse.json({ error: 'Proposal has already been applied' }, { status: 400 });
    }

    if (submission.status === 'REJECTED') {
      return NextResponse.json({ error: 'Proposal has been rejected' }, { status: 400 });
    }

    if (!submission.proposal_json) {
      return NextResponse.json({ error: 'No proposal available for confirmation' }, { status: 400 });
    }

    const proposal = JSON.parse(submission.proposal_json);
    const vertical = getVerticalModule(submission.vertical_type);

    if (!vertical) {
      return NextResponse.json({ error: `Unsupported vertical: ${submission.vertical_type}` }, { status: 400 });
    }

    // Apply domain transaction
    const result = await vertical.applyTransaction(db, submission.id, proposal.fields, submission.user_id);

    // Update submission status to APPLIED
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE voice_submissions
      SET state = 'APPLIED',
          status = 'APPLIED',
          status_reason = ?,
          applied_at = ?
      WHERE id = ?
    `).run(result.summary, now, submission.id);

    // Log audit event
    logAuditEvent({
      submissionId: submission.id,
      actionType: 'PROPOSAL_CONFIRMED',
      priorState: submission.status,
      newState: 'APPLIED',
      transcriptSpan: submission.transcript_raw,
      actorId: submission.user_id,
    }, db);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      result,
    });
  } catch (error: any) {
    console.error('Error confirming proposal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

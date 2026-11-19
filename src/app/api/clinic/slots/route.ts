import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_clinic_01';
  const doctorId = req.nextUrl.searchParams.get('doctorId') || 'doc_01';
  const date = req.nextUrl.searchParams.get('date') || '2026-11-20';

  const slots = db.prepare(`
    SELECT * FROM clinic_appointment_slots
    WHERE workspace_id = ? AND doctor_id = ? AND slot_date = ?
    ORDER BY start_time ASC
  `).all(workspaceId, doctorId, date);

  return NextResponse.json({
    slots,
  });
}

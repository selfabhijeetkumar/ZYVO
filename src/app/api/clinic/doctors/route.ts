import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_clinic_01';

  const doctors = db.prepare(`
    SELECT * FROM clinic_doctors
    WHERE workspace_id = ?
    ORDER BY name ASC
  `).all(workspaceId);

  return NextResponse.json({
    doctors,
  });
}

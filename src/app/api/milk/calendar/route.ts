import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  const user = token ? validateSession(token) : null;
  const db = getDb();

  const customerId = user ? user.id : 'user_customer_01';
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_milk_01';
  const startDate = req.nextUrl.searchParams.get('startDate') || '2026-11-01';
  const endDate = req.nextUrl.searchParams.get('endDate') || '2026-11-30';

  const rows = db.prepare(`
    SELECT * FROM milk_delivery_calendar
    WHERE workspace_id = ? AND customer_id = ? AND delivery_date >= ? AND delivery_date <= ?
    ORDER BY delivery_date ASC
  `).all(workspaceId, customerId, startDate, endDate);

  return NextResponse.json({
    calendar: rows,
  });
}

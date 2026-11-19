import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import { agricultureHandler } from '@/lib/verticals/agriculture';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  const user = token ? validateSession(token) : null;
  const db = getDb();

  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_agri_01';
  const role = user ? user.role : 'operator';

  let reqQuery = `
    SELECT r.*, c.crop_name, c.indicative_rate_paise_per_quintal, u.name as farmer_name, u.phone as farmer_phone
    FROM agri_procurement_requests r
    JOIN agri_crop_catalog c ON r.crop_id = c.id
    JOIN users u ON r.farmer_id = u.id
    WHERE r.workspace_id = ?
  `;
  const queryParams: any[] = [workspaceId];

  if (role !== 'operator' && user) {
    reqQuery += ' AND r.farmer_id = ?';
    queryParams.push(user.id);
  }

  reqQuery += ' ORDER BY r.created_at DESC LIMIT 30';
  const requests = db.prepare(reqQuery).all(...queryParams) as any[];

  // Fetch pickup schedule for each
  const getSchedule = db.prepare(`
    SELECT * FROM agri_pickup_schedules WHERE request_id = ? LIMIT 1
  `);

  const enriched = requests.map((r) => ({
    ...r,
    schedule: getSchedule.get(r.id),
  }));

  return NextResponse.json({
    requests: enriched,
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('zyvo_session')?.value;
    const user = token ? validateSession(token) : null;
    const db = getDb();

    const body = await req.json();
    const actorId = user ? user.id : (body.farmerId || 'user_customer_01');
    const submissionId = body.submissionId || `v_agri_${Date.now()}`;

    const result = await agricultureHandler.applyTransaction(db, submissionId, body, actorId);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

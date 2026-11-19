import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  const user = token ? validateSession(token) : null;
  const db = getDb();

  const customerId = user ? user.id : 'user_customer_01';
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_milk_01';

  const sub = db.prepare(`
    SELECT s.*, u.name as customer_name, u.phone as customer_phone
    FROM milk_customer_subscriptions s
    JOIN users u ON s.customer_id = u.id
    WHERE s.workspace_id = ? AND s.customer_id = ?
  `).get(workspaceId, customerId) as any;

  return NextResponse.json({
    subscription: sub || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('zyvo_session')?.value;
    const user = token ? validateSession(token) : null;
    const db = getDb();

    const customerId = user ? user.id : 'user_customer_01';
    const body = await req.json();
    const workspaceId = body.workspaceId || 'ws_milk_01';
    const newQuantityMl = Number(body.baseQuantityMl);

    if (!newQuantityMl || newQuantityMl <= 0) {
      return NextResponse.json({ error: 'Valid positive base quantity in ml required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE milk_customer_subscriptions
      SET base_quantity_ml = ?
      WHERE workspace_id = ? AND customer_id = ?
    `).run(newQuantityMl, workspaceId, customerId);

    const updated = db.prepare(`
      SELECT * FROM milk_customer_subscriptions
      WHERE workspace_id = ? AND customer_id = ?
    `).get(workspaceId, customerId);

    return NextResponse.json({
      success: true,
      subscription: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

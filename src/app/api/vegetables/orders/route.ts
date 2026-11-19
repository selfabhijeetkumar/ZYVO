import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import { vegetableHandler } from '@/lib/verticals/vegetable';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  const user = token ? validateSession(token) : null;
  const db = getDb();

  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_veg_01';
  const role = user ? user.role : 'operator';

  let ordersQuery = 'SELECT o.*, u.name as customer_name, u.phone as customer_phone FROM vegetable_orders o JOIN users u ON o.customer_id = u.id WHERE o.workspace_id = ?';
  const queryParams: any[] = [workspaceId];

  if (role !== 'operator' && user) {
    ordersQuery += ' AND o.customer_id = ?';
    queryParams.push(user.id);
  }

  ordersQuery += ' ORDER BY o.created_at DESC LIMIT 20';
  const orders = db.prepare(ordersQuery).all(...queryParams) as any[];

  // Fetch produce line items
  const getItems = db.prepare(`
    SELECT * FROM vegetable_order_items
    WHERE order_id = ?
    ORDER BY requested_item_name ASC
  `);

  const enrichedOrders = orders.map((order) => ({
    ...order,
    items: getItems.all(order.id),
  }));

  return NextResponse.json({
    orders: enrichedOrders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('zyvo_session')?.value;
    const user = token ? validateSession(token) : null;
    const db = getDb();

    const body = await req.json();
    const actorId = user ? user.id : 'user_customer_01';
    const submissionId = body.submissionId || `v_api_${Date.now()}`;

    const result = await vegetableHandler.applyTransaction(db, submissionId, body, actorId);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

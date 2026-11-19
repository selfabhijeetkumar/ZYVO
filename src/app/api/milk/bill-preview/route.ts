import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import { calculateMonthlyMilkBill } from '@/lib/verticals/milk/billing';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  const user = token ? validateSession(token) : null;
  const db = getDb();

  const customerId = user ? user.id : 'user_customer_01';
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_milk_01';
  const yearMonth = req.nextUrl.searchParams.get('yearMonth') || '2026-11';
  const referenceNow = req.nextUrl.searchParams.get('referenceNow') || new Date().toISOString();

  const bill = calculateMonthlyMilkBill(db, workspaceId, customerId, yearMonth, referenceNow);

  return NextResponse.json({
    bill,
  });
}

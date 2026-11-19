import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getVendorDailyManifest } from '@/lib/verticals/milk/manifest';

export async function GET(req: NextRequest) {
  const db = getDb();
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_milk_01';
  
  // Default date to tomorrow morning's route
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = req.nextUrl.searchParams.get('date') || tomorrow.toISOString().split('T')[0];

  const manifest = getVendorDailyManifest(db, workspaceId, dateStr);

  return NextResponse.json({
    manifest,
  });
}

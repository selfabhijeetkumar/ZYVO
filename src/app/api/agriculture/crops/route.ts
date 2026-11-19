import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_agri_01';

  const crops = db.prepare(`
    SELECT * FROM agri_crop_catalog
    WHERE workspace_id = ?
    ORDER BY crop_name ASC
  `).all(workspaceId);

  return NextResponse.json({
    crops,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_veg_01';

  const produce = db.prepare(`
    SELECT * FROM vegetable_produce_catalog
    WHERE workspace_id = ?
    ORDER BY category ASC, name ASC
  `).all(workspaceId);

  const aliases = db.prepare(`
    SELECT a.*, p.name as produce_name
    FROM vegetable_produce_aliases a
    JOIN vegetable_produce_catalog p ON a.produce_id = p.id
    WHERE p.workspace_id = ?
    ORDER BY a.alias_term ASC
  `).all(workspaceId);

  return NextResponse.json({
    produce,
    aliases,
  });
}

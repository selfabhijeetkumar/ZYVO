import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_kirana_01';

  const products = db.prepare(`
    SELECT * FROM kirana_product_catalog
    WHERE workspace_id = ?
    ORDER BY category ASC, name ASC
  `).all(workspaceId);

  const aliases = db.prepare(`
    SELECT a.*, p.name as product_name
    FROM kirana_product_aliases a
    JOIN kirana_product_catalog p ON a.catalog_id = p.id
    WHERE p.workspace_id = ?
    ORDER BY a.alias_term ASC
  `).all(workspaceId);

  return NextResponse.json({
    products,
    aliases,
  });
}

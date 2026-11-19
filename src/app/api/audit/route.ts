import { NextRequest, NextResponse } from 'next/server';
import { getAuditEvents } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const submissionId = searchParams.get('submissionId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const events = getAuditEvents(submissionId, limit);
  return NextResponse.json({ events });
}

import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const submission = db.prepare('SELECT audio_file_path, audio_mime_type FROM voice_submissions WHERE id = ?').get(id) as any;
  if (!submission) {
    return NextResponse.json({ error: 'Audio submission not found' }, { status: 404 });
  }

  const filePath = submission.audio_file_path;
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Audio file not found on storage disk' }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  // Convert Node ReadStream to Web ReadableStream
  const readableStream = new ReadableStream({
    start(controller) {
      fileStream.on('data', (chunk) => controller.enqueue(chunk));
      fileStream.on('end', () => controller.close());
      fileStream.on('error', (err) => controller.error(err));
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      'Content-Type': submission.audio_mime_type || 'audio/webm',
      'Content-Length': stat.size.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

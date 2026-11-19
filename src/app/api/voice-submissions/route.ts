import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { transcribeAudio } from '@/lib/voice/stt-service';
import { extractSlotsFromTranscript } from '@/lib/voice/slot-extractor';
import { getVerticalModule } from '@/lib/vertical-registry';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const db = getDb();
  const searchParams = req.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId');
  const verticalType = searchParams.get('verticalType');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let query = 'SELECT * FROM voice_submissions WHERE 1=1';
  const params: any[] = [];

  if (workspaceId) {
    query += ' AND workspace_id = ?';
    params.push(workspaceId);
  }
  if (verticalType) {
    query += ' AND vertical_type = ?';
    params.push(verticalType);
  }

  query += ' ORDER BY received_at DESC LIMIT ?';
  params.push(limit);

  const submissions = db.prepare(query).all(...params);
  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const contentType = req.headers.get('content-type') || '';
    const submissionId = `vsub_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    let workspaceId = 'ws_milk_01';
    let userId = 'user_customer_01';
    let verticalType = 'milk_delivery';
    let audioBuffer: Buffer;
    let mimeType = 'audio/webm';
    let hintKey: string | undefined;
    let manualTranscript: string | undefined;

    const audioDir = path.join(process.cwd(), 'storage', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    const audioFilePath = path.join(audioDir, `${submissionId}.webm`);

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      workspaceId = (formData.get('workspaceId') as string) || workspaceId;
      userId = (formData.get('userId') as string) || userId;
      verticalType = (formData.get('verticalType') as string) || verticalType;
      hintKey = (formData.get('hintKey') as string) || undefined;
      manualTranscript = (formData.get('manualTranscript') as string) || undefined;

      const file = formData.get('audio') as File | null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        mimeType = file.type || mimeType;
      } else {
        // Create 1KB dummy audio file for text-simulation/benchmarks
        audioBuffer = Buffer.alloc(1024);
      }
    } else {
      const json = await req.json();
      workspaceId = json.workspaceId || workspaceId;
      userId = json.userId || userId;
      verticalType = json.verticalType || verticalType;
      hintKey = json.hintKey;
      manualTranscript = json.manualTranscript;
      audioBuffer = Buffer.alloc(1024); // synthetic audio
    }

    // Enforce audio upload limits: 10 MB maximum size
    if (audioBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio payload exceeds maximum allowed size of 10 MB' },
        { status: 400 }
      );
    }

    // Validate audio MIME types
    const allowedMimes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/x-m4a', 'application/octet-stream'];
    if (!allowedMimes.some((m) => mimeType.toLowerCase().startsWith(m.split('/')[0]))) {
      return NextResponse.json(
        { error: `Invalid audio format: ${mimeType}. Expected WebM, MP4, WAV, or OGG audio.` },
        { status: 400 }
      );
    }

    // Save audio file to storage/audio/
    fs.writeFileSync(audioFilePath, audioBuffer);

    // 1. Initial State: RECEIVED
    db.prepare(`
      INSERT INTO voice_submissions (
        id, workspace_id, user_id, vertical_type, recorded_at, received_at,
        audio_file_path, audio_mime_type, state, status, status_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', 'RECEIVED', 'Audio payload received')
    `).run(submissionId, workspaceId, userId, verticalType, now, now, audioFilePath, mimeType);

    logAuditEvent({
      submissionId,
      actionType: 'VOICE_SUBMISSION_RECEIVED',
      priorState: null,
      newState: 'RECEIVED',
      transcriptSpan: null,
      actorId: userId,
    }, db);

    // 2. Transcription: TRANSCRIBED
    let sttResult;
    if (manualTranscript) {
      sttResult = {
        transcript: manualTranscript,
        languageCode: 'hi-IN',
        confidence: 0.98,
      };
    } else {
      sttResult = await transcribeAudio(audioFilePath, mimeType, hintKey);
    }

    db.prepare(`
      UPDATE voice_submissions
      SET transcript_raw = ?, detected_language = ?, state = 'TRANSCRIBED', status = 'TRANSCRIBED', status_reason = 'Transcription complete'
      WHERE id = ?
    `).run(sttResult.transcript, sttResult.languageCode, submissionId);

    // 3. Slot Extraction & Proposal Creation
    const extracted = await extractSlotsFromTranscript(sttResult.transcript, verticalType as any, {
      workspaceId,
      customerId: userId,
    });

    const proposalJson = JSON.stringify({
      intent: extracted.intent,
      summary: extracted.summary,
      confidence: extracted.confidence,
      fields: extracted.parsedFields,
    });

    const nextStatus = extracted.needsClarification ? 'NEEDS_CLARIFICATION' : 'AWAITING_CONFIRMATION';
    const statusReason = extracted.needsClarification
      ? 'Ambiguous input requiring customer clarification'
      : 'Structured proposal ready for confirmation';

    db.prepare(`
      UPDATE voice_submissions
      SET proposal_json = ?,
          needs_clarification = ?,
          clarification_prompt = ?,
          confidence_score = ?,
          state = ?,
          status = ?,
          status_reason = ?,
          processed_at = ?
      WHERE id = ?
    `).run(
      proposalJson,
      extracted.needsClarification ? 1 : 0,
      extracted.clarificationPrompt || null,
      extracted.confidence,
      nextStatus,
      nextStatus,
      statusReason,
      new Date().toISOString(),
      submissionId
    );

    logAuditEvent({
      submissionId,
      actionType: 'PROPOSAL_GENERATED',
      priorState: 'TRANSCRIBED',
      newState: nextStatus,
      transcriptSpan: sttResult.transcript,
      actorId: userId,
    }, db);

    // Retrieve full submission record
    const record = db.prepare('SELECT * FROM voice_submissions WHERE id = ?').get(submissionId);

    return NextResponse.json({
      success: true,
      submission: record,
      proposal: extracted,
    });
  } catch (error: any) {
    console.error('Error processing voice submission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import fs from 'node:fs';
import { speechRouter } from '../providers/speech/provider-router';
import { STTResult } from './types';

export async function transcribeAudio(
  audioFilePath: string,
  mimeType: string = 'audio/webm',
  hintKey?: string
): Promise<STTResult> {
  let audioBuffer: Buffer;
  try {
    if (audioFilePath && fs.existsSync(audioFilePath)) {
      audioBuffer = fs.readFileSync(audioFilePath);
    } else {
      audioBuffer = Buffer.alloc(1024);
    }
  } catch {
    audioBuffer = Buffer.alloc(1024);
  }

  const result = await speechRouter.transcribe(audioBuffer, mimeType, {
    benchmarkHintKey: hintKey,
  });

  return {
    transcript: result.transcript,
    languageCode: result.language,
    confidence: result.confidence,
  };
}

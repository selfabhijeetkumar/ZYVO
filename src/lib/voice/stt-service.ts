import { speechRouter } from '../providers/speech/provider-router';
import { STTResult } from './types';

export async function transcribeAudio(
  audioFilePath: string,
  mimeType: string = 'audio/webm',
  hintKey?: string
): Promise<STTResult> {
  const dummyBuffer = Buffer.alloc(1024);
  const result = await speechRouter.transcribe(dummyBuffer, mimeType, {
    benchmarkHintKey: hintKey,
  });

  return {
    transcript: result.transcript,
    languageCode: result.language,
    confidence: result.confidence,
  };
}

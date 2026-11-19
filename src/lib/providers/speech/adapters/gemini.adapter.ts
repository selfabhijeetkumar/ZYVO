import { SpeechToTextProvider, TranscriptionResult, TranscriptionOptions } from '../types';

export class GeminiSpeechAdapter implements SpeechToTextProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini Multimodal Audio';

  public isConfigured(): boolean {
    const isEnabled = process.env.EXTERNAL_API_ENABLED === 'true';
    const hasKey = Boolean(process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here');
    return isEnabled && hasKey;
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Gemini Audio STT is disabled or unconfigured. (Subject to future verification of Google audio transcription endpoints).'
      );
    }

    // Future placeholder:
    // Requires verification whether using File API + generateContent or specialized Cloud Speech-to-Text V2.
    throw new Error('Gemini Speech live client not engaged in this phase.');
  }
}

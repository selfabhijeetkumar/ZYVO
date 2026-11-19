import { SpeechToTextProvider, TranscriptionResult, TranscriptionOptions } from '../types';

export class GroqSpeechAdapter implements SpeechToTextProvider {
  public readonly id = 'groq';
  public readonly name = 'Groq Whisper Audio';

  public isConfigured(): boolean {
    const isEnabled = process.env.EXTERNAL_API_ENABLED === 'true';
    const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
    return isEnabled && hasKey;
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Groq Whisper STT is disabled or unconfigured (EXTERNAL_API_ENABLED=false).'
      );
    }

    // Future placeholder:
    // POST https://api.groq.com/openai/v1/audio/transcriptions
    // Headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    // Model: 'whisper-large-v3-turbo'
    throw new Error('Groq Whisper live client not engaged in this phase.');
  }
}

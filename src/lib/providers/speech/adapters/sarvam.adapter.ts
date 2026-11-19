import { SpeechToTextProvider, TranscriptionResult, TranscriptionOptions } from '../types';

export class SarvamSpeechAdapter implements SpeechToTextProvider {
  public readonly id = 'sarvam';
  public readonly name = 'Sarvam Saaras STT';

  public isConfigured(): boolean {
    const isEnabled = process.env.EXTERNAL_API_ENABLED === 'true';
    const hasKey = Boolean(process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'your_sarvam_api_key_here');
    return isEnabled && hasKey;
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Sarvam STT is disabled or unconfigured. External API calls are guarded (EXTERNAL_API_ENABLED=false).'
      );
    }

    // Future implementation placeholder:
    // POST https://api.sarvam.ai/speech-to-text
    // Headers: { 'api-subscription-key': process.env.SARVAM_API_KEY }
    // Form-Data: { file: audioBuffer, model: 'saaras:v2' }
    throw new Error('Sarvam live client not engaged in this phase.');
  }
}

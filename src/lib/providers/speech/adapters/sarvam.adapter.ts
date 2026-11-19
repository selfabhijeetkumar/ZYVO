import { SpeechToTextProvider, TranscriptionResult, TranscriptionOptions } from '../types';

export class SarvamSpeechAdapter implements SpeechToTextProvider {
  public readonly id = 'sarvam';
  public readonly name = 'Sarvam Saaras STT';

  public isConfigured(): boolean {
    const isEnabled = process.env.EXTERNAL_API_ENABLED === 'true';
    const key = process.env.SARVAM_API_KEY;
    const hasKey = Boolean(key && key.trim() !== '' && key !== 'your_sarvam_api_key_here');
    return isEnabled && hasKey;
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Sarvam STT is disabled or unconfigured. (Set EXTERNAL_API_ENABLED=true and provide SARVAM_API_KEY).'
      );
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Sarvam STT: Audio buffer is empty.');
    }

    const startTime = Date.now();
    const apiKey = process.env.SARVAM_API_KEY!.trim();
    const model = process.env.SARVAM_STT_MODEL || 'saaras:v4';
    const endpoint = 'https://api.sarvam.ai/speech-to-text';

    // Infer filename extension from mimeType
    let extension = 'webm';
    if (mimeType.includes('wav')) extension = 'wav';
    else if (mimeType.includes('mp4') || mimeType.includes('m4a')) extension = 'mp4';
    else if (mimeType.includes('ogg')) extension = 'ogg';
    else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) extension = 'mp3';

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append('file', blob, `recording.${extension}`);
    formData.append('model', model);
    formData.append('mode', 'codemix');
    if (options?.languageHint && options.languageHint !== 'unknown') {
      formData.append('language_code', options.languageHint);
    } else {
      formData.append('language_code', 'unknown');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errMessage = response.statusText;
        try {
          const errData = await response.json();
          errMessage = errData.message || errData.error || JSON.stringify(errData);
        } catch {
          // Ignore JSON parse error on non-ok
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(`Sarvam STT Authentication Error (HTTP ${response.status}): ${errMessage}`);
        } else if (response.status === 429) {
          throw new Error(`Sarvam STT Quota/Rate Limit Exceeded (HTTP 429): ${errMessage}`);
        } else {
          throw new Error(`Sarvam STT Server Error (HTTP ${response.status}): ${errMessage}`);
        }
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      const transcript = typeof data.transcript === 'string' ? data.transcript.trim() : '';
      const detectedLang = data.language_code || 'hi-IN';

      return {
        transcript,
        language: detectedLang,
        confidence: 0.95,
        provider: 'sarvam',
        latencyMs,
        isMock: false,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Sarvam STT call timed out after 12000ms.');
      }
      throw err;
    }
  }
}

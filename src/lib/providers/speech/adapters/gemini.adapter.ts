import { SpeechToTextProvider, TranscriptionResult, TranscriptionOptions } from '../types';

export class GeminiSpeechAdapter implements SpeechToTextProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini Multimodal Audio';

  private getApiKey(): string | undefined {
    const key = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (key && key.trim() !== '' && key !== 'your_google_ai_api_key_here') {
      return key.trim();
    }
    return undefined;
  }

  public isConfigured(): boolean {
    const isEnabled = process.env.EXTERNAL_API_ENABLED === 'true';
    return isEnabled && Boolean(this.getApiKey());
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    const apiKey = this.getApiKey();
    if (!this.isConfigured() || !apiKey) {
      throw new Error(
        'Gemini Audio STT is disabled or unconfigured. (Set EXTERNAL_API_ENABLED=true and provide GOOGLE_AI_API_KEY).'
      );
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Gemini Audio STT: Audio buffer is empty.');
    }

    const startTime = Date.now();
    const model = process.env.GEMINI_STT_MODEL || 'gemini-3.5-transcribe';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Normalize audio mime type for Gemini inlineData
    let normalizedMime = mimeType;
    if (mimeType.includes('webm')) normalizedMime = 'audio/webm';
    else if (mimeType.includes('wav')) normalizedMime = 'audio/wav';
    else if (mimeType.includes('mp4') || mimeType.includes('m4a')) normalizedMime = 'audio/mp4';
    else if (mimeType.includes('ogg')) normalizedMime = 'audio/ogg';
    else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) normalizedMime = 'audio/mp3';

    const base64Audio = audioBuffer.toString('base64');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Transcribe this audio verbatim in Indic/English language. Output only the transcript text, or empty string if audio is silent. Do not include commentary, conversational filler, or code fences.',
                },
                {
                  inlineData: {
                    mimeType: normalizedMime,
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errMessage = response.statusText;
        try {
          const errData = await response.json();
          errMessage = errData.error?.message || JSON.stringify(errData);
        } catch {
          // Ignore parse errors
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(`Gemini STT Authentication Error (HTTP ${response.status}): ${errMessage}`);
        } else if (response.status === 429) {
          throw new Error(`Gemini STT Quota/Rate Limit Exceeded (HTTP 429): ${errMessage}`);
        } else {
          throw new Error(`Gemini STT Server Error (HTTP ${response.status}): ${errMessage}`);
        }
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      // Strip potential enclosing quotes or filler
      if (rawText.startsWith('"') && rawText.endsWith('"')) {
        rawText = rawText.slice(1, -1).trim();
      }

      return {
        transcript: rawText,
        language: 'hi-IN',
        confidence: 0.92,
        provider: 'gemini',
        latencyMs,
        isMock: false,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Gemini Audio STT call timed out after 12000ms.');
      }
      throw err;
    }
  }
}

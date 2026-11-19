export interface TranscriptionResult {
  transcript: string;
  language: string;
  confidence: number;
  provider: string;
  latencyMs: number;
  isMock: boolean;
}

export interface TranscriptionOptions {
  languageHint?: string;
  model?: string;
  benchmarkHintKey?: string;
}

export interface SpeechToTextProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult>;
}

export interface ProviderHealth {
  providerId: string;
  name: string;
  isConfigured: boolean;
  status: 'healthy' | 'degraded' | 'unconfigured' | 'mock_mode';
  circuitOpen: boolean;
  lastError?: string;
  failureCount: number;
}

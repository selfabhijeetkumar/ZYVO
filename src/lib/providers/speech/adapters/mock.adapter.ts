import { SpeechToTextProvider, TranscriptionResult, TranscriptionOptions } from '../types';

const BENCHMARK_MAP: Record<string, { transcript: string; language: string; confidence: number }> = {
  milk_pause: {
    transcript: 'Bhaiya kal subah doodh mat dena, hum 3 din ke liye gaon ja rahe hain',
    language: 'hi-IN',
    confidence: 0.96,
  },
  milk_extra: {
    transcript: 'Bhaiya kal subah 500ml extra doodh de dena',
    language: 'hi-IN',
    confidence: 0.98,
  },
  kirana_order: {
    transcript: 'Do packet Maggi, ek kilo chawal aur aadha kilo chini bhej dena',
    language: 'hi-IN',
    confidence: 0.94,
  },
  veg_order: {
    transcript: 'Ek kilo aloo, aadha kilo tamatar aur do gaddi dhaniya bhej dena',
    language: 'hi-IN',
    confidence: 0.95,
  },
  clinic_booking: {
    transcript: 'Doctor ke paas kal morning 10 baje ka appointment book kar do',
    language: 'hi-IN',
    confidence: 0.97,
  },
  agri_procurement: {
    transcript: 'Mere paas 50 quintal tamatar hai. Friday ko pickup ke liye request register kar do',
    language: 'hi-IN',
    confidence: 0.95,
  },
};

export class MockSpeechAdapter implements SpeechToTextProvider {
  public readonly id = 'mock';
  public readonly name = 'Deterministic Benchmark STT Evaluator';

  public isConfigured(): boolean {
    return true; // Always available for local tests and deterministic evaluation
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    const hint = options?.benchmarkHintKey || 'milk_pause';
    const match = BENCHMARK_MAP[hint] || BENCHMARK_MAP.milk_pause;

    return {
      transcript: match.transcript,
      language: match.language,
      confidence: match.confidence,
      provider: 'mock-evaluator',
      latencyMs: 12,
      isMock: true,
    };
  }
}

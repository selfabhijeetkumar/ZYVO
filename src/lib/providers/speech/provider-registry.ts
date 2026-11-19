import { SpeechToTextProvider } from './types';
import { SarvamSpeechAdapter } from './adapters/sarvam.adapter';
import { GeminiSpeechAdapter } from './adapters/gemini.adapter';
import { GroqSpeechAdapter } from './adapters/groq.adapter';
import { MockSpeechAdapter } from './adapters/mock.adapter';

class SpeechProviderRegistry {
  private providers = new Map<string, SpeechToTextProvider>();

  constructor() {
    this.register(new SarvamSpeechAdapter());
    this.register(new GeminiSpeechAdapter());
    this.register(new GroqSpeechAdapter());
    this.register(new MockSpeechAdapter());
  }

  public register(provider: SpeechToTextProvider): void {
    this.providers.set(provider.id, provider);
  }

  public get(id: string): SpeechToTextProvider | undefined {
    return this.providers.get(id);
  }

  public getAll(): SpeechToTextProvider[] {
    return Array.from(this.providers.values());
  }
}

export const speechRegistry = new SpeechProviderRegistry();

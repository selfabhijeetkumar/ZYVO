import { IntentExtractorProvider } from './types';
import { GeminiIntentAdapter } from './adapters/gemini.adapter';
import { GroqIntentAdapter } from './adapters/groq.adapter';
import { DeterministicIntentAdapter } from './adapters/deterministic.adapter';

class IntentProviderRegistry {
  private providers = new Map<string, IntentExtractorProvider>();

  constructor() {
    this.register(new GeminiIntentAdapter());
    this.register(new GroqIntentAdapter());
    this.register(new DeterministicIntentAdapter());
  }

  public register(provider: IntentExtractorProvider): void {
    this.providers.set(provider.id, provider);
  }

  public get(id: string): IntentExtractorProvider | undefined {
    return this.providers.get(id);
  }

  public getAll(): IntentExtractorProvider[] {
    return Array.from(this.providers.values());
  }
}

export const intentRegistry = new IntentProviderRegistry();

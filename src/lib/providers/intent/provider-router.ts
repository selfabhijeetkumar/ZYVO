import { intentRegistry } from './provider-registry';
import { IntentExtractionResult, IntentContext } from './types';

export class IntentProviderRouter {
  public async extract(
    transcript: string,
    context: IntentContext
  ): Promise<IntentExtractionResult> {
    const primaryId = process.env.INTENT_PRIMARY_PROVIDER || 'gemini';
    const fallbackId = process.env.INTENT_FALLBACK_PROVIDER || 'deterministic';
    const candidates = [primaryId, fallbackId];

    for (const id of candidates) {
      const provider = intentRegistry.get(id);
      if (!provider) continue;

      if (!provider.isConfigured()) {
        continue;
      }

      try {
        return await provider.extract(transcript, context);
      } catch (err) {
        // Fallback to next candidate
      }
    }

    // Default guaranteed deterministic fallback
    const deterministic = intentRegistry.get('deterministic');
    if (deterministic) {
      return deterministic.extract(transcript, context);
    }

    throw new Error('No intent extractor providers are available.');
  }
}

export const intentRouter = new IntentProviderRouter();

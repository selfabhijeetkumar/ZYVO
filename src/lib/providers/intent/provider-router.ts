import { intentRegistry } from './provider-registry';
import { IntentExtractionResult, IntentContext } from './types';

export interface IntentProviderHealth {
  providerId: string;
  name: string;
  isConfigured: boolean;
  status: 'healthy' | 'degraded' | 'unconfigured' | 'privacy_guarded';
  lastError?: string;
}

export class IntentProviderRouter {
  private lastActiveProvider: string = 'deterministic';
  private lastError?: string;
  private fallbackCount: number = 0;

  public getHealth(): IntentProviderHealth[] {
    const providers = intentRegistry.getAll();
    return providers.map((p) => {
      const isConfigured = p.isConfigured();
      let status: IntentProviderHealth['status'] = 'unconfigured';
      if (p.id === 'deterministic') {
        status = 'healthy';
      } else if (isConfigured) {
        status = 'healthy';
      }

      return {
        providerId: p.id,
        name: p.name,
        isConfigured,
        status,
        lastError: p.id === 'gemini' ? this.lastError : undefined,
      };
    });
  }

  public getLastActiveProvider(): string {
    return this.lastActiveProvider;
  }

  public getFallbackCount(): number {
    return this.fallbackCount;
  }

  public async extract(
    transcript: string,
    context: IntentContext
  ): Promise<IntentExtractionResult> {
    // 1. Strict Privacy Filter: Clinic appointments bypass external LLMs entirely
    if (context.verticalType === 'clinic') {
      const deterministic = intentRegistry.get('deterministic');
      if (deterministic) {
        this.lastActiveProvider = 'deterministic (privacy_shield)';
        return deterministic.extract(transcript, context);
      }
    }

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
        const result = await provider.extract(transcript, context);
        this.lastActiveProvider = id;
        this.lastError = undefined;
        return result;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        this.lastError = errMsg.slice(0, 150);
        this.fallbackCount += 1;
        // Continue to fallback
      }
    }

    // Default guaranteed deterministic fallback
    const deterministic = intentRegistry.get('deterministic');
    if (deterministic) {
      this.lastActiveProvider = 'deterministic';
      return deterministic.extract(transcript, context);
    }

    throw new Error('No intent extractor providers are available.');
  }
}

export const intentRouter = new IntentProviderRouter();

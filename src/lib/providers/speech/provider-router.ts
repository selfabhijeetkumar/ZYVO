import { speechRegistry } from './provider-registry';
import { TranscriptionResult, TranscriptionOptions, ProviderHealth } from './types';

interface CircuitState {
  failureCount: number;
  lastFailureTime?: number;
  isOpen: boolean;
}

export class SpeechProviderRouter {
  private circuitStates = new Map<string, CircuitState>();
  private readonly failureThreshold = 3;
  private readonly cooldownMs = 60000; // 1 minute

  private getCircuit(providerId: string): CircuitState {
    let state = this.circuitStates.get(providerId);
    if (!state) {
      state = { failureCount: 0, isOpen: false };
      this.circuitStates.set(providerId, state);
    }
    return state;
  }

  public recordSuccess(providerId: string): void {
    const circuit = this.getCircuit(providerId);
    circuit.failureCount = 0;
    circuit.isOpen = false;
  }

  public recordFailure(providerId: string): void {
    const circuit = this.getCircuit(providerId);
    circuit.failureCount += 1;
    circuit.lastFailureTime = Date.now();
    if (circuit.failureCount >= this.failureThreshold) {
      circuit.isOpen = true;
    }
  }

  public isCircuitOpen(providerId: string): boolean {
    const circuit = this.getCircuit(providerId);
    if (!circuit.isOpen) return false;
    if (circuit.lastFailureTime && Date.now() - circuit.lastFailureTime > this.cooldownMs) {
      // Cooldown expired, half-open
      circuit.isOpen = false;
      circuit.failureCount = 0;
      return false;
    }
    return true;
  }

  public getHealth(): ProviderHealth[] {
    const providers = speechRegistry.getAll();
    return providers.map((p) => {
      const circuit = this.getCircuit(p.id);
      const isConfigured = p.isConfigured();
      let status: ProviderHealth['status'] = 'unconfigured';

      if (p.id === 'mock') {
        status = 'mock_mode';
      } else if (isConfigured) {
        status = circuit.isOpen ? 'degraded' : 'healthy';
      }

      return {
        providerId: p.id,
        name: p.name,
        isConfigured,
        status,
        circuitOpen: circuit.isOpen,
        failureCount: circuit.failureCount,
      };
    });
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    const primaryId = process.env.STT_PRIMARY_PROVIDER || 'sarvam';
    const fallbackIds = (process.env.STT_FALLBACK_PROVIDERS || 'groq,mock').split(',').map((s) => s.trim());
    const candidates = [primaryId, ...fallbackIds];

    for (const candidateId of candidates) {
      const provider = speechRegistry.get(candidateId);
      if (!provider) continue;

      if (!provider.isConfigured()) {
        continue;
      }

      if (this.isCircuitOpen(candidateId)) {
        continue;
      }

      try {
        const result = await provider.transcribe(audioBuffer, mimeType, options);
        this.recordSuccess(candidateId);
        return result;
      } catch (err: any) {
        this.recordFailure(candidateId);
        // Continue to fallback
      }
    }

    // Always fallback to mock evaluator if external calls are disabled
    const mock = speechRegistry.get('mock');
    if (mock) {
      return mock.transcribe(audioBuffer, mimeType, options);
    }

    throw new Error('No speech-to-text providers are available.');
  }
}

export const speechRouter = new SpeechProviderRouter();

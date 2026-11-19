import { IntentExtractorProvider, IntentExtractionResult, IntentContext } from '../types';

export class GeminiIntentAdapter implements IntentExtractorProvider {
  public readonly id = 'gemini';
  public readonly name = 'Gemini 3.5 Flash-Lite Structured Output';

  public isConfigured(): boolean {
    const isEnabled = process.env.EXTERNAL_API_ENABLED === 'true';
    const hasKey = Boolean(process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here');
    return isEnabled && hasKey;
  }

  public async extract(
    transcript: string,
    context: IntentContext
  ): Promise<IntentExtractionResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini Intent Extractor disabled (EXTERNAL_API_ENABLED=false).');
    }

    // Future placeholder:
    // Call Gemini API with JSON Schema (responseSchema) enforcing intent & slot parameters.
    throw new Error('Gemini Intent Extractor live client not engaged in this phase.');
  }
}

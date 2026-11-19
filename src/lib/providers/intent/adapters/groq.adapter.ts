import { IntentExtractorProvider, IntentExtractionResult, IntentContext } from '../types';

export class GroqIntentAdapter implements IntentExtractorProvider {
  public readonly id = 'groq';
  public readonly name = 'Groq Hosted LLM Structured Extractor';

  public isConfigured(): boolean {
    const isEnabled = process.env.EXTERNAL_API_ENABLED === 'true';
    const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
    return isEnabled && hasKey;
  }

  public async extract(
    transcript: string,
    context: IntentContext
  ): Promise<IntentExtractionResult> {
    if (!this.isConfigured()) {
      throw new Error('Groq Intent Extractor disabled (EXTERNAL_API_ENABLED=false).');
    }

    // Future placeholder:
    // Call Groq chat completions with response_format: { type: 'json_object' }
    throw new Error('Groq Intent Extractor live client not engaged in this phase.');
  }
}

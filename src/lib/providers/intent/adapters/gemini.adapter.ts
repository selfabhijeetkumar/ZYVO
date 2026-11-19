import { IntentExtractorProvider, IntentExtractionResult, IntentContext } from '../types';

export class GeminiIntentAdapter implements IntentExtractorProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini Structured Intent Extractor';

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

  public async extract(
    transcript: string,
    context: IntentContext
  ): Promise<IntentExtractionResult> {
    // 1. Strict Privacy Filter: Clinic appointments must NEVER transmit patient data to external LLMs
    if (context.verticalType === 'clinic') {
      throw new Error(
        'Clinic outpatient appointments are strictly guarded under the Non-Diagnostic Privacy Filter. External LLM transmission prohibited.'
      );
    }

    const apiKey = this.getApiKey();
    if (!this.isConfigured() || !apiKey) {
      throw new Error('Gemini Intent Extractor disabled (EXTERNAL_API_ENABLED=false or missing GOOGLE_AI_API_KEY).');
    }

    const startTime = Date.now();
    const model = process.env.GEMINI_INTENT_MODEL || 'gemini-3.5-flash-lite';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const baseDate = context.referenceNow ? new Date(context.referenceNow) : new Date();
    const todayStr = baseDate.toISOString().split('T')[0];

    const systemPrompt = `You are ZYVO's structured AI intent extraction engine for Indian multilingual voice commerce.
Current vertical: ${context.verticalType}
Reference Today's Date: ${todayStr}

Analyze the user's transcript (which may be in Hindi, Hinglish, or English) and extract structured domain slots.

VERTICAL REQUIREMENTS:
- milk_delivery:
  * Intents: "PAUSE_DELIVERY", "ADD_EXTRA_DELIVERY", "RESUME_DELIVERY", "CHANGE_QUANTITY", "UNKNOWN_MILK_REQUEST"
  * For PAUSE_DELIVERY: fields must include { action: "PAUSE_DELIVERY", startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD", days: number, reason: string }
  * For ADD_EXTRA_DELIVERY: fields must include { action: "ADD_EXTRA_DELIVERY", targetDate: "YYYY-MM-DD", extraMl: number (e.g. 500, 1000), isTemporary: true }
  * For RESUME_DELIVERY: fields must include { action: "RESUME_DELIVERY", startDate: "YYYY-MM-DD", reason: string }
  * For CHANGE_QUANTITY: fields must include { action: "CHANGE_QUANTITY", quantityMl: number (e.g. 500, 1000, 1500, 2000), isPermanent: true }

- kirana:
  * Intents: "CREATE_GROCERY_ORDER", "UNKNOWN_KIRANA_ORDER"
  * fields: { items: Array<{ requestedItemName: string, quantity: number, unit: string }>, deliveryAddress: string }
  * Common units: "packet", "kg", "litre", "grams"

- vegetable_vendor:
  * Intents: "CREATE_PRODUCE_ORDER", "UNKNOWN_PRODUCE_ORDER"
  * fields: { items: Array<{ requestedItemName: string, quantity: number, unit: string }> }
  * Common units: "kg", "grams", "bundles"

- agriculture:
  * Intents: "CREATE_PROCUREMENT_REQUEST"
  * fields: { action: "CREATE_PROCUREMENT_REQUEST", cropName: string, variety: string, estimatedVolumeQuintals: number, pickupDate: "YYYY-MM-DD", pickupLocation: string }

OUTPUT FORMAT:
Respond with ONLY valid JSON strictly conforming to this schema:
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "needsClarification": false,
  "clarificationPrompt": null,
  "summary": "Short user-facing summary of the requested action",
  "parsedFields": { ...domain-specific slot parameters }
}
If the speech is ambiguous, incomplete, or missing essential quantities/dates, set "needsClarification": true and provide a polite Hindi/Hinglish question in "clarificationPrompt".`;

    const userPrompt = `User Voice Transcript: "${transcript}"`;

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
                { text: systemPrompt },
                { text: userPrompt },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
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
        throw new Error(`Gemini Intent API Error (HTTP ${response.status}): ${errMessage}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!rawText) {
        throw new Error('Gemini Intent Extractor returned empty content');
      }

      const parsed = JSON.parse(rawText);

      // Validate core required fields
      if (!parsed.intent || typeof parsed.parsedFields !== 'object') {
        throw new Error('Gemini Intent Extractor response missing required schema fields');
      }

      // Guarantee customerId and workspaceId context are present in parsedFields
      const fields = {
        ...parsed.parsedFields,
        workspaceId: context.workspaceId,
        customerId: context.customerId,
      };

      return {
        intent: String(parsed.intent),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.94,
        needsClarification: Boolean(parsed.needsClarification),
        clarificationPrompt: parsed.clarificationPrompt || undefined,
        parsedFields: fields,
        summary: String(parsed.summary || `Action proposal for ${parsed.intent}`),
        provider: 'gemini',
        isDeterministicFallback: false,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Gemini Intent Extractor call timed out after 12000ms.');
      }
      throw err;
    }
  }
}

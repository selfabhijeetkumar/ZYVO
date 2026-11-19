import { VerticalType } from '../../vertical-registry';

export interface IntentExtractionResult {
  intent: string;
  confidence: number;
  needsClarification: boolean;
  clarificationPrompt?: string;
  parsedFields: Record<string, any>;
  summary: string;
  provider: string;
  isDeterministicFallback: boolean;
}

export interface IntentContext {
  workspaceId: string;
  customerId: string;
  verticalType: VerticalType;
  referenceNow?: string; // ISO timestamp
}

export interface IntentExtractorProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  extract(
    transcript: string,
    context: IntentContext
  ): Promise<IntentExtractionResult>;
}

import { VerticalType } from '../vertical-registry';
import { intentRouter } from '../providers/intent/provider-router';
import { ExtractedProposal } from './types';

export async function extractSlotsFromTranscript(
  transcript: string,
  vertical: VerticalType,
  context: { workspaceId: string; customerId: string; referenceNow?: string }
): Promise<ExtractedProposal> {
  const result = await intentRouter.extract(transcript, {
    workspaceId: context.workspaceId,
    customerId: context.customerId,
    verticalType: vertical,
    referenceNow: context.referenceNow,
  });

  return {
    intent: result.intent,
    confidence: result.confidence,
    needsClarification: result.needsClarification,
    clarificationPrompt: result.clarificationPrompt,
    parsedFields: result.parsedFields,
    summary: result.summary,
  };
}

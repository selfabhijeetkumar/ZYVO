import type { DatabaseSync } from 'node:sqlite';

export type VerticalType = 'milk_delivery' | 'kirana' | 'vegetable_vendor' | 'clinic' | 'agriculture';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warning?: string;
}

export interface TransactionResult {
  success: boolean;
  entityId?: string;
  summary: string;
  details?: Record<string, any>;
}

export interface VerticalHandler {
  validateProposal(payload: any): ValidationResult;
  applyTransaction(db: DatabaseSync, submissionId: string, payload: any, actorId: string): Promise<TransactionResult>;
}

export interface SampleTranscript {
  language: string;
  text: string;
  intent: string;
  expectedAction: string;
}

export interface VerticalModuleDefinition extends VerticalHandler {
  id: VerticalType;
  displayName: string;
  shortDescription: string;
  routePath: string;
  iconName: string;
  status: 'active_reference' | 'foundation_ready';
  statusBadgeLabel: string;
  description: string;
  supportedIntents: string[];
  sampleTranscripts: SampleTranscript[];
}

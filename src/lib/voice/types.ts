export type SubmissionStatus =
  | 'RECEIVED'
  | 'TRANSCRIBED'
  | 'PROPOSAL_CREATED'
  | 'NEEDS_CLARIFICATION'
  | 'AWAITING_CONFIRMATION'
  | 'APPLIED'
  | 'REJECTED'
  | 'FAILED';

export interface VoiceSubmission {
  id: string;
  workspace_id: string;
  user_id: string;
  vertical_type: string;
  recorded_at: string;
  received_at: string;
  audio_file_path: string;
  audio_mime_type: string;
  transcript_raw: string | null;
  detected_language: string | null;
  status: SubmissionStatus;
  status_reason: string | null;
  proposal_json: string | null;
  needs_clarification: number; // 0 or 1
  clarification_prompt: string | null;
  confidence_score: number | null;
  processed_at: string | null;
  applied_at: string | null;
}

export interface ExtractedProposal {
  intent: string;
  confidence: number;
  needsClarification: boolean;
  clarificationPrompt?: string;
  parsedFields: Record<string, any>;
  summary: string;
}

export interface STTResult {
  transcript: string;
  languageCode: string;
  confidence: number;
}

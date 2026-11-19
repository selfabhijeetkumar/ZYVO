'use client';

import React, { useState } from 'react';
import { Mic, CheckCircle2, AlertTriangle, XCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';

interface PresetSample {
  language: string;
  text: string;
  intent: string;
}

interface VoiceActionCardProps {
  verticalType: string;
  workspaceId: string;
  samples: PresetSample[];
  onTransactionApplied?: () => void;
}

export function VoiceActionCard({
  verticalType,
  workspaceId,
  samples,
  onTransactionApplied,
}: VoiceActionCardProps) {
  const [selectedTranscript, setSelectedTranscript] = useState<string>(samples[0]?.text || '');
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any | null>(null);
  const [proposal, setProposal] = useState<any | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [appliedResult, setAppliedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleProcessVoice() {
    if (!selectedTranscript.trim()) return;
    setSubmitting(true);
    setError(null);
    setSubmission(null);
    setProposal(null);
    setAppliedResult(null);

    try {
      const res = await fetch('/api/voice-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalType,
          workspaceId,
          manualTranscript: selectedTranscript,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit voice recording');
      }

      setSubmission(data.submission);
      setProposal(data.proposal);
    } catch (err: any) {
      setError(err.message || 'Error executing voice pipeline');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmProposal() {
    if (!submission?.id) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/proposals/${submission.id}/confirm`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm transaction');
      }

      setAppliedResult(data.result);
      setSubmission((prev: any) => ({ ...prev, status: 'APPLIED' }));
      if (onTransactionApplied) {
        onTransactionApplied();
      }
    } catch (err: any) {
      setError(err.message || 'Error confirming transaction');
    } finally {
      setConfirming(false);
    }
  }

  async function handleRejectProposal() {
    if (!submission?.id) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/proposals/${submission.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User cancelled proposal via UI' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject proposal');
      }

      setSubmission((prev: any) => ({ ...prev, status: 'REJECTED' }));
    } catch (err: any) {
      setError(err.message || 'Error rejecting proposal');
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Mic className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F1EADE]">Voice Pipeline Simulator</h3>
        </div>
        <span className="text-xs text-[#8B9CB5] font-mono">End-to-End Workflow</span>
      </div>

      {/* Preset Transcript Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#8B9CB5]">Select Benchmark Voice Input or Type Custom:</label>
        <div className="flex flex-wrap gap-2">
          {samples.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedTranscript(s.text)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition text-left ${
                selectedTranscript === s.text
                  ? 'bg-[#242528] border-emerald-500/40 text-[#F1EADE]'
                  : 'bg-[#151415] border-[#2A2C30] text-[#8B9CB5] hover:text-[#F1EADE]'
              }`}
            >
              <span className="font-semibold text-emerald-400 mr-1.5">[{s.language}]</span>
              <span className="truncate max-w-[280px] inline-block align-bottom">{s.text}</span>
            </button>
          ))}
        </div>

        <textarea
          value={selectedTranscript}
          onChange={(e) => setSelectedTranscript(e.target.value)}
          rows={2}
          className="w-full mt-2 bg-[#151415] border border-[#2A2C30] rounded-lg p-3 text-xs text-[#F1EADE] placeholder-[#8B9CB5]/50 focus:outline-none focus:border-[#45474E]"
          placeholder="Enter voice transcript in Hindi, Hinglish, or English..."
        />
      </div>

      {/* Run Pipeline Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleProcessVoice}
          disabled={submitting || !selectedTranscript.trim()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Transcribing & Extracting...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Submit Voice Note</span>
            </>
          )}
        </button>

        {submission && (
          <span className="text-[11px] font-mono text-[#8B9CB5]">
            ID: {submission.id.slice(0, 16)}...
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lifecycle Status & Structured Proposal Output */}
      {submission && proposal && (
        <div className="pt-4 border-t border-[#2A2C30] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8B9CB5]">Pipeline State:</span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-medium ${
                  submission.status === 'APPLIED'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                    : submission.status === 'NEEDS_CLARIFICATION'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                    : submission.status === 'REJECTED'
                    ? 'bg-red-950/60 text-red-300 border border-red-800'
                    : 'bg-[#242528] text-[#F1EADE] border border-[#2A2C30]'
                }`}
              >
                {submission.status}
              </span>
            </div>

            <span className="text-xs text-[#8B9CB5]">
              Confidence: {Math.round(proposal.confidence * 100)}%
            </span>
          </div>

          {/* Proposal Summary Box */}
          <div className="bg-[#151415] border border-[#2A2C30] rounded-lg p-3 space-y-2">
            <div className="text-xs font-semibold text-[#F1EADE] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extracted Transaction Proposal:</span>
            </div>
            <p className="text-xs text-[#F1EADE]/90 leading-relaxed font-mono">
              {proposal.summary}
            </p>

            {/* Field breakdown */}
            <div className="pt-2 text-[11px] text-[#8B9CB5] space-y-1 font-mono border-t border-[#2A2C30]/60">
              <div>Intent: <span className="text-emerald-400 font-semibold">{proposal.intent}</span></div>
              {proposal.parsedFields && (
                <div>
                  Parameters:{' '}
                  <span className="text-[#F1EADE]">
                    {JSON.stringify(proposal.parsedFields, null, 1).replace(/[\{\}\"]/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clarification prompt if ambiguous */}
          {submission.needs_clarification === 1 && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Clarification Prompt Required:</span>
                <p className="mt-0.5 text-amber-200">{submission.clarification_prompt}</p>
              </div>
            </div>
          )}

          {/* Confirmation Controls */}
          {submission.status === 'AWAITING_CONFIRMATION' && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmProposal}
                disabled={confirming}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Apply Transaction</span>
              </button>
              <button
                onClick={handleRejectProposal}
                disabled={confirming}
                className="px-4 py-2 bg-[#242528] hover:bg-[#2A2C30] text-[#8B9CB5] hover:text-[#F1EADE] rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          )}

          {/* Applied Success Box */}
          {appliedResult && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transaction Committed Successfully</span>
              </div>
              <p className="text-emerald-200 font-mono text-[11px]">{appliedResult.summary}</p>
              <div className="text-[10px] text-emerald-400/80 font-mono">
                Entity ID: {appliedResult.entityId} · Audit event logged
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  Volume2,
  ShieldCheck,
  Info,
} from 'lucide-react';

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
  const [activeMode, setActiveMode] = useState<'live_mic' | 'benchmark_manual' | 'file_upload'>('benchmark_manual');
  const [selectedTranscript, setSelectedTranscript] = useState<string>(samples[0]?.text || '');

  // Live Microphone State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Pipeline Execution State
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any | null>(null);
  const [proposal, setProposal] = useState<any | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [appliedResult, setAppliedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // 1. Microphone Start Recording
  async function startRecording() {
    setError(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording is not supported on this browser or requires an HTTPS secure context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks in stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200); // Collect 200ms slices
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError(err.message || 'Could not access microphone. Ensure microphone permission is granted in your browser.');
    }
  }

  // 2. Microphone Stop Recording
  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  // 3. Handle File Upload
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setUploadedFile(file);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));
  }

  // 4. Submit Audio or Manual Transcript
  async function handleSubmitPipeline() {
    setSubmitting(true);
    setError(null);
    setSubmission(null);
    setProposal(null);
    setAppliedResult(null);

    try {
      let res: Response;

      if (activeMode === 'live_mic' && audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'microphone_recording.webm');
        formData.append('verticalType', verticalType);
        formData.append('workspaceId', workspaceId);
        // Link with selected transcript for deterministic extraction
        formData.append('manualTranscript', selectedTranscript);

        res = await fetch('/api/voice-submissions', {
          method: 'POST',
          body: formData,
        });
      } else if (activeMode === 'file_upload' && uploadedFile) {
        const formData = new FormData();
        formData.append('audio', uploadedFile, uploadedFile.name);
        formData.append('verticalType', verticalType);
        formData.append('workspaceId', workspaceId);
        formData.append('manualTranscript', selectedTranscript);

        res = await fetch('/api/voice-submissions', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Benchmark / Manual Transcript mode
        if (!selectedTranscript.trim()) {
          throw new Error('Please enter or select a voice transcript before processing.');
        }

        res = await fetch('/api/voice-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verticalType,
            workspaceId,
            manualTranscript: selectedTranscript,
          }),
        });
      }

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

  // 5. Confirm Proposal
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

  // 6. Reject Proposal
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
    <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
      {/* Header with Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F1EADE]">Voice Pipeline & Simulator</h3>
            <p className="text-[11px] text-[#8B9CB5]">Multilingual voice ingestion with deterministic intent extraction</p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center bg-[#151415] p-1 rounded-lg border border-[#2A2C30] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('live_mic')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition min-h-[36px] flex items-center gap-1.5 ${
              activeMode === 'live_mic'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Live Mic</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('benchmark_manual')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition min-h-[36px] flex items-center gap-1.5 ${
              activeMode === 'benchmark_manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transcript / Preset</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('file_upload')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition min-h-[36px] flex items-center gap-1.5 ${
              activeMode === 'file_upload'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Audio Upload</span>
          </button>
        </div>
      </div>

      {/* Honest Mode Banner */}
      <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg flex items-center gap-2 text-xs text-[#8B9CB5]">
        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-[#F1EADE]">Operational Mode:</strong>{' '}
          {activeMode === 'live_mic'
            ? 'Live microphone recording enabled · Audio stored to storage/audio/ · Offline deterministic extractor'
            : activeMode === 'file_upload'
            ? 'Audio file upload (max 10MB) · Offline deterministic extractor'
            : 'Manual transcript & benchmark presets · Local deterministic regex parser'}
        </span>
      </div>

      {/* MODE 1: LIVE MICROPHONE */}
      {activeMode === 'live_mic' && (
        <div className="p-4 bg-[#151415] border border-[#2A2C30] rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition min-h-[44px] shadow-lg shadow-rose-950/40"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition min-h-[44px] animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Recording ({recordingSeconds}s)</span>
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Recording live voice...</span>
                </div>
              )}
            </div>

            {audioBlob && !isRecording && (
              <span className="text-xs text-emerald-400 font-mono">
                Recorded: {(audioBlob.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          {audioUrl && (
            <div className="space-y-2 pt-2 border-t border-[#2A2C30]">
              <label className="text-[11px] text-[#8B9CB5] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Playback Preview:</span>
              </label>
              <audio controls src={audioUrl} className="w-full h-10 rounded-lg bg-[#1B1C1E]" />
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-[#2A2C30]">
            <label className="text-[11px] text-[#8B9CB5]">
              Associated Transcript for Structured Extraction:
            </label>
            <input
              type="text"
              value={selectedTranscript}
              onChange={(e) => setSelectedTranscript(e.target.value)}
              className="w-full bg-[#1B1C1E] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-[#F1EADE] focus:outline-none focus:border-emerald-500"
              placeholder="Verify or edit the transcript of your voice recording..."
            />
          </div>
        </div>
      )}

      {/* MODE 2: FILE UPLOAD */}
      {activeMode === 'file_upload' && (
        <div className="p-4 bg-[#151415] border border-[#2A2C30] rounded-xl space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-[#8B9CB5] block">Select audio file (.webm, .wav, .mp4, .ogg up to 10MB):</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full text-xs text-[#8B9CB5] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#242528] file:text-[#F1EADE] hover:file:bg-[#2A2C30] cursor-pointer"
            />
          </div>

          {audioUrl && (
            <div className="space-y-2 pt-2 border-t border-[#2A2C30]">
              <label className="text-[11px] text-[#8B9CB5] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Playback Preview:</span>
              </label>
              <audio controls src={audioUrl} className="w-full h-10 rounded-lg bg-[#1B1C1E]" />
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-[#2A2C30]">
            <label className="text-[11px] text-[#8B9CB5]">
              Associated Transcript for Structured Extraction:
            </label>
            <input
              type="text"
              value={selectedTranscript}
              onChange={(e) => setSelectedTranscript(e.target.value)}
              className="w-full bg-[#1B1C1E] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-[#F1EADE] focus:outline-none focus:border-emerald-500"
              placeholder="Verify or edit the transcript of your uploaded file..."
            />
          </div>
        </div>
      )}

      {/* MODE 3: BENCHMARK PRESETS & MANUAL TRANSCRIPT */}
      {activeMode === 'benchmark_manual' && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-[#8B9CB5]">
            Select Benchmark Voice Input or Type Custom Transcript:
          </label>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedTranscript(s.text)}
                className={`text-xs px-3 py-2 rounded-lg border transition text-left min-h-[44px] ${
                  selectedTranscript === s.text
                    ? 'bg-[#242528] border-emerald-500/40 text-[#F1EADE]'
                    : 'bg-[#151415] border-[#2A2C30] text-[#8B9CB5] hover:text-[#F1EADE]'
                }`}
              >
                <span className="font-semibold text-emerald-400 mr-1.5">[{s.language}]</span>
                <span className="truncate max-w-[260px] inline-block align-bottom">{s.text}</span>
              </button>
            ))}
          </div>

          <textarea
            value={selectedTranscript}
            onChange={(e) => setSelectedTranscript(e.target.value)}
            rows={2}
            className="w-full bg-[#151415] border border-[#2A2C30] rounded-lg p-3 text-xs text-[#F1EADE] placeholder-[#8B9CB5]/50 focus:outline-none focus:border-emerald-500"
            placeholder="Enter voice transcript in Hindi, Hinglish, or English..."
          />
        </div>
      )}

      {/* Process Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleSubmitPipeline}
          disabled={submitting || (activeMode === 'live_mic' && isRecording)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 min-h-[44px] shadow-lg shadow-emerald-950/40"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Extracting & Validating Proposal...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Process Voice Submission</span>
            </>
          )}
        </button>

        {submission && (
          <span className="text-[11px] font-mono text-[#8B9CB5] truncate max-w-[200px]">
            Submission: {submission.id.slice(0, 18)}...
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
        <div className="pt-4 border-t border-[#2A2C30] space-y-4 animate-fade-in">
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

            <span className="text-xs text-[#8B9CB5] font-mono">
              Confidence: {Math.round(proposal.confidence * 100)}%
            </span>
          </div>

          {/* Proposal Summary Box */}
          <div className="bg-[#151415] border border-[#2A2C30] rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-[#F1EADE] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Extracted Transaction Proposal:</span>
            </div>
            <p className="text-xs text-[#F1EADE]/90 leading-relaxed font-mono bg-[#1B1C1E] p-3 rounded-lg border border-[#2A2C30]">
              {proposal.summary}
            </p>

            {/* Field breakdown */}
            <div className="text-[11px] text-[#8B9CB5] space-y-1 font-mono pt-1">
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
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleConfirmProposal}
                disabled={confirming}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 min-h-[44px] shadow-lg shadow-emerald-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Apply Transaction</span>
              </button>
              <button
                onClick={handleRejectProposal}
                disabled={confirming}
                className="px-4 py-2.5 bg-[#242528] hover:bg-[#2A2C30] text-[#8B9CB5] hover:text-[#F1EADE] rounded-xl text-xs font-semibold transition flex items-center gap-2 min-h-[44px]"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          )}

          {/* Applied Success Box */}
          {appliedResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 space-y-1.5">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transaction Committed Successfully to Database</span>
              </div>
              <p className="text-emerald-200 font-mono text-xs">{appliedResult.summary}</p>
              <div className="text-[10px] text-emerald-400/80 font-mono pt-1">
                Entity ID: {appliedResult.entityId} · Audit trail logged
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

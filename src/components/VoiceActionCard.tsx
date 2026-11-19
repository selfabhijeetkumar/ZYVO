'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileText,
  Volume2,
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

  // Web Audio Analyser for Real Microphone Waveform
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveAnimFrameRef = useRef<number | null>(null);

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
      if (waveAnimFrameRef.current) cancelAnimationFrame(waveAnimFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [audioUrl]);

  // Real Audio Waveform Visualization Loop
  const drawRealWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      waveAnimFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#101211';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#69D9AD';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  // 1. Microphone Start Recording with Real Web Audio Graph
  async function startRecording() {
    setError(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording is not supported in this browser or requires an HTTPS secure context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Real Audio Context + Analyser Graph
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        setTimeout(() => {
          drawRealWaveform();
        }, 50);
      } catch (audioErr) {
        console.warn('Real Web Audio analyser unavailable, fallback indicator active:', audioErr);
      }

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

        if (waveAnimFrameRef.current) {
          cancelAnimationFrame(waveAnimFrameRef.current);
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
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
        if (!selectedTranscript.trim()) {
          throw new Error('Please select a benchmark preset or enter a voice transcript before processing.');
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
        body: JSON.stringify({ reason: 'Operator rejected proposal via UI' }),
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
    <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header with Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2C3530]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-[#202622] border border-[#69D9AD] flex items-center justify-center text-[#69D9AD]">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F2EFE6]">Voice Dispatch Pipeline</h3>
            <p className="text-[11px] text-[#A4B0A6]">
              Multilingual voice ingestion with deterministic intent extraction
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center bg-[#101211] p-1 rounded-xs border border-[#46534A] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('live_mic')}
            className={`min-h-[44px] px-3 py-1.5 rounded-xs text-xs font-medium transition flex items-center gap-1.5 ${
              activeMode === 'live_mic'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#69D9AD]" />
            <span>Live Mic</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('benchmark_manual')}
            className={`min-h-[44px] px-3 py-1.5 rounded-xs text-xs font-medium transition flex items-center gap-1.5 ${
              activeMode === 'benchmark_manual'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#DAB77A]" />
            <span>Preset / Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('file_upload')}
            className={`min-h-[44px] px-3 py-1.5 rounded-xs text-xs font-medium transition flex items-center gap-1.5 ${
              activeMode === 'file_upload'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#86D5D4]" />
            <span>Audio Upload</span>
          </button>
        </div>
      </div>

      {/* Mode Description Banner */}
      <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs flex items-center gap-2 text-xs text-[#A4B0A6]">
        <Info className="w-4 h-4 text-[#69D9AD] shrink-0" />
        <span>
          <strong className="text-[#F2EFE6]">Operational Protocol:</strong>{' '}
          {activeMode === 'live_mic'
            ? 'Live microphone recording with real Web Audio frequency analysis. Audio persisted to storage/audio/.'
            : activeMode === 'file_upload'
            ? 'Client audio file upload with 10 MB payload boundary and MIME verification.'
            : 'Deterministic benchmark presets and manual transcript simulator for zero-microphone testing.'}
        </span>
      </div>

      {/* MODE 1: LIVE MICROPHONE */}
      {activeMode === 'live_mic' && (
        <div className="p-4 bg-[#101211] border border-[#2C3530] rounded-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="min-h-[44px] px-4 py-2 rounded-xs bg-[#24765E] hover:bg-[#69D9AD] hover:text-[#101211] text-[#F2EFE6] text-xs font-semibold flex items-center gap-2 transition border border-[#69D9AD]"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="min-h-[44px] px-4 py-2 rounded-xs bg-[#DAB77A] text-[#101211] hover:bg-[#F2EFE6] text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Recording ({recordingSeconds}s)</span>
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-xs text-[#F1A79C] font-mono">
                  <span className="w-2 h-2 rounded-xs bg-[#F1A79C] animate-ping" />
                  <span>Capturing microphone stream...</span>
                </div>
              )}
            </div>

            {audioBlob && !isRecording && (
              <span className="text-xs text-[#69D9AD] font-mono tabular-nums">
                Recorded: {(audioBlob.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          {/* Real Audio Waveform Canvas (Only rendered when recording) */}
          {isRecording && (
            <div className="space-y-1">
              <div className="text-[10px] text-[#A4B0A6] font-mono uppercase">
                Real Audio Analyser Waveform:
              </div>
              <canvas
                ref={canvasRef}
                width={500}
                height={64}
                className="w-full h-16 rounded-xs bg-[#101211] border border-[#46534A]"
              />
            </div>
          )}

          {audioUrl && (
            <div className="space-y-2 pt-2 border-t border-[#2C3530]">
              <label className="text-[11px] text-[#A4B0A6] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#69D9AD]" />
                <span>Captured Audio Playback:</span>
              </label>
              <audio controls src={audioUrl} className="w-full h-10 rounded-xs bg-[#171B19]" />
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-[#2C3530]">
            <label className="text-[11px] text-[#A4B0A6]">
              Associated Transcript for Structured Extraction:
            </label>
            <input
              type="text"
              value={selectedTranscript}
              onChange={(e) => setSelectedTranscript(e.target.value)}
              className="w-full bg-[#171B19] border border-[#46534A] rounded-xs px-3 py-2 text-xs text-[#F2EFE6] focus:border-[#69D9AD]"
              placeholder="Verify or edit the transcript of your voice recording..."
            />
          </div>
        </div>
      )}

      {/* MODE 2: FILE UPLOAD */}
      {activeMode === 'file_upload' && (
        <div className="p-4 bg-[#101211] border border-[#2C3530] rounded-xs space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-[#A4B0A6] block">
              Select audio file (.webm, .wav, .mp4, .ogg up to 10MB):
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full text-xs text-[#A4B0A6] file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#202622] file:text-[#F2EFE6] hover:file:bg-[#2A322D] cursor-pointer"
            />
          </div>

          {audioUrl && (
            <div className="space-y-2 pt-2 border-t border-[#2C3530]">
              <label className="text-[11px] text-[#A4B0A6] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#69D9AD]" />
                <span>Audio Playback:</span>
              </label>
              <audio controls src={audioUrl} className="w-full h-10 rounded-xs bg-[#171B19]" />
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-[#2C3530]">
            <label className="text-[11px] text-[#A4B0A6]">
              Associated Transcript for Structured Extraction:
            </label>
            <input
              type="text"
              value={selectedTranscript}
              onChange={(e) => setSelectedTranscript(e.target.value)}
              className="w-full bg-[#171B19] border border-[#46534A] rounded-xs px-3 py-2 text-xs text-[#F2EFE6] focus:border-[#69D9AD]"
              placeholder="Verify or edit the transcript of your uploaded file..."
            />
          </div>
        </div>
      )}

      {/* MODE 3: BENCHMARK PRESETS & MANUAL TRANSCRIPT */}
      {activeMode === 'benchmark_manual' && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-[#A4B0A6]">
            Select Benchmark Voice Input or Type Custom Transcript:
          </label>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedTranscript(s.text)}
                className={`text-xs px-3 py-2 rounded-xs border transition text-left min-h-[44px] ${
                  selectedTranscript === s.text
                    ? 'bg-[#2A322D] border-[#69D9AD] text-[#F2EFE6]'
                    : 'bg-[#101211] border-[#46534A] text-[#A4B0A6] hover:text-[#F2EFE6]'
                }`}
              >
                <span className="font-semibold text-[#69D9AD] mr-1.5">[{s.language}]</span>
                <span className="truncate max-w-[260px] inline-block align-bottom">{s.text}</span>
              </button>
            ))}
          </div>

          <textarea
            value={selectedTranscript}
            onChange={(e) => setSelectedTranscript(e.target.value)}
            rows={2}
            className="w-full bg-[#101211] border border-[#46534A] rounded-xs p-3 text-xs text-[#F2EFE6] placeholder-[#A4B0A6]/60 focus:border-[#69D9AD]"
            placeholder="Enter voice transcript in Hindi, Hinglish, or English..."
          />
        </div>
      )}

      {/* Process Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleSubmitPipeline}
          disabled={submitting || (activeMode === 'live_mic' && isRecording)}
          className="min-h-[44px] px-5 py-2.5 bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] rounded-xs text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Parsing and Generating Proposal...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Process Voice Dispatch</span>
            </>
          )}
        </button>

        {submission && (
          <span className="text-[11px] font-mono text-[#A4B0A6] truncate max-w-[200px]">
            Submission: {submission.id.slice(0, 18)}...
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-[#202622] border border-[#F1A79C] rounded-xs text-xs text-[#F1A79C] flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lifecycle Status & Structured Proposal Output */}
      {submission && proposal && (
        <div className="pt-4 border-t border-[#46534A] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#A4B0A6]">Transaction State:</span>
              <span
                className={`px-2 py-0.5 rounded-xs font-mono font-medium ${
                  submission.status === 'APPLIED'
                    ? 'bg-[#202622] text-[#A4E4B5] border border-[#A4E4B5]'
                    : submission.status === 'NEEDS_CLARIFICATION'
                    ? 'bg-[#202622] text-[#DAB77A] border border-[#DAB77A]'
                    : submission.status === 'REJECTED'
                    ? 'bg-[#202622] text-[#F1A79C] border border-[#F1A79C]'
                    : 'bg-[#202622] text-[#F2EFE6] border border-[#46534A]'
                }`}
              >
                {submission.status}
              </span>
            </div>

            <span className="text-xs text-[#A4B0A6] font-mono tabular-nums">
              Confidence: {Math.round(proposal.confidence * 100)}%
            </span>
          </div>

          {/* Proposal Summary Box */}
          <div className="bg-[#101211] border border-[#46534A] rounded-xs p-4 space-y-3">
            <div className="text-xs font-semibold text-[#F2EFE6] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#69D9AD]" />
              <span>Extracted Transaction Proposal:</span>
            </div>
            <p className="text-xs text-[#F2EFE6] leading-relaxed font-mono bg-[#171B19] p-3 rounded-xs border border-[#2C3530]">
              {proposal.summary}
            </p>

            {/* Field breakdown */}
            <div className="text-[11px] text-[#A4B0A6] space-y-1 font-mono pt-1">
              <div>
                Intent: <span className="text-[#69D9AD] font-semibold">{proposal.intent}</span>
              </div>
              {proposal.parsedFields && (
                <div>
                  Parameters:{' '}
                  <span className="text-[#F2EFE6]">
                    {JSON.stringify(proposal.parsedFields, null, 1).replace(/[\{\}\"]/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clarification prompt if ambiguous */}
          {submission.needs_clarification === 1 && (
            <div className="p-3 bg-[#202622] border border-[#DAB77A] rounded-xs text-xs text-[#DAB77A] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Clarification Required:</span>
                <p className="mt-0.5 text-[#F2EFE6]">{submission.clarification_prompt}</p>
              </div>
            </div>
          )}

          {/* Confirmation Controls */}
          {submission.status === 'AWAITING_CONFIRMATION' && (
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleConfirmProposal}
                disabled={confirming}
                className="min-h-[44px] px-5 py-2.5 bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] rounded-xs text-xs font-semibold transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm and Apply Transaction</span>
              </button>
              <button
                onClick={handleRejectProposal}
                disabled={confirming}
                className="min-h-[44px] px-4 py-2.5 bg-[#202622] hover:bg-[#2A322D] text-[#A4B0A6] hover:text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs font-semibold transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          )}

          {/* Applied Success Box */}
          {appliedResult && (
            <div className="p-4 bg-[#202622] border border-[#A4E4B5] rounded-xs text-xs text-[#A4E4B5] space-y-1.5">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A4E4B5]" />
                <span>Transaction Committed Successfully to Database</span>
              </div>
              <p className="text-[#F2EFE6] font-mono text-xs">{appliedResult.summary}</p>
              <div className="text-[10px] text-[#A4B0A6] font-mono pt-1">
                Entity ID: {appliedResult.entityId} : Audit trail logged
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

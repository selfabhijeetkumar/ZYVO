# Phase 0 Research: Voice AI & Indic Language Capabilities (REWIRED ECHO)

**Status:** Complete  
**Date:** 2026-11-19  
**Team Role:** AI and Voice Technology Lead  
**Scope:** Sarvam AI API capabilities, Saaras STT (22 scheduled languages), Bulbul TTS (11 languages), API authentication, endpoints, rate limits, credit usage, runtime environment readiness, and risks.

---

## 1. What Was Inspected
1. **Sarvam AI Official Documentation & Specifications (`docs.sarvam.ai`)**:
   - Speech-to-Text API specifications (Saaras v4, Saaras v3, audio format constraints, REST and WebSocket protocols).
   - Text-to-Speech API specifications (Bulbul v4-flash, Bulbul v3, streaming endpoints, speaker persona catalogs).
   - Authentication protocols, headers, base URLs, and error responses.
   - Credit usage architecture, billing rates, and token-bucket rate limiting models.
   - Indic language coverage, BCP-47 codes, and script handling.
2. **Local Development Environment & Host System**:
   - Environment variables (`env:SARVAM*`, `env:API_KEY*`) for active secrets and credentials.
   - Python runtime (`Python 3.13.15`) and pip package ecosystem.
   - Local audio processing libraries (`PyAudio`, `sounddevice`, `SpeechRecognition`, `audioop-lts`).
   - Command-line audio manipulation tooling (`ffmpeg` on system `PATH`).
   - Node.js runtime (`v26.13.1`), npm (`11.21.0`), pnpm (`9.12.2`).
3. **Agent & MCP Ecosystem**:
   - Installed MCP server directory (`C:\Users\Abhijeet\.gemini\antigravity\mcp`).
   - Availability of official Sarvam MCP integrations (`github.com/sarvamai/sarvam-mcp`) and Python SDKs (`sarvamai`).

---

## 2. What Was Found

### 2.1 Speech-to-Text: Saaras Engine
- **Models**:
  - `saaras:v4` (Default / Latest): State-of-the-art multilingual recognition, native code-mixing support, global and Indian English support.
  - `saaras:v3`: Stable legacy model supporting 22 Indian languages and Indian English (`en-IN`).
- **Language Coverage (23 Languages)**:
  - All 22 languages under the Eighth Schedule of the Indian Constitution: Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu.
  - English: Indian English (`en-IN`) and Global English (`en-US`/general) supported on v4.
- **API Endpoints**:
  - Synchronous REST: `POST https://api.sarvam.ai/speech-to-text` (payload up to 30s audio).
  - Real-time Streaming WebSocket: `WSS wss://api.sarvam.ai/speech-to-text/ws`.
- **Supported Audio Formats & Codecs**:
  - REST API: Automatic container/codec detection for `WAV`, `MP3`, `AAC`, `FLAC`, `OGG`. Raw PCM (`pcm_s16le`, `pcm_l16`, `pcm_raw`) requires explicit `input_audio_codec` parameter and **16kHz sample rate**.
  - WebSocket API: Strictly requires `WAV` or raw PCM (`pcm_s16le`, `pcm_l16`, `pcm_raw`) at 16kHz mono.
- **Output Modes (`mode` parameter)**:
  - `transcribe`: Default script transcription with punctuation and numeric normalization.
  - `translate`: Automatic direct translation from any supported Indic language into English.
  - `verbatim`: Word-for-word transcript retaining disfluencies and fillers (ideal for clinical/legal auditing).
  - `translit`: Transliterated output mapped strictly to Latin/Roman script.
  - `codemix`: Preserves mixed Indic script with English vocabulary naturally.

### 2.2 Text-to-Speech: Bulbul Engine
- **Models**:
  - `bulbul:v4-flash` (Recommended): Optimized for ultra-low-latency real-time voice agents (<250ms time-to-first-audio chunk) with 200+ persona voice IDs across tone and domain archetypes.
  - `bulbul:v3`: Production stable default featuring 30+ named speaker voices (`shubh`, `aditya`, `priya`, `ritu`, etc.).
- **Language Coverage (11 Languages)**:
  - English (`en-IN`), Hindi (`hi-IN`), Bengali (`bn-IN`), Gujarati (`gu-IN`), Kannada (`kn-IN`), Malayalam (`ml-IN`), Marathi (`mr-IN`), Odia (`od-IN`), Punjabi (`pa-IN`), Tamil (`ta-IN`), Telugu (`te-IN`).
  - Code-mixed English-Hindi persona tags (`enhi`) natively supported in v4-flash.
- **API Endpoints**:
  - REST: `POST https://api.sarvam.ai/text-to-speech` (sync JSON response containing base64 audio, max 2,500 chars).
  - HTTP Streaming: `POST https://api.sarvam.ai/text-to-speech/stream` (streams raw audio bytes, max 3,500 chars).
  - Streaming WebSocket: `GET https://api.sarvam.ai/text-to-speech/ws` (bidirectional persistent connection for chunked LLM sentence synthesis).
- **Audio Controls**:
  - Speech pace: `pace` float range `0.5` to `2.0` (default `1.0`).
  - Sample rates supported: `8000`, `16000`, `22050` (default), `24000`, `32000`, `44100`, `48000` Hz.

### 2.3 Authentication, Rate Limits & Credit Economics
- **Authentication**:
  - Header: `api-subscription-key: <SARVAM_API_KEY>` across all endpoints.
  - Base URL: `https://api.sarvam.ai`.
- **Credit Allocation & Quota**:
  - Universal organization credit pool: 1 Credit = ₹1.
  - ₹100 free credit granted upon verified account signup.
  - Quota exhaustion triggers `HTTP 402 Payment Required` (`insufficient_quota_error`).
- **Pricing Rates**:
  - STT: ₹0.49/min (Pay-as-you-go), ₹0.59/min with speaker diarization.
  - TTS: ₹2.00 per 1,000 characters (`bulbul:v4-flash`), ₹3.00 per 1,000 characters (`bulbul:v3`).
  - Voice Agents: ₹3.00 to ₹3.50/min for integrated STT + LLM + TTS pipelines.
- **Rate Limits**:
  - Token-bucket continuous replenishment model enforced per organization.
  - Plan-dependent throughput; exceeding limit returns `HTTP 429 Too Many Requests`.

---

## 3. What Was Verified (Empirically Confirmed)
- **Local Audio Tooling**: Python 3.13.15 has `PyAudio` (0.2.14), `sounddevice` (0.5.3), `SpeechRecognition` (3.14.4), and `audioop-lts` (0.2.2) installed and functional.
- **Web & Documentation Connectivity**: Direct live retrieval from `docs.sarvam.ai` verified.
- **Host Runtime**: Windows 11 host with Node.js v26.13.1, npm 11.21.0, and pnpm 9.12.2 available.

---

## 4. What Is Unavailable
- **`SARVAM_API_KEY`**: No API key is configured in system or session environment variables.
- **`sarvamai` SDK**: The official Python client library is not currently installed in the workspace environment (`WARNING: Package(s) not found: sarvamai`).
- **`ffmpeg` CLI**: Binary not present on system PATH (`ffmpeg not found`), meaning external CLI transcoding cannot be used.
- **Sarvam MCP Server**: Not currently installed or registered in `C:\Users\Abhijeet\.gemini\antigravity\mcp`.

---

## 5. What Requires Permission / User Action
1. **API Key Provisioning**: User must provide a valid `SARVAM_API_KEY` and ensure active credits are loaded in the Sarvam console.
2. **Package Installation**: User permission required to install `sarvamai` (`pip install sarvamai`) or alternative client wrappers if desired.
3. **Audio Transcoding Tooling**: If file conversion from miscellaneous external formats to 16kHz PCM is required outside Python, user permission to install `ffmpeg` (e.g., via winget/chocolatey) will be required.

---

## 6. Risks & Conflicts

| Risk | Severity | Root Cause | Impact | Mitigation Strategy |
|------|----------|------------|--------|---------------------|
| **Credit Depletion** | High | Free credit is ₹100 (~200 min STT or ~50k char TTS) | `HTTP 402` stops all voice pipelines mid-execution | Implement client-side token/minute tracking; configure auto-recharge on Sarvam dashboard. |
| **Rate Limit Spikes** | Medium | Pay-as-you-go concurrency ceiling | `HTTP 429` during parallel testing or voice loops | Exponential back-off jitter client middleware; queue request bursts. |
| **Streaming Codec Mismatch** | Medium | WebSockets strictly require 16kHz mono WAV or PCM | Streaming fails if browser/client sends Opus/AAC | Use WebAudio API / Python `sounddevice` to resample directly to 16kHz PCM before streaming. |
| **Language Coverage Asymmetry** | Medium | Saaras STT has 23 languages; Bulbul TTS has only 11 | Cannot vocalize output in 12 scheduled languages | Implement translation fallback to Hindi/English, or return text transcript when TTS is unsupported. |
| **Character Truncation** | Low | REST TTS capped at 2,500 chars | Large text payloads fail validation | Implement sentence-boundary chunking before sending to TTS. |

---

## 7. AI & Voice Technology Team Contribution to REWIRED ECHO
1. **Bidirectional Indic Voice Gateway**:
   - Ingest spoken regional language queries using `saaras:v4` WebSocket with real-time automatic language detection and code-mixing.
   - Synthesize vocal responses using `bulbul:v4-flash` (<250ms latency) in the user's native dialect.
2. **Audio Streaming Engine**:
   - Build a lightweight streaming bridge utilizing native `sounddevice` / browser WebAudio producing raw 16kHz 16-bit mono PCM chunks, completely eliminating dependencies on missing system `ffmpeg`.
3. **Resilient Middleware Layer**:
   - Provide client-side rate limit (`429`) recovery, quota warning triggers before `402` failure, and intelligent sentence boundary chunking (<2,500 characters) for conversational continuity.
4. **Language Orchestration**:
   - Manage cross-lingual mapping, allowing input across 22 scheduled Indian languages and routing response synthesis to supported TTS voices or translation bridges.

# ZYVO — LIVE SPEECH & INTENT API INTEGRATION PLAN
## Sarvam Primary STT + Google Gemini Backup STT + Structured Intent Extraction

**Product:** ZYVO  
**Initiative:** REWIRED  
**Official Track:** Track ECHO  
**Location:** `C:\MILKY WAY\zyvo`  
**Execution Date:** 2026-11-19  

---

## 1. ARCHITECTURAL OBJECTIVE

Integrate live speech-to-text (STT) and structured artificial intelligence intent extraction into ZYVO's five-industry operations platform without modifying or degrading existing database schemas, deterministic business validation, two-phase confirmation gates, or the Operational Observatory design system.

---

## 2. INTEGRATION ARCHITECTURE

```
                                      [User Voice Input]
                                      (WebM / WAV / MP4)
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │    SpeechProviderRouter         │
                             └─────────────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │ (Primary)               │ (Secondary)             │ (Safety Fallback)
                    ▼                         ▼                         ▼
         ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
         │ SarvamSpeechAdapter │   │ GeminiSpeechAdapter │   │  MockSpeechAdapter  │
         │ (saaras:v4 codemix) │   │ (Multimodal Audio)  │   │  (Deterministic)    │
         └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                     Transcript String
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │    IntentProviderRouter         │
                             └─────────────────────────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         │                                         │
                   Vertical == Clinic?                      Other 4 Verticals
                         │                                         │
                         ▼                                         ▼
         ┌───────────────────────────────┐         ┌───────────────────────────────┐
         │ DeterministicIntentAdapter    │         │ GeminiIntentAdapter           │
         │ (Strict Local Non-Diagnostic) │         │ (JSON Schema Extraction)      │
         └───────────────────────────────┘         └───────────────────────────────┘
                         │                                         │
                         │                               (If Error / Quota 429)
                         │                                         │
                         │                                         ▼
                         │                         ┌───────────────────────────────┐
                         │                         │ DeterministicIntentAdapter    │
                         │                         │ (Zero-Failure Fallback)       │
                         │                         └───────────────────────────────┘
                         │                                         │
                         └────────────────────┬────────────────────┘
                                              │
                                              ▼
                                 Structured Action Proposal
                                (Needs Customer/Operator
                                    Confirmation Gate)
                                              │
                                  [Database Mutation ONLY
                                    After User Confirms]
```

---

## 3. PROVIDER SPECIFICATIONS

### A. Speech-to-Text (STT)

1. **Primary: Sarvam AI**
   - **Provider ID:** `sarvam`
   - **Model:** `saaras:v4`
   - **Endpoint:** `POST https://api.sarvam.ai/speech-to-text`
   - **Authentication:** `api-subscription-key` header (`process.env.SARVAM_API_KEY`)
   - **Payload:** `multipart/form-data` with `file`, `model="saaras:v4"`, `mode="codemix"`, `language_code="unknown"` (auto-detection).
   - **Timeout:** 12 seconds with `AbortController`.
   - **Failover:** On HTTP 401/403, 429 (rate/quota), network timeout, or 5xx, the router trips circuit state and fails over to the secondary provider.

2. **Secondary / Backup: Google Gemini Multimodal Audio**
   - **Provider ID:** `gemini`
   - **Model:** `gemini-3.5-transcribe` (with automatic fallback to `gemini-2.5-flash`)
   - **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent?key=<api_key>`
   - **Authentication:** `GOOGLE_AI_API_KEY` (or alias `GEMINI_API_KEY`)
   - **Payload:** Base64-encoded audio passed via `inlineData` with transcription prompt:
     `"Transcribe this audio verbatim in Indic/English language. Output only the transcript text, or empty string if audio is silent."`
   - **Timeout:** 12 seconds with `AbortController`.

3. **Fallback: Mock Evaluator**
   - **Provider ID:** `mock`
   - Deterministic local benchmark mapping supporting offline test suites, synthetic audio, and zero-connectivity environments.

### B. Structured Intent Extraction

1. **Primary: Google Gemini Structured Output**
   - **Provider ID:** `gemini`
   - **Model:** `gemini-3.5-flash-lite` (with fallback to `gemini-2.5-flash`)
   - **Endpoint:** Generative Language API with `generationConfig: { responseMimeType: 'application/json' }`
   - **Vertical Schemas:** Strict JSON schemas for `milk_delivery`, `kirana`, `vegetable_vendor`, and `agriculture`.
   - **Ambiguity Detection:** Detects incomplete parameters and sets `needsClarification: true` with a polite contextual clarification prompt.

2. **Safety Privacy Shield: Clinic Appointments**
   - **Vertical:** `clinic`
   - **Privacy Policy:** Identifiable patient data, medical symptoms, and clinical notes are **NEVER** transmitted to external LLM APIs.
   - **Enforcement:** The `IntentProviderRouter` inspects the vertical; if `verticalType === 'clinic'`, it completely bypasses external LLM adapters and routes directly to the local `DeterministicIntentAdapter`.

3. **Fallback: Deterministic Local Pattern Extractor**
   - **Provider ID:** `deterministic`
   - Regex-based colloquial pattern extractor for all 5 industries, guaranteeing zero downtime and complete local offline operability.

---

## 4. INVARIANTS & INTEGRATION SAFEGUARDS

1. **Zero Secrets Leakage:**
   - No API keys committed to Git or embedded in client code.
   - `.env.local` strictly git-ignored.
   - Diagnostic endpoints and UI cards report boolean availability and circuit states, never displaying raw credentials.

2. **Strict Two-Phase Confirmation Protocol:**
   - External STT and intent extraction only generate an **Action Proposal** (`proposal_json` in `voice_submissions`).
   - Domain tables (`milk_delivery_calendar`, `kirana_grocery_orders`, `vegetable_orders`, `clinic_appointments`, `agri_procurement_requests`) are **NEVER** mutated during the transcription or extraction phases.
   - Mutations occur **ONLY** upon explicit user confirmation (`POST /api/proposals/[id]/confirm`).

3. **Circuit Breaker & Fallback:**
   - 3 consecutive failures trip the circuit into an OPEN state with a 60-second cooldown period.
   - Seamless progression: `Sarvam -> Gemini Audio -> Mock STT` for speech, and `Gemini -> Deterministic` for intent.

---

## 5. VERIFICATION PROTOCOL

1. Direct provider connectivity handshake with synthetic audio payload.
2. 12 automated test suites covering all core and vertical domain operations.
3. Next.js 16 Turbopack production compilation.
4. Settings page telemetry integration verification.

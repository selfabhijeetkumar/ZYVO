# ZYVO — Future External API Integration Blueprint
## Prepared Provider Architecture, Circuit Breakers & Safe Activation Plan

**Product:** ZYVO  
**Initiative:** REWIRED (Track ECHO)  
**Execution Phase:** Phase 4 & Phase 5  
**Current Status:** LIVE APIS DISABLED (`EXTERNAL_API_ENABLED=false`). Deterministic Evaluator Active.

---

### 1. Architectural Guardrails

ZYVO separates Speech-to-Text (Acoustic Decoding) from Intent & Slot Extraction (Linguistic Processing) into isolated provider domains.

- **Zero Live Credit Consumption:** All external network calls are gated behind `EXTERNAL_API_ENABLED=true` and explicit API key presence.
- **Circuit Breaker:** Both `SpeechProviderRouter` and `IntentProviderRouter` implement automatic failure tracking (threshold: 3 consecutive failures), 60-second cooldown, and guaranteed fallback to deterministic offline engines.
- **No Secret Leakage:** Client-side JavaScript never receives provider tokens. All provider integrations execute strictly within server-side Next.js route handlers.

---

### 2. Speech-to-Text (STT) Provider Specifications

| Provider | Target Endpoint | Primary Model | Authentication Header | Supported Dialects |
|---|---|---|---|---|
| **Sarvam AI** | `https://api.sarvam.ai/speech-to-text` | `saaras:v2` (or verified successor) | `api-subscription-key: <SARVAM_API_KEY>` | Hindi (`hi-IN`), Indian English (`en-IN`), Kannada, Hinglish |
| **Groq Cloud** | `https://api.groq.com/openai/v1/audio/transcriptions` | `whisper-large-v3-turbo` | `Authorization: Bearer <GROQ_API_KEY>` | Multilingual (25+ languages) |
| **Google Gemini** | Google GenAI Multimodal API | Multimodal Audio Ingestion (Pending endpoint verification) | `x-goog-api-key: <GOOGLE_AI_API_KEY>` | Global Multimodal |
| **Mock Evaluator** | In-Memory Deterministic | `mock-benchmark-v1` | None | Hinglish, Hindi, Indian English |

---

### 3. Intent & Slot Extraction Provider Specifications

| Provider | Model ID | Extraction Mechanism | Fallback Route |
|---|---|---|---|
| **Google Gemini** | `gemini-3.5-flash-lite` | `responseSchema` (Strict JSON Schema validation) | Deterministic local pattern parser |
| **Groq Cloud** | `llama-3.3-70b-versatile` | `response_format: { type: 'json_object' }` | Deterministic local pattern parser |
| **Deterministic** | Regex/Grammar Parser | Handcrafted bounded token extractors | Self-contained, zero-dependency |

---

### 4. Safe Activation Checklist (For Future Phase)

To activate live API providers in a production deployment:
1. Populate `.env.local` with verified credentials:
   ```env
   SARVAM_API_KEY=your_actual_key
   GOOGLE_AI_API_KEY=your_actual_key
   GROQ_API_KEY=your_actual_key
   EXTERNAL_API_ENABLED=true
   ```
2. Verify connectivity with a single test audio sample.
3. Ensure server outbound egress firewall permits HTTPS traffic to `api.sarvam.ai`, `generativelanguage.googleapis.com`, and `api.groq.com`.
4. Ensure audit logging remains enabled to capture latency, confidence scores, and token usage.

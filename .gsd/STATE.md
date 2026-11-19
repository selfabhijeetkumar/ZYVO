---
updated: 2026-11-19T15:58:00+05:30
---

# ZYVO Project State

## Current Position

**Milestone:** ZYVO Live Speech & Intent API Integration  
**Phase:** Sarvam Primary STT + Gemini Backup STT + Structured Intent Extraction  
**Status:** **COMPLETE & EMPIRICALLY VERIFIED (12/12 Test Suites Passed, 100% Pass Rate)**  
**Planning Lock:** ENGAGED (Live Speech & Intent API Integration complete)  
**Product Name:** **ZYVO**  
**Hackathon Initiative:** REWIRED (Track ECHO)  
**Product Positioning:** *"One voice platform. Multiple business workflows."*  
**Latest Git Commits:**
- `711a147`: `feat(integrations): activate Sarvam and Gemini speech and intent providers`
- `f1c1dcb`: `feat(spatial): cinematic spatial operations transformation, 3d voice core, observatory design system, and multi-viewport hardening`
- `aa00bc7`: `feat(phase7): hackathon demo package, documentation runbook and release package`
- `34b1c8d`: `feat(phase6): mobile demo readiness, msp pricing correction, clinic privacy and platform hardening`
- `e33eb2f`: `feat(phase5): complete kirana, vegetable, clinic, and agriculture business workflows`
- `c82634d`: `feat(phase4): complete milk delivery operations and billing engine`
- `9a3bdc4`: `feat(phase3): multi-vertical platform foundation and application shell`

---

## Last Action Completed (Live Speech & Intent API Integration)

Successfully activated genuine external speech recognition and structured AI intent extraction across all five industries without damaging existing workflows, SQLite persistence, or leaking secrets:

1. **Primary Speech-to-Text via Sarvam AI:**
   - Implemented `SarvamSpeechAdapter` invoking model `saaras:v4` via `https://api.sarvam.ai/speech-to-text` with `codemix` mode and 12s bounded timeout.
   - Empirically verified live API response with HTTP 200 in ~800ms.

2. **Secondary Speech-to-Text via Google Gemini Multimodal Audio:**
   - Implemented `GeminiSpeechAdapter` using `gemini-3.5-transcribe` (and `gemini-2.5-flash`) with Base64 audio `inlineData`.
   - Empirically verified live audio transcription with HTTP 200.

3. **Structured Intent Extraction via Google Gemini:**
   - Implemented `GeminiIntentAdapter` using `gemini-3.5-flash-lite` with schema-enforced JSON generation for `milk_delivery`, `kirana`, `vegetable_vendor`, and `agriculture`.
   - Guaranteed automatic fallback to `DeterministicIntentAdapter` on rate limits or errors.

4. **Strict Clinic Non-Diagnostic Privacy Shield:**
   - Intercepted all `clinic` vertical requests before external API transmission; routed outpatient scheduling 100% through local deterministic engine to ensure zero transmission of patient PII or clinical symptoms to external LLM free-tier APIs.

5. **Strict Two-Phase Confirmation Gate & Telemetry:**
   - Verified that audio transcription and slot extraction produce only staged Action Proposals with zero direct mutations to domain tables.
   - Built live telemetry diagnostic route `/api/admin/provider-health` and updated `/settings` with live provider health matrix and circuit breaker status.
   - All 12/12 automated test suites passed (100% pass rate); Next.js compiled 34 routes cleanly.

---

## Active Decisions Log

| Decision ID | Summary | Selection | Date | Affects |
|---|---|---|---|---|
| **PDR-2026-11-19-ECHO-01** | Product Opportunity Selection | Recurring Doorstep Supply (Milk Delivery First) | 2026-11-19 | Entire Project |
| **PDR-2026-11-19-ZYVO-RENAME-01** | Product Brand Rebranding | Renamed application from "ECHO" to **ZYVO** | 2026-11-19 | All future specs, UI, code |
| **PDR-2026-11-19-ARCH-01** | Technology Stack Selection | Next.js 15/16 + SQLite (built-in `node:sqlite`) | 2026-11-19 | Entire System |
| **PDR-2026-11-19-CAL-01** | Calendar Arithmetic Correction | Explicit ISO calendar math; Nov 22 = Sunday, Nov 23 = Monday | 2026-11-19 | Temporal Engine |
| **PDR-2026-11-19-MODEL-01** | AI Model & Structured Extraction | Decoupled provider router; deterministic local fallback | 2026-11-19 | Voice & Intent Pipeline |
| **PDR-2026-11-19-SQLITE-01** | Standard Library SQLite API | `DatabaseSync` class in `node:sqlite`; synchronous execution model | 2026-11-19 | Database Persistence |
| **PDR-2026-11-19-CUTOFF-01** | Canonical Demonstration Cutoff | `20:00:00` IST default (dairy depot indent operational rationale) | 2026-11-19 | Temporal & Cutoff Engine |
| **PDR-2026-11-19-BILL-01** | Billing Dual-Model Contract | Model 1 per-delivery summation & Model 2 reconciliation | 2026-11-19 | Billing Engine |
| **PDR-2026-11-19-MULTI-VERTICAL-01**| Multi-Vertical Scope Expansion | Expand ZYVO to 5 functional modules (Milk, Kirana, Veg, Clinic, Agri) | 2026-11-19 | All 5 Business Verticals |
| **PDR-2026-11-19-PAISE-01** | Integer Currency Storage | All financials stored strictly in integer paise (₹1 = 100 paise) | 2026-11-19 | Pricing & Billing Engines |
| **PDR-2026-11-19-CLINIC-PRIVACY-01**| Clinic Non-Diagnostic Boundary | Clinic module restricted to administrative scheduling; zero clinical notes | 2026-11-19 | Clinic Module |
| **PDR-2026-11-19-VEG-FRACTIONS-01** | Fractional Produce Calculations | Mandi rates support grams, kg, bundles with integer paise rounding | 2026-11-19 | Vegetable Module |
| **PDR-2026-11-19-AGRI-QUINTALS-01** | Standard Quintal Payout Formula | Crop harvest converted to quintals for MSP benchmark payout math | 2026-11-19 | Agriculture Module |
| **PDR-2026-11-19-MSP-CORRECT-01** | Strict CCEA/PIB MSP Compliance | Tomato/Potato strictly non-MSP spot rates; Wheat/Mustard official MSP | 2026-11-19 | Agriculture Module & Schema |
| **PDR-2026-11-19-SEC-HARDEN-01** | Endpoint & Path Containment | Protected admin purge route; path containment on audio files | 2026-11-19 | API Routes & Storage |
| **PDR-2026-11-19-SPATIAL-01** | 3D Engine Architecture | Vanilla `three` in Client Components for React 19 safety & zero-leak WebGL | 2026-11-19 | Spatial 3D Pipeline |
| **PDR-2026-11-19-OBSERVATORY-01** | Visual Token System | Operational Observatory palette (`#101211`, `#171B19`, `#202622`, `#69D9AD`) | 2026-11-19 | Entire Visual Presentation |
| **PDR-2026-11-19-STT-SARVAM-01** | Primary Speech-to-Text | Sarvam `saaras:v4` in `codemix` mode with 12s bounded timeout | 2026-11-19 | Speech Pipeline |
| **PDR-2026-11-19-STT-GEMINI-02** | Secondary Speech-to-Text | Google Gemini Multimodal Audio (`gemini-3.5-transcribe` / `gemini-2.5-flash`) | 2026-11-19 | Speech Pipeline |
| **PDR-2026-11-19-INTENT-GEMINI-01** | Structured Intent Extraction | Google Gemini (`gemini-3.5-flash-lite`) with JSON Schema & deterministic fallback | 2026-11-19 | Intent Pipeline |
| **PDR-2026-11-19-PRIVACY-SHIELD-02**| Clinic Non-Diagnostic Shield | Zero patient clinical data transmitted to external LLMs; local deterministic router | 2026-11-19 | Clinic Module & Router |

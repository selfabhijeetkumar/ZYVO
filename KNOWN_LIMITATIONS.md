# ZYVO — KNOWN LIMITATIONS & DISCLOSURES
## Transparent Engineering Disclosure for Hackathon Judges & Evaluators

---

### 1. LIVE EXTERNAL SPEECH & INTENT APIS DEFERRED

- **Current State:** In accordance with hackathon zero-cost constraints and local autonomous execution instructions, `EXTERNAL_API_ENABLED=false` is enforced.
- **Speech Ingestion:** Microphone audio is captured via the browser `MediaRecorder` API and saved to `storage/audio/`. However, live cloud audio-to-text recognition through Sarvam AI Saaras v4 or Groq Whisper is disabled.
- **Extraction Behavior:** The application operates in **Benchmark / Manual Transcript Mode**. Intent and slot extraction is performed using the built-in deterministic regex engine (`src/lib/providers/intent/deterministic.adapter.ts`).
- **Production Integration Path:** All provider interfaces and adapters (`sarvam.adapter.ts`, `gemini.adapter.ts`, `groq.adapter.ts`) are fully implemented. Activating live recognition requires setting `EXTERNAL_API_ENABLED=true` and supplying valid API credentials in `.env.local` as documented in `API_INTEGRATION_PLAN.md`.

---

### 2. LANGUAGE COVERAGE BOUNDARIES

- **Verified Languages (Offline Mode):** Hinglish (code-mixed Hindi/English), Hindi (Devanagari script), and English.
- **Deferred Indic Languages:** Dravidian languages (Kannada, Tamil, Telugu, Malayalam) and other regional languages (Marathi, Bengali, Gujarati) require live acoustic and language models (e.g. Sarvam Saaras Indic 10-language models). They cannot be reliably parsed with regex alone without live external STT.

---

### 3. DATABASE CONCURRENCY & DEPLOYMENT ARCHITECTURE

- **Current Engine:** Standard-library Node.js SQLite (`node:sqlite` `DatabaseSync`) running in WAL mode with enforced foreign keys (`PRAGMA foreign_keys = ON`).
- **Operational Scope:** Highly performant for single-merchant local deployments, edge devices, depot kiosks, or single-instance cloud servers (handles hundreds of requests per second).
- **Multi-Region Horizon:** In a distributed multi-region production deployment across India, the database layer would transition to distributed SQLite (e.g. Turso / libSQL / Litestream) or PostgreSQL.

---

### 4. MOBILE CLOUDFLARE QUICK TUNNEL CONSTRAINTS

- **Ephemeral URLs:** The `scripts/start-mobile-demo.ps1` script creates temporary Cloudflare Quick Tunnels (`trycloudflare.com`) intended for live demonstration on physical phones.
- **Session Duration:** Quick Tunnels are ephemeral and expire when the process terminates. They do not constitute permanent production DNS or SSL hosting.

---

### 5. FINANCIAL & MESSAGING GATEWAY INTEGRATIONS

- **Paise Precision vs Banking Rails:** All financial transactions (milk monthly billing, kirana basket totals, vegetable gram pricing, crop procurement estimates) are calculated in integer paise.
- **Deferred Banking Integrations:** Direct payment processing (UPI QR generation, auto-debit NACH, Razorpay integration) and WhatsApp Business Cloud API integration are deferred to post-hackathon development.

---

### 6. CLINIC OPERATIONAL SCOPE (NON-DIAGNOSTIC MANDATE)

- **Administrative Scheduling Only:** ZYVO is strictly an administrative outpatient scheduling platform.
- **Zero Medical Advice:** The system does not diagnose symptoms, suggest treatments, or issue prescriptions. Any submission attempting to store clinical symptoms is blocked server-side by design.

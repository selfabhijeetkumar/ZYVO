# ZYVO System Architecture & Technical Contracts

**Document ID:** ARCH-2026-11-19-ZYVO-01  
**Phase:** Phase 2.2 — Final Architectural Reconciliation & Specification Approval Readiness  
**Date:** 2026-11-19  
**Status:** PROPOSED — AWAITING USER APPROVAL  
**Product Brand:** **ZYVO**  
**Official Track:** REWIRED Track ECHO  

---

## 1. Architectural Philosophy & Principles

The architectural design of **ZYVO** is governed by three foundational tenets:
1. **Simplicity over Speculation (Ponytail YAGNI)**: Eliminate unnecessary microservices, external message queues (Kafka/RabbitMQ), and distributed cache layers (Redis). The entire 6-hour hackathon MVP runs as a cohesive, single-process, low-overhead application.
2. **Deterministic Business Boundaries**: The AI models (Sarvam Saaras v4 and Gemini 3.5 Flash-Lite) are strictly acoustic perception and text-to-slot mapping layers. They **never** compute delivery dates, evaluate cutoff deadlines, or write to financial tables directly. All transactional decisions are made by deterministic, unit-tested TypeScript engines.
3. **Zero Fragile Dependencies**: The audio ingestion pipeline requires **zero CLI transcoding tools** (no FFmpeg on PATH), relying on browser-native `MediaRecorder` capability detection (`audio/webm;codecs=opus`, `audio/mp4`, `audio/wav`) natively ingested by Sarvam's REST endpoint (<30s).

---

## 2. Technology Stack Evaluation

| Dimension | Primary Architecture (Recommended) | Fallback Architecture | Anti-Pattern Architecture (Rejected) |
|---|---|---|---|
| **Frontend Framework** | **Next.js 15 (React 19, App Router, Tailwind CSS)** | Vite + React 19 SPA | Heavy Flutter / React Native mobile apps |
| **Backend / API** | **Next.js Unified Route Handlers (`app/api/*`)** | Python 3.13 + FastAPI | Multi-repo microservices architecture |
| **Persistence** | **SQLite via built-in `node:sqlite` (`Database` class, local `zyvo.db`)** | SQLite via raw Python `sqlite3` | Managed cloud Postgres (Supabase MCP token is distinct from app DB) |
| **Audio Processing** | **HTML5 MediaRecorder (`audio/webm`, `audio/mp4`, `audio/wav`)** | Synthetic audio corpus mock | CLI `ffmpeg` shell invocation (missing on PATH) |
| **Speech AI (STT)** | **Sarvam AI Saaras v4 REST API (`mode: codemix`)** | Pre-recorded benchmark audio mock | Raw ungrounded Whisper without Indic code-mixing |
| **Structured Extraction**| **Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`, Schema Mode)** | Option A: Bounded TypeScript regex pattern parser | Unconstrained LLM free-text chatting |
| **Build & Run** | **Node.js v26.13.1 + npm 11.21.0** | Python 3.13 + venv | Docker Compose multi-container swarm |

### Built-in SQLite Architecture & Limitations:
- **API Class**: Node.js v26.11+ standard library exposes `Database` as the primary class (`DatabaseSync` is a deprecated alias). Newly authored code instantiates `new sqlite.Database(path)`.
- **Execution Model**: All operations are synchronous (`db.exec()`, `db.prepare().run()`, `db.prepare().all()`).
- **Stability Status**: Classified as **Release Candidate / Experimental** in Node.js standard library.
- **Why Acceptable for Hackathon MVP**: Eliminates external C++ compilation dependencies (`better-sqlite3`), `node-gyp`, and Python build tools on Windows 11. The local single-process workload has low concurrent write contention.
- **Production Concurrency Limitation**: Synchronous calls block the Node.js event loop on heavy concurrent transactions. Production architectures with high write concurrency require WAL mode with worker pools or migration to PostgreSQL (Supabase).
- **Persistence & Exclusions**: Local database file (`zyvo.db`) lives on persistent host storage. Database files (`zyvo.db*`), audio uploads (`storage/audio/`), and secrets (`.env*.local`) are excluded from Git in `.gitignore`.

---

## 3. High-Level Component Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT BROWSER (PWA)                                   │
│  ┌───────────────────────────────┐                  ┌───────────────────────────────┐  │
│  │     Customer Voice View       │                  │      Vendor Route Sheet       │  │
│  │  • MediaRecorder (WebM/MP4)   │                  │  • Sequenced Morning Manifest │  │
│  │  • Confirmation & Bill Diff   │                  │  • Live Crate Tally           │  │
│  │  • Delivery Calendar Display  │                  │  • Dispute Audio Replay       │  │
│  └───────────────┬───────────────┘                  └───────────────▲───────────────┘  │
└──────────────────┼──────────────────────────────────────────────────┼──────────────────┘
                   │ HTTP POST (Multipart Audio Blob)                 │ HTTP GET
                   ▼                                                  │
┌─────────────────────────────────────────────────────────────────────┼──────────────────┐
│                             ZYVO CORE BACKEND (Next.js / Node.js)   │                  │
│  ┌──────────────────────────────────────────────────────────────────┴────────────────┐ │
│  │ Route Handlers (`/api/voice-submissions`, `/api/proposals`, `/api/manifest`)     │ │
│  └───────────────────────────────┬───────────────────────────────────────────────────┘ │
│                                  │                                                     │
│         ┌────────────────────────┴────────────────────────┐                            │
│         │ Audio Payload                                   │ Transcribed Text           │
│         ▼                                                 ▼                            │
│  ┌──────────────────────────────┐              ┌─────────────────────────────────────┐ │
│  │     Sarvam AI Saaras v4      │              │ Structured Slot Extractor           │ │
│  │     REST Speech-to-Text      │              │ • Option B: Gemini 3.5 Flash-Lite   │ │
│  │     (mode: "codemix")        │              │ • Option A: Bounded Regex Fallback  │ │
│  └──────────────────────────────┘              └──────────────────┬──────────────────┘ │
│                                                                   │ Extracted Slots    │
│                                                                   ▼                    │
│                                                ┌─────────────────────────────────────┐ │
│                                                │ Deterministic Temporal Engine       │ │
│                                                │ • Asia/Kolkata Clock & Cutoffs      │ │
│                                                │ • Cutoff: 20:00:00 IST Boundary     │ │
│                                                │ • Calendar Arithmetic (Nov 22=Sun)  │ │
│                                                └──────────────────┬──────────────────┘ │
│                                                                   │ Structured Mutation│
│                                                                   ▼                    │
│                                                ┌─────────────────────────────────────┐ │
│                                                │ Deterministic Billing Engine        │ │
│                                                │ • Model 1: Per-delivery Summation   │ │
│                                                │ • Model 2: Invoice Reconciliation   │ │
│                                                │ • Integer-Paise Math (No double-sub)│ │
│                                                └──────────────────┬──────────────────┘ │
│                                                                   │ Atomic Transaction │
│                                                                   ▼                    │
│                                                ┌─────────────────────────────────────┐ │
│                                                │ Persistence Layer (node:sqlite)     │ │
│                                                │ • delivery_calendar (Single Source) │ │
│                                                │ • voice_submissions (Holds proposal)│ │
│                                                │ • audit_events (Dispute Evidence)   │ │
│                                                └─────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. End-to-End Transactional Data Flow

1. **Audio Capture**:
   - Customer taps record in browser. `MediaRecorder.isTypeSupported()` selects `audio/webm;codecs=opus` (Android/Chrome) or `audio/mp4` (iOS Safari).
   - Audio is validated for duration ($\le 30\text{s}$) and non-empty size ($\le 10\text{MB}$), then uploaded via `POST /api/voice-submissions`.
2. **Transcription Ingestion**:
   - Backend verifies audio payload, saves it to `storage/audio/{uuid}.webm`, and forwards the blob directly to Sarvam REST STT (`POST https://api.sarvam.ai/speech-to-text`) with header `api-subscription-key: <KEY>` and payload `mode: "codemix"`. Zero FFmpeg transcoding required.
   - Sarvam returns raw transcript: *"kal aur parso doodh mat dena sunday ko aadha litre extra dena"*.
3. **Structured Intent & Slot Extraction**:
   - **Primary (Option B)**: Transcript is mapped to candidate slots via `gemini-3.5-flash-lite` configured with strict `response_schema`. (Requires application-level `GEMINI_API_KEY`).
   - **Fallback (Option A)**: If Gemini API is unconfigured, rate-limited, or fails, the bounded TypeScript pattern parser handles known Indic delivery keywords (*"mat dena"*, *"extra"*).
   - Extracted slots: `{ action: "PAUSE", dates: "kal aur parso", delta: "+500mL", delta_date: "Sunday" }`.
4. **Deterministic Temporal Parsing & Cutoff Validation**:
   - `lib/temporal-engine.ts` loads server time in `Asia/Kolkata`.
   - Authoritative timestamp: `server_received_at`.
   - Evaluates current time against Vendor Cutoff (`20:00:00` IST configurable demonstration default fixture):
     - `timestamp <= 20:00:00`: Changes start tomorrow ($D_0 + 1$).
     - `timestamp > 20:00:00`: Cutoff violated; changes start day after tomorrow ($D_0 + 2$).
   - Maps relative tokens against reference Thursday, Nov 19, 2026:
     - *"Kal"* $\rightarrow$ Friday, Nov 20 (Pause, 0L).
     - *"Parso"* $\rightarrow$ Saturday, Nov 21 (Pause, 0L).
     - *"Sunday"* $\rightarrow$ Sunday, Nov 22 (Base 1.0L + 0.5L = 1.5L; Monday Nov 23 protected).
5. **Billing Derivation (Model 1 & Model 2)**:
   - `lib/billing-engine.ts` looks up customer's base rate (₹70.00 = 7000 paise/L).
   - Under Model 1: Sums 27 days @ ₹70 (189,000 paise) + 2 days @ ₹0 (0 paise) + 1 day @ ₹105 (10,500 paise) = 199,500 paise (₹1,995.00).
   - Under Model 2: Base 210,000 paise minus pause credits 14,000 paise plus extra 3500 paise = 199,500 paise (₹1,995.00).
   - Prevents double-counting bug.
6. **Interactive Confirmation**:
   - Proposal returned to client: State is `AWAITING_CONFIRMATION`.
   - UI displays exact dates, quantities, and bill diff.
   - Customer taps *"Confirm Changes"*.
7. **Atomic State Commit**:
   - Client sends `POST /api/proposals/{id}/confirm` with idempotency token.
   - Backend opens single SQLite transaction using `Database`:
     - Updates 3 rows in `delivery_calendar`.
     - Inserts record into `audit_events` with audio UUID and transcript span.
     - Transitions `voice_submissions.state` $\rightarrow$ `APPLIED`.
8. **Real-Time Vendor Reflection**:
   - Vendor opens `GET /api/vendors/{id}/manifest?date=2026-11-20`.
   - Route stop for Flat 204 displays: `0.0 Litres (PAUSED via Voice)`.
   - Crate aggregator count instantly decrements by 1 Litre.

---

## 5. Deployment, Tunnel Security & Exclusions

- **Development Environment**: Local Node.js server (`http://localhost:3000`).
- **Mobile Device Access & Microphone Permissions**:
  - Mobile browsers strictly enforce HTTPS Secure Context for `navigator.mediaDevices.getUserMedia()`. Plain Wi-Fi IP access (`http://192.168.x.x:3000`) is rejected.
  - A secure HTTPS tunnel is used during evaluation:
    ```bash
    # Public quick tunnel:
    cloudflared tunnel --url http://localhost:3000
    
    # Recommended restricted tunnel (email pin prompt):
    cloudflared tunnel --url http://localhost:3000 --allowed-mail evaluator@example.com
    ```
  - *Tunnel Security Contract*: Quick Tunnels are publicly reachable by default if unrestricted. They are strictly temporary testing tools, never production infrastructure.
  - *Mandatory App Security*: HTTP-only session cookies (`zyvo_session`) and role authorization are strictly enforced on all protected routes regardless of tunnel configuration.
- **Repository Isolation & Exclusions**: Dedicated Git repository created at `c:\MILKY WAY\zyvo` with `.gitignore` strictly excluding:
  - `zyvo.db`, `zyvo.db-wal`, `zyvo.db-shm` (SQLite database files)
  - `storage/audio/` (Recorded audio files)
  - `.env*.local` (API secrets and keys)
  - `node_modules/`, `.next/`, `npm-debug.log*`

---

*Last updated: 2026-11-19 (Phase 2.2 Architecture)*

# ZYVO — Multilingual Voice-First Business Operations Platform
> **Hackathon Initiative:** REWIRED · **Official Track:** Track ECHO  
> *"One voice platform. Multiple business workflows."*

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green?logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(node%3Asqlite)-blue?logo=sqlite)](https://nodejs.org/api/sqlite.html)
[![STT](https://img.shields.io/badge/STT-Sarvam%20AI%20%7C%20Gemini-orange)](#live-speech--intent-ai-pipeline)
[![Tests](https://img.shields.io/badge/Tests-12%20Suites%20Passing%20(100%25)-brightgreen)](#automated-test-suites)
[![Design](https://img.shields.io/badge/Design-Operational%20Observatory%20(Three.js)-69D9AD)](#cinematic-3d-spatial-interface)

---

## Live Application

**Live Demo:** [OPEN ZYVO](https://zyvo-delta.vercel.app)

- **Production Deployment URL:** [https://zyvo-delta.vercel.app](https://zyvo-delta.vercel.app)
- **Vercel Project:** `selfabhijeetkumar-9786s-projects/zyvo`
- **Deployment Status:** ● Ready & Verified
- **Demonstration Scope:** Evaluates with container-scoped ephemeral SQLite storage (`/tmp/zyvo.db`) and fallback mode enabled by default to safeguard credentials.

---

## 1. Executive Overview

**ZYVO** is an enterprise-grade, multilingual, voice-first business operations platform designed for Indian small-and-medium commerce. Rather than presenting generic chatbot interfaces, ZYVO turns voice audio (Hindi, Hinglish, English, vernacular dialects) into verified, schema-conforming business transactions across **five distinct industry modules** through a unified operations pipeline.

Every voice interaction is governed by a **Two-Phase Confirmation Protocol**: unconfirmed speech inputs produce staged Action Proposals with zero direct database mutations until explicitly confirmed by the operator or customer.

---

## 2. Five Functional Business Verticals

ZYVO provides complete, specialized end-to-end workflows for 5 Indian commercial environments:

```
                                 ┌───────────────────────────────────┐
                                 │          ZYVO VOICE CORE          │
                                 │  (Sarvam + Gemini + Audio Canvas) │
                                 └─────────────────┬─────────────────┘
                                                   │
         ┌───────────────────┬─────────────────────┼─────────────────────┬───────────────────┐
         ▼                   ▼                     ▼                     ▼                   ▼
┌─────────────────┐ ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ ┌─────────────────┐
│  MILK DELIVERY  │ │  KIRANA STORE   │   │    VEGETABLES   │   │     CLINIC      │ │   AGRICULTURE   │
│                 │ │                 │   │                 │   │                 │ │                 │
│ • 20:00 Cutoff  │ │ • Colloquial    │   │ • Mandi Spot    │   │ • Outpatient    │ │ • CCEA PIB MSP  │
│ • Daily Indent  │ │   Alias Match   │   │   Daily Rates   │   │   Admin Booking │   │   Benchmarks    │
│ • Integer Paise │ │ • Multi-Item    │   │ • Fractional    │   │ • Non-Diagnostic│ │ • Quintal Math  │
│   Billing       │ │   Baskets       │   │   Grams/Bundles │   │   Privacy Shield│ │ • Buyer Logist. │
│ • Pause/Resume  │ │ • Vendor Queue  │   │ • Vendor Prep   │   │ • Double-Booking│ │ • Spot vs MSP   │
│   Calendar      │ │   Fulfillment   │   │   Aggregation   │   │   Prevention    │ │   Pricing Engine│
└─────────────────┘ └─────────────────┘   └─────────────────┘   └─────────────────┘ └─────────────────┘
```

1. **Recurring Doorstep Supply (Milk Delivery):**
   - 20:00:00 IST operational cutoff rule (dairy depot indent logic).
   - Dual-model financial billing engine: Model 1 per-delivery summation and Model 2 calendar reconciliation.
   - All currencies stored strictly in integer paise (₹1 = 100 paise) preventing floating-point drift.
   - Interactive calendar adjustments (pause date ranges, permanent base quantity changes, one-off extra deliveries).

2. **Everyday Retail (Kirana Store):**
   - Colloquial Indic alias resolution (e.g., *shakkar/chini* -> Sugar, *chawal* -> Rice, *maggi* -> Noodles).
   - Multi-item grocery order parser with unit validation (packets, kg, litres).
   - Real-time vendor fulfillment transitions (`PENDING` -> `PACKED` -> `OUT_FOR_DELIVERY` -> `DELIVERED`).

3. **Fresh Produce (Vegetable Vendor):**
   - Mandi spot pricing engine with support for fractional weights (grams, bundles, kg).
   - Real-time subtotal calculation in integer paise with exact rounding.
   - Vendor aggregation manifests grouping customer orders for market procurement.

4. **Outpatient Healthcare (Clinic Appointments):**
   - Administrative outpatient scheduling with attending physicians and time slots.
   - Relational slot booking with strict double-booking prevention.
   - **Clinic Non-Diagnostic Privacy Shield**: Identifiable patient medical symptoms and clinical notes are blocked server-side and **never transmitted to external LLM APIs**.

5. **Rural Procurement (Agriculture):**
   - Direct harvest volume conversion (kg -> standard 100 kg Quintals).
   - Authentic Government of India CCEA PIB MSP benchmark pricing (Wheat at ₹2,425/q, Mustard Seed at ₹5,950/q) contrasted with open-market spot rates (Tomato, Potato).
   - Integrated buyer logistics, pickup scheduling, and indicative payout calculations.

---

## 3. Live Speech & Intent AI Pipeline

ZYVO incorporates a fault-tolerant multi-tier AI pipeline:

- **Primary Speech-to-Text (STT):** [Sarvam AI](https://sarvam.ai/) using `saaras:v4` in `codemix` mode for Indic vernacular speech. Bounded 12-second timeout.
- **Secondary STT (Backup):** Google Gemini Multimodal Audio (`gemini-3.5-transcribe` / `gemini-2.5-flash`) with Base64 audio payload.
- **Deterministic Mock Evaluator:** High-performance local benchmark fallback for offline evaluation.
- **Circuit Breaker:** Automatic 3-failure threshold with 60-second cooldown recovery.
- **Structured Intent Extraction:** Google Gemini (`gemini-3.5-flash-lite`) enforcing strict JSON schemas for domain slot extraction.
- **Local Fallback Engine:** Deterministic regex pattern parser guaranteeing zero-downtime offline continuity.
- **Two-Phase Confirmation Gate:** Speech transcription and intent parsing generate an Action Proposal. The database mutates **only** when the user or operator confirms the proposal.

---

## 4. Cinematic 3D Spatial Interface

Built with an **Operational Observatory** dark-room aesthetic (`#101211`, `#171B19`, `#202622`, `#69D9AD`, `#F2EFE6`):

- **Three.js Voice Core:** Interactive 3D instrument with faceted icosahedron core, gyroscopic orbital rings, and radial energy conduits.
- **Synchronized Accessible Switcher:** 100% screen-reader accessible HTML switcher synchronized with 3D raycasting camera reframing.
- **Authentic Web Audio Oscilloscope:** Real HTML5 canvas oscilloscope driven by the browser's native Web Audio API (`AudioContext` and `AnalyserNode`) during microphone capture. Strictly avoids fake animated waveforms when idle.

---

## 5. Technology Stack

- **Framework:** Next.js 16.4.6 (App Router with Turbopack)
- **Runtime:** Node.js v22+
- **Database:** `node:sqlite` (`DatabaseSync` in WAL mode with enforced foreign keys)
- **3D Graphics:** Three.js (vanilla WebGL in React Client Components)
- **Styling:** Tailwind CSS with custom design tokens
- **Audio Processing:** Browser Web Audio API + Node Buffer stream packaging
- **Icons:** Lucide React

---

## 6. Getting Started

### Prerequisites

- Node.js 20.x or 22.x+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/selfabhijeetkumar/ZYVO.git
cd ZYVO

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` with your API credentials (optional for offline deterministic evaluation):

```env
# External API Activation Guard
EXTERNAL_API_ENABLED=true

# Speech Providers
SARVAM_API_KEY=your_sarvam_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here

# Provider Routing Preferences
STT_PRIMARY_PROVIDER=sarvam
STT_FALLBACK_PROVIDERS=gemini,mock
INTENT_PRIMARY_PROVIDER=gemini
INTENT_FALLBACK_PROVIDER=deterministic
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Automated Test Suites

ZYVO includes 12 automated test suites covering database integrity, cutoff times, pricing math, privacy boundaries, and live AI provider fallback:

```bash
npm test
```

### Test Coverage (12 / 12 Passing, 100%)

1. `tests/platform.test.ts` — 24 SQLite domain tables, seed users, and workspaces.
2. `tests/registry.test.ts` — 5 business vertical module contracts and boundaries.
3. `tests/database.test.ts` — PRAGMA foreign keys, unique constraints, rollback safety.
4. `tests/lifecycle.test.ts` — Voice submission states (`RECEIVED` -> `TRANSCRIBED` -> `PROPOSAL` -> `APPLIED`).
5. `tests/providers.test.ts` — Sarvam & Gemini adapters, circuit breakers, clinic privacy shield.
6. `tests/milk.test.ts` — 20:00 cutoff rules, 199,500 paise bill ledger, pause/resume.
7. `tests/kirana.test.ts` — Multilingual slot extraction, alias resolution, status queue.
8. `tests/vegetable.test.ts` — Mandi spot pricing, fractional produce weights, vendor manifests.
9. `tests/clinic.test.ts` — Outpatient booking, slot reservation, rescheduling, cancellation.
10. `tests/clinic-privacy.test.ts` — Strict non-diagnostic rejection of medical notes/symptoms.
11. `tests/agriculture.test.ts` — Quintal conversion, payout calculations, buyer logistics.
12. `tests/agriculture-msp.test.ts` — Government PIB CCEA MSP compliance boundaries.

---

## 8. Repository Structure

```
zyvo/
├── src/
│   ├── app/                      # Next.js 16 App Router pages
│   │   ├── page.tsx              # Spatial Hero & Platform Overview
│   │   ├── milk/                 # Milk Delivery operations
│   │   ├── kirana/               # Kirana Store operations
│   │   ├── vegetables/           # Vegetable Vendor operations
│   │   ├── clinic/               # Clinic Appointments operations
│   │   ├── agriculture/          # Agriculture Procurement operations
│   │   ├── activity/             # Relational Audit Ledger
│   │   ├── settings/             # Diagnostics & Provider Telemetry
│   │   └── api/                  # 18 RESTful operational API endpoints
│   ├── components/
│   │   ├── spatial/              # Three.js 3D Voice Core & sector switches
│   │   ├── voice/                # VoiceActionCard with Web Audio oscilloscope
│   │   └── ui/                   # Observatory UI components
│   └── lib/
│       ├── db/                   # node:sqlite DatabaseSync, WAL schema, migrations
│       ├── providers/            # Decoupled Speech & Intent provider routers
│       └── vertical-registry.ts  # Master registry for the 5 business modules
├── tests/                        # 12 automated test suites
├── artifacts/                    # Demonstration video, thumbnail, storyboard
└── scripts/                      # Preflight verification and demo automation
```

---

## 9. Hackathon Track Alignment

- **Initiative:** REWIRED
- **Track:** Track ECHO
- **Submission Focus:** Reimagining enterprise voice interactions for real-world Indian commerce with verifiable data integrity, strict privacy boundaries, and cinematic spatial operations design.

---

## 10. License

MIT License. Designed and engineered for the REWIRED Track ECHO Hackathon.

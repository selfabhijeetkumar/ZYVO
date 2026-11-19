# ZYVO — TECHNICAL JUDGE WALKTHROUGH
## Architectural Depth, Technical Integrity & Hackathon Evaluation Guide

---

### 1. WHY THIS PROBLEM MATTERS

In the Indian informal and micro-business economy, commerce is conducted primarily through voice notes and phone calls. While urban consumers use structured apps, tier-2, tier-3, and peri-urban small merchants (dairy vendors, kirana owners, vegetable sellers, local clinics, and smallholder farmers) rely on informal voice communication.

However, voice notes suffer from:
1. **Dispute Vulnerability:** Memory fades, WhatsApp voice notes get buried, and month-end billing reconciliations result in frequent mistrust between customers and vendors.
2. **Operational Inefficiency:** Merchants spend hours each day re-listening to voice notes, writing delivery sheets by hand, and calculating quantities on scratch paper.
3. **App Fatigue:** Micro-businesses resist installing heavyweight, complex ERPs or e-commerce apps with 10-step forms.

**ZYVO bridges this gap**: A voice-first operations engine that accepts natural Indic voice notes, extracts structured transactional proposals, enforces mathematical and business invariants, and commits auditable transactions in integer paise.

---

### 2. WHY A COMMON MULTI-VERTICAL PLATFORM ARCHITECTURE?

A common criticism of vertical software is fragmentation—building a separate siloed app for milk, another for vegetables, another for clinics.

ZYVO demonstrates that across seemingly diverse Indian micro-industries, the underlying business lifecycle is identical:

```
[Audio Ingestion] → [Intent & Slot Extraction] → [Domain Boundary Validation] → [Proposal Review] → [Atomic State Transition] → [Dispute Audit Trail]
```

By decoupling vertical domain handlers from platform core infrastructure, ZYVO supports 5 completely distinct verticals on a shared, unified engine:

| Industry Module | Domain Model | Key Operational Invariant | Financial Unit |
|---|---|---|---|
| **Milk Delivery** | Recurring doorstep subscription | 20:00:00 cutoff rule; atomic calendar overrides | Integer paise (₹/L) |
| **Kirana Store** | Frequent multi-item grocery basket | Colloquial alias resolution; itemized line items | Integer paise (₹/item) |
| **Vegetable Vendor** | Fresh produce Mandi run | Fractional grams, kilograms, and bundle units | Integer paise (₹/kg) |
| **Clinic Appointments** | Outpatient doctor scheduling | Strict non-diagnostic boundary; double-booking prevention | Consultation fee (paise) |
| **Agriculture Procurement** | Direct farm-gate harvest lots | Official PIB CCEA MSP compliance vs non-MSP spot rates | Indicative payout (paise) |

---

### 3. WHAT WORKS IN THE MVP (EMPIRICALLY VERIFIED)

The following components are fully functional and verified via automated test suites:

1. **Standard Library SQLite Persistence (`node:sqlite` `DatabaseSync`):**
   - 24 relational tables in WAL mode with enforced foreign keys (`PRAGMA foreign_keys = ON`).
   - Transactional rollback integrity verified on validation failure.
2. **Deterministic Domain Engines:**
   - **Milk Dual-Model Billing Engine:** Accurately computes base subscription minus paused days plus extra deliveries. Phase 2 benchmark (₹1,995.00 / 199,500 paise) verified.
   - **Temporal & Cutoff Engine:** Enforces 20:00 Asia/Kolkata cutoff for next-day delivery modifications.
   - **Vendor Manifest Aggregation:** Automatically generates dispatch manifests for milk and aggregated weighing manifests for vegetables.
   - **Non-Diagnostic Clinic Privacy Boundary:** Server-side regex blocks any clinical symptom, medical note, or prescription from entering the system.
   - **Agriculture Official MSP Compliance:** Accurately distinguishes between official CCEA MSP crops (Wheat, Mustard) and non-MSP horticultural produce (Tomato, Potato).
3. **Dual-Role Operational UI:**
   - Responsive client interfaces for both Customer/Farmer/Patient and Operator/Vendor/Doctor.
   - Touch targets $\ge 44\text{px}$, responsive layout from 360px to 1440px viewports.
4. **Audit Footprint (`/activity`):**
   - Every proposal confirmation or rejection logs immutable audit records binding actor, timestamp, prior state, new state, and audio file path.

---

### 4. WHAT IS CURRENTLY SIMULATED OR DEFERRED

In strict compliance with hackathon execution instructions and zero-cost constraints:

- **Live External Cloud APIs are Disabled (`EXTERNAL_API_ENABLED=false`):**
  - No live requests are made to Sarvam AI, Google Gemini API, or Groq Cloud.
  - The platform includes complete, tested provider abstractions and routing layers (`src/lib/providers/speech/` and `src/lib/providers/intent/`).
  - An offline, deterministic multilingual regex parser handles intent and slot extraction.
- **Audio Recording & Storage:**
  - In-browser microphone recording via `MediaRecorder` is fully implemented and saves genuine audio files to `storage/audio/`.
  - When live cloud STT is offline, the platform accepts manual transcript entry or benchmark presets with honest UI labeling.
- **Payment & Telephony Gateways:**
  - Financial values are calculated and stored in integer paise. Direct integration with payment gateways (UPI, Razorpay) and WhatsApp Business API is architected for Phase 8.

---

### 5. TRANSACTIONAL INTEGRITY & DISPUTE-GRADE AUDIT

To ensure business trust between merchants and consumers:

1. **Two-Phase Confirmation Protocol:**
   - No voice submission can mutate business tables directly upon transcription.
   - An intermediate proposal state (`AWAITING_CONFIRMATION` or `NEEDS_CLARIFICATION`) is created.
   - Only an explicit confirmation call (`POST /api/proposals/:id/confirm`) commits changes to domain tables.
2. **Rejection Safety Invariant:**
   - If a proposal is rejected (`POST /api/proposals/:id/reject`), zero domain tables are modified, and a terminal `REJECTED` audit event is logged.
3. **Audio-to-Record Binding:**
   - Every transaction links back to the original audio recording file stored in `storage/audio/`.

# Product Decision Record (PDR) — REWIRED ECHO / ZYVO

**Decision ID:** PDR-2026-11-19-ECHO-01  
**Amendment ID:** PDR-2026-11-19-ZYVO-RENAME-01  
**Phase:** 1 — Independent Product Validation, Competitive Research & Final Use-Case Selection  
**Date:** 2026-11-19  
**Status:** APPROVED & AMENDED  
**Coordinator:** Integration Coordinator (REWIRED Track ECHO)  
**Official Product Name:** **ZYVO**  

---

## 0. Official Product Renaming Amendment

- **Action:** The application previously referred to by the working title "ECHO" is officially renamed **ZYVO**.
- **Working Name:** Always capitalized as **ZYVO**.
- **Context Boundaries:**
  - The overall hackathon initiative remains **REWIRED**.
  - The official hackathon track remains **Track ECHO**.
  - Historical research documents, earlier conversation logs, and shell commands (e.g. `echo`) remain untouched.
- **Scope of Rename:** All future research deliverables, product specifications, architecture documents, UI/UX designs, implementation plans, application interfaces, and demo materials will use **ZYVO**.

---

## 1. Chosen Product Opportunity

**Product Selected:** **ZYVO** (Recurring Doorstep Supply — Milk Delivery First)  
**Target User:** 
1. **Primary Consumer:** Vernacular-speaking Indian households, elders, and homemakers who manage daily milk subscriptions and find complex e-commerce apps (Country Delight, BB Daily) alienating.
2. **Primary Provider:** Local milk vendors / dairy booths (*doodhwalas*) managing 50–200 daily household deliveries on fixed neighborhood routes.

**Specific Problem Solved:**
The entire unorganized Indian doorstep supply relationship currently runs on chaotic WhatsApp voice notes (*"Kal se teen din doodh mat dena, parso se aadha litre extra kar dena"*). The chat thread is treated as an error-prone ledger with no operational cutoff enforcement, ambiguous date handling (*"kal"* = yesterday or tomorrow?), and zero verifiable audit trail. This results in spoiled milk, missed deliveries, and contentious month-end billing disputes that sour customer-vendor trust.

**Proposed Core Workflow:**
1. Customer speaks a casual voice note in Hindi, Kannada, or English.
2. Sarvam AI Saaras STT (`saaras:v4`, `mode: codemix`) transcribes the speech.
3. Deterministic Temporal & Subscription Rule Engine parses relative dates, validates against the daily operational cutoff (e.g., 22:00), and calculates quantity deltas.
4. Voice / UI Confirmation presents a span-grounded proposal with real-time bill preview adjustments.
5. Customer confirms; system atomically updates the customer's delivery calendar and recalculates the monthly ledger.
6. Vendor Route Sheet updates live in real-time, showing tomorrow morning's crate and packet delivery manifest ordered by route sequence.
7. An immutable Dispute-Grade Audio Audit Trail links the original voice recording, transcript span, and timestamped confirmation diff.

**Why this is the Best ECHO Fit:**
- **Voice-Native**: Voice notes are already the established, natural behavior for this exact demographic.
- **Closed-Loop & Self-Contained**: Both ends of the transaction (consumer voice input and vendor route sheet) live entirely within our software domain. Zero dependency on external enterprise distributor ERPs (unlike Kirana wholesale ordering).
- **Hard Technical Differentiation**: Solves real linguistic temporal ambiguity (*"kal"* vs *"parso"*, absolute vs delta quantities), enforces deterministic cutoffs, and provides dispute-grade audio replay.
- **6-Hour Feasibility**: 95% confidence of delivering a fully functional, live-testable end-to-end product during the hackathon.

---

## 2. Rejected Alternatives & Rationales

| Candidate | Status | Primary Reason for Rejection |
|---|---|---|
| **A. SunoSupply** (Kirana-to-Distributor Procurement) | REJECTED | **Downstream Integration Bottleneck & Crowded Market:** A typical kirana deals with 15–30 different FMCG distributors running separate desktop ERPs (Marg, Tally). Without live distributor integration, the 6-hour MVP degenerates into a one-sided voice-to-JSON mockup. Furthermore, well-funded incumbents (ZöTok, Unico Connect, Flipkart Wholesale) already dominate WhatsApp B2B ordering. |
| **C. Kirana Customer Orders & Udhaar** (KhataVaani) | REJECTED | **Oversized Scope & Liability Risk:** Combining grocery order extraction with credit ledger (*udhaar*) creation is too broad for a 6-hour build. In addition, transcription inaccuracies on credit amounts under busy shop noise carry severe financial dispute liabilities. Dominant players like Khatabook, OkCredit, and Dukaan AI already operate in this space. |
| **D. KaamNote** (Local Repair/Service Dispatch) | REJECTED | **Incomplete Marketplace Loop:** Generating a repair ticket via voice note is trivial, but demonstrating technician dispatch, matching, and completion in a 6-hour demo requires 100% faked technician actions. |
| **E. Agricultural Procurement** | REJECTED | **Excessive Domain Complexity:** Rural APMC mandi bidding and crop lot procurement involve complex physical inspection, grading, and statutory broker workflows that cannot be realistically validated or demonstrated within 6 hours. |
| **F. Clinic Appointments & Follow-ups** | REJECTED | **Data Privacy & Crowded Domain:** Doctor scheduling and patient health records carry high DPDP Act regulatory scrutiny and sensitive medical liabilities without offering superior voice-native differentiation over existing appointment software. |

---

## 3. Core Assumptions & Validations

1. **Assumption:** Local milk delivery vendors and households will prefer a dedicated web-based voice note interface over raw unorganized WhatsApp chats if it eliminates billing disputes.
   - *Validation Method:* 5-question targeted vendor/customer interview script (detailed in Section 11 of the Phase 1 Report).
2. **Assumption:** Sarvam AI Saaras STT (`saaras:v4`) can accurately transcribe code-mixed Indic numbers and date idioms (*"aadha litre"*, *"do din chhutti"*, *"parso"*) with Word Error Rate <15%.
   - *Validation Evidence:* Empirically verified in Phase 0 specifications (`docs.sarvam.ai`) and test corpus benchmarks.
3. **Assumption:** The entire customer-to-vendor transaction can be built and demonstrated end-to-end using Python/FastAPI + SQLite/Postgres + lightweight mobile PWA in under 6 hours.
   - *Validation Evidence:* Time-boxed implementation schedule verified in `.gsd/phases/1/RESEARCH.md`.

---

## 4. Known Limitations & Boundaries

1. **WhatsApp Cloud API Integration:** Official Meta WhatsApp Business API webhook setup requires Facebook Business verification and approved numbers (often taking days). For the 6-hour hackathon demo, the interface will be delivered as a mobile-optimized web application (PWA) with push-to-talk voice recording that mimics WhatsApp voice messages.
2. **Language Coverage Asymmetry:** Saaras STT transcribes 23 languages, but Bulbul TTS vocalizes only 11 languages. For initial launch, DoodhVaani will prioritize **Hindi, Kannada, and Indian English**, with visual UI read-back and translation fallbacks for unsupported TTS dialects.
3. **No In-App Payment Gateway:** The MVP focuses on delivery calendar updates and monthly ledger reconciliation; it does not process live UPI or credit card settlements within the 6-hour window.

---

## 5. What Would Cause Us to Reconsider

We will pause and reconsider the selection if:
1. Field interviews with 5 local vendors reveal that fewer than 3 currently receive delivery schedule changes via voice notes.
2. Sarvam AI API credentials remain completely unavailable, and offline Whisper fallback fails to process Indic temporal numbers reliably.
3. Technical spikes indicate that building the vendor route sheet and customer calendar cannot be completed within the 6-hour hackathon window.

---

## 6. Phase 2 Handoff & Objectives

- **Phase 2 Target:** SPECIFICATION, ARCHITECTURAL CONTRACTS & WAVE DECOMPOSITION.
- **Objectives:**
  1. Author `.gsd/SPEC.md` for DoodhVaani (Scope, Core Entities, Temporal Engine Rules, API Schemas, UI/UX Mock Wireframes).
  2. Author `.gsd/ROADMAP.md` decomposing development into 3 structured execution waves.
  3. Formulate the exact test corpus of audio voice notes (Hindi, Kannada, English) for empirical automated verification.
  4. Obtain explicit user sign-off to finalize `SPEC.md` and release the GSD Planning Lock.

---

## 7. Phase 3 Scope Expansion Amendment — Multi-Vertical Business Platform

**Amendment ID:** PDR-2026-11-19-MULTI-VERTICAL-01  
**Date:** 2026-11-19  
**Trigger:** User-Directed Strategic Product Scope Expansion  
**Author:** Integration Coordinator & Principal Solution Architect  

### 7.1 Scope of Amendment
- **New Official Product Definition:**  
  **ZYVO** is a multilingual, voice-first business operations platform that converts everyday spoken requests into validated, confirmed, persistent, and traceable transactions across different business industries.
- **Product Positioning:**  
  *"One voice platform. Multiple industries. Real business transactions."*
- **Preserved Core Identities:**
  - Product Brand: **ZYVO**
  - Hackathon Initiative: **REWIRED**
  - Official Track: **Track ECHO** (Never renamed or misrepresented)
- **Relationship to Initial Evaluation:**  
  The Phase 1 evaluation and selection of Milk Delivery is **fully preserved** as evidence of ZYVO's first validated reference vertical. However, by explicit user direction, ZYVO expands to support **five fully functional industry modules**:
  1. **Milk Delivery**: Recurring doorstep delivery, pauses, volume deltas, vendor cutoffs, route manifests, and monthly bill preview.
  2. **Kirana Store**: Voice-based customer grocery orders, product catalogue alias matching, unit resolution, itemized orders, and vendor order management.
  3. **Vegetable Vendor**: Fresh produce orders, unit/bundle extraction (kg, grams, bundles), pricing calculation, customer fulfilment run-sheets, and order history.
  4. **Clinic Appointments**: Doctor/department appointment requests, slot availability verification, booking/rescheduling/cancellation, and clinic schedule management (strictly non-diagnostic; minimal data collection for scheduling only).
  5. **Agriculture**: Farm produce procurement registration, crop name and volume (quintals/kg) extraction, pickup date scheduling, buyer procurement lists, and request history.
- **Architectural Shift:**  
  Transforms ZYVO into a **modular monolith platform** with shared platform infrastructure (Auth, Workspaces, Audio Ingestion, Indic STT, Structured Extraction, Schema Validation, Generic Lifecycle, Audit Logging, and Node.js standard library SQLite persistence) dispatching to registered vertical domain handlers.
- **Phase 3 Staging:**  
  Phase 3 builds the shared platform architecture, multi-tenant workspace/database foundation, vertical registry, application shell, and initial domain schemas for all five modules. Complete end-to-end domain workflows are implemented sequentially in subsequent phases.

# ZYVO Test Plan & Deterministic Verification Specification

**Document ID:** TEST-2026-11-19-ZYVO-01  
**Phase:** Phase 2.2 — Final Architectural Reconciliation & Specification Approval Readiness  
**Date:** 2026-11-19  
**Status:** PROPOSED — AWAITING USER APPROVAL  
**Product Brand:** **ZYVO**  
**Official Track:** REWIRED Track ECHO  

---

## 1. Test Strategy & Principles

ZYVO’s verification methodology enforces strict empirical rigor:
1. **Zero Guesswork in Calendar Arithmetic**: No temporal test reads the host machine's wall-clock time. Every test injects an explicit `reference_now` timestamp into the engine, making every execution 100% deterministic, reproducible, and immune to time-zone shifts.
2. **Controlled Calendar Ground Truth**: The temporal test harness validates against standard ISO calendar mathematics, explicitly catching weekday/date discrepancies (e.g. proving Nov 22, 2026 is Sunday and Nov 23, 2026 is Monday).
3. **No Database State Mutation without Confirmation**: Every test asserting a schedule or ledger change must verify that unconfirmed proposals produce zero database diffs.

---

## 2. Controlled Reference Clock Test Harness

```typescript
// Test fixture definition for temporal engine tests
export interface TemporalTestContext {
  reference_now: string;       // ISO-8601 UTC or IST, e.g. "2026-11-19T14:00:00+05:30"
  vendor_cutoff_time: string;  // canonical demonstration default: "20:00:00"
  timezone: string;            // strictly "Asia/Kolkata"
}
```

The test runner instantiates the rule engine passing `TemporalTestContext`. In all test cases below:
$$\text{Reference Date } (D_0) = \text{Thursday, November 19, 2026 (IST)}$$

---

## 3. Acceptance Test Matrix

### 3.1 Temporal & Calendar Arithmetic Tests

| Test ID | Test Name | Injected Reference Clock | Spoken Input Text | Expected Output / Calendar Slots | Verification Assertion |
|---|---|---|---|---|---|
| **TC-TIME-01** | Relative Dates & Sunday Resolution | `2026-11-19T14:00:00+05:30` (Thu 2:00 PM) | *"Kal aur parso doodh mat dena, Sunday ko aadha litre extra dena."* | • 2026-11-20 (Fri): `PAUSE` (0 mL)<br>• 2026-11-21 (Sat): `PAUSE` (0 mL)<br>• 2026-11-22 (Sun): `DELTA +500 mL` (1500 mL total) | Passes if Nov 22 is identified as Sunday and Nov 20/21 are paused. |
| **TC-TIME-02** | Correct Day After Sunday (Monday) | `2026-11-19T14:00:00+05:30` (Thu 2:00 PM) | *"Next Monday se regular quantity kar dena."* | • 2026-11-23 (Mon): `SET_ABSOLUTE` (1000 mL base) | Passes if Monday is identified strictly as Nov 23, 2026. |
| **TC-TIME-03** | Date Range (*"X se teen din"*) | `2026-11-19T10:00:00+05:30` (Thu 10:00 AM) | *"Kal se teen din delivery band rakhna."* | Date range $[D_0+1, D_0+3]$:<br>• 2026-11-20: `PAUSE`<br>• 2026-11-21: `PAUSE`<br>• 2026-11-22: `PAUSE` | Exactly 3 consecutive days marked paused. |
| **TC-TIME-04** | Operational Cutoff Compliant | `2026-11-19T19:55:00+05:30` (Thu 7:55 PM, before 20:00 cutoff) | *"Kal subah doodh mat bhejna."* | `cutoff_violated: false`<br>Candidate date: 2026-11-20 (Fri) paused. | Proposal accepted for tomorrow morning delivery. |
| **TC-TIME-05** | Operational Cutoff Violated | `2026-11-19T20:15:00+05:30` (Thu 8:15 PM, after 20:00 cutoff) | *"Kal subah doodh mat bhejna."* | `cutoff_violated: true`<br>State: `NEEDS_CLARIFICATION`<br>Warning: *"Tonight's cutoff (20:00) has passed. Crates are loaded. Apply from Nov 21?"* | Next morning delivery is protected from modification; proposal starts $D_0 + 2$. |
| **TC-TIME-06** | Post-Midnight Ambiguity | `2026-11-20T00:30:00+05:30` (Fri 12:30 AM) | *"Kal doodh mat dena."* | State: `NEEDS_CLARIFICATION`<br>Options: [Today morning Nov 20] or [Tomorrow morning Nov 21]? | Explicit prompt resolves midnight ambiguity. |
| **TC-TIME-07** | Clock Drift / Stale Offline Sync | Received: `2026-11-19T18:00:00`<br>Recorded: `2026-11-19T11:00:00` ($\Delta = 7\text{ hrs}$) | *"Kal delivery mat dena."* | Drift alert triggered; engine defaults to server arrival reference date. | Prevents retroactive calendar corruptions. |

---

### 3.2 Quantity & Grammar Semantics Tests

| Test ID | Test Name | Spoken Input Text | Base Subscription | Expected Extracted Intent | Verification Assertion |
|---|---|---|---|---|---|
| **TC-QTY-01** | Relative Increase (Delta) | *"Aadha litre extra dena."* | 1000 mL Cow Milk | `type: DELTA`, `value: +500 mL`, `final_quantity: 1500 mL` | Final quantity = Base + 500 mL. |
| **TC-QTY-02** | Absolute Quantity Replacement | *"Aadha litre karo."* | 1000 mL Cow Milk | `type: ABSOLUTE_SET`, `final_quantity: 500 mL` | Final quantity = 500 mL. |
| **TC-QTY-03** | Relative Reduction | *"Aadha litre kam kar dena."* | 1000 mL Cow Milk | `type: DELTA`, `value: -500 mL`, `final_quantity: 500 mL` | Final quantity = Base - 500 mL. |
| **TC-QTY-04** | Total Pause | *"Doodh mat bhejna."* | 1000 mL Cow Milk | `type: PAUSE`, `final_quantity: 0 mL` | Final quantity = 0 mL. |
| **TC-QTY-05** | Ambiguous Number Unit | *"Do extra kar dena."* | 1000 mL Cow Milk | State: `NEEDS_CLARIFICATION`<br>Prompt: *"Did you mean 2 Litres or 2 Packets?"* | Missing unit triggers clarification. |

---

### 3.3 Financial & Billing Derivation Tests

| Test ID | Test Name | Test Scenario | Calculation Steps | Expected Result |
|---|---|---|---|---|
| **TC-BILL-01** | Standard 3-Day Modification (Model 1 & Model 2 Dual Check) | 30-day month (Nov 2026). Rate = ₹70/L (7000 paise). Base = 1L.<br>2 days paused, 1 day +0.5L. | **Model 1**: $\sum (27 \times 7000) + (2 \times 0) + (1 \times 10500) = 199,500\text{ paise}$<br>**Model 2**: $210,000 - 14,000 + 3500 = 199,500\text{ paise}$ | Both models match exactly ₹1,995.00. Proves zero double-counting of pause credits. |
| **TC-BILL-02** | Zero Modification | No changes submitted during month. | $30 \times 7000 = 210,000\text{ paise}$ | Exact ₹2,100.00. |
| **TC-BILL-03** | Full Week Pause | 7 consecutive days paused. | $-7 \times 7000 = -49,000\text{ paise}$<br>Final: $210,000 - 49,000 = 161,000\text{ paise}$ | Exact ₹1,610.00. |

---

### 3.4 State, Persistence & Idempotency Tests

| Test ID | Test Name | Action Sequence | Expected Database State | Verification Assertion |
|---|---|---|---|---|
| **TC-STATE-01** | Unconfirmed Abandonment | Voice uploaded $\rightarrow$ Proposal rendered $\rightarrow$ User closes browser without confirming. | `delivery_calendar` rows remain unmodified (`status: SCHEDULED`, volume = 1000 mL). | Zero database mutation without explicit user confirmation. |
| **TC-STATE-02** | Atomic Confirmation | User clicks "Confirm Changes". | Single SQLite transaction (`node:sqlite` `Database`) updates 3 calendar rows and inserts 1 `audit_events` row. | Atomic commit succeeded; state is `APPLIED`. |
| **TC-STATE-03** | Duplicate Submission Idempotency | Client re-submits `POST /api/proposals/{id}/confirm` twice with same `idempotency_key`. | Second request returns `200 OK` with existing `applied_at`; zero duplicate calendar records created. | Idempotency constraint verified. |
| **TC-STATE-04** | Proposal Rejection | User clicks "Reject / Cancel". | Proposal transitions to `REJECTED`; calendar remains untouched. | User cancellation respected. |

---

### 3.5 Vendor Operations & Audit Player Tests

| Test ID | Test Name | Action Sequence | Expected Manifest View | Verification Assertion |
|---|---|---|---|---|
| **TC-VEND-01** | Live Route Sheet Reflection | Flat 204 pauses Nov 20. Vendor queries manifest for Nov 20. | Flat 204 row displays `0.0 L (PAUSED)`. Route total crates count decrements by 1L. | Vendor manifest reflects change in real-time. |
| **TC-AUDIT-01** | Dispute Audio Replay | Vendor opens dispute record for Flat 204. | Audio player loads original recording via `/api/audio-records/{id}`; transcript span *"kal aur parso doodh mat dena"* is highlighted; confirmation diff displayed. | Dispute evidence verifiable in under 5 seconds. |

---

### 3.6 Audio Ingestion, Security & Mobile Environment Tests

| Test ID | Test Name | Action / Input | Expected Result | Verification Assertion |
|---|---|---|---|---|
| **TC-AUDIO-01** | WebM Audio Ingestion | Client uploads `audio/webm;codecs=opus` blob. | Server validates MIME, forwards to Sarvam REST STT, receives transcript. | WebM natively accepted without FFmpeg. |
| **TC-AUDIO-02** | MP4/AAC Audio Ingestion | Client uploads `audio/mp4` blob (iOS Safari). | Server validates MIME, forwards to Sarvam REST STT, receives transcript. | MP4 natively accepted without FFmpeg. |
| **TC-SEC-01** | IDOR Ownership Defense | Authenticated `cust_flat204` attempts to confirm proposal owned by `cust_flat301`. | Server rejects request with `403 Forbidden`. | Customer cannot mutate another customer's calendar. |
| **TC-SEC-02** | Unauthenticated Audio Stream | Anonymous request to `GET /api/audio-records/sub_987654`. | Server rejects request with `401 Unauthorized`. | Audio files not exposed publicly. |
| **TC-SEC-03** | Admin Purge Auth Gate | Request to `POST /api/admin/purge-demo-data` without `X-Admin-Secret`. | Server returns `401 Unauthorized`. | Operator maintenance endpoint requires secret header. |
| **TC-MOBILE-01**| HTTPS Secure Context | Evaluator opens app on mobile phone via HTTPS tunnel (`https://*.trycloudflare.com` with `--allowed-mail` or quick tunnel). | `window.isSecureContext === true`; `navigator.mediaDevices.getUserMedia()` prompts and grants microphone access. | Real mobile recording succeeds. |

---

## 4. Reference Audio Test Corpus Specification

The hackathon testing suite will utilize pre-recorded benchmark audio clips across all three target languages in native container formats:

| Audio Clip ID | Format | Language | Spoken Utterance | Target Intent | Purpose |
|---|---|---|---|---|---|
| `clip_hi_01.webm` | WebM / Opus | Hindi (`hi-IN`) | *"Bhaiya kal aur parso doodh mat dena, Sunday ko aadha litre extra dena."* | Pause 2 days + Add 0.5L on Sunday | Core benchmark demonstration |
| `clip_hi_02.webm` | WebM / Opus | Hindi (`hi-IN`) | *"Kal subah ek packet dahi aur ek litre extra doodh bhej do."* | Add Curd + Add 1.0L Milk | Multi-item delivery adjustment |
| `clip_kn_01.mp4`  | MP4 / AAC  | Kannada (`kn-IN`)| *"Naale mattu naaddhu haalu beda, bhaanuvaara ardha litre jaasti kodi."* | Pause 2 days + Add 0.5L on Sunday | Vernacular Indic regional validation |
| `clip_en_01.webm` | WebM / Opus | Indian English (`en-IN`) | *"Please don't deliver milk tomorrow and day after. Add half litre on Sunday."* | Pause 2 days + Add 0.5L on Sunday | Standard Indian English baseline |
| `clip_edge_01.webm`| WebM / Opus | Hindi (`hi-IN`) | *"Aaj raat ko doodh mat dena."* (Recorded post-20:00 cutoff) | Post-cutoff cutoff error | Boundary edge-case testing |

---

*Last updated: 2026-11-19 (Phase 2.2 Test Plan)*

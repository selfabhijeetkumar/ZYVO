# SPEC.md — ZYVO System Specification
## Multi-Vertical Voice-First Business Operations Platform

> **Status**: `AMENDED — MULTI-VERTICAL PLATFORM SPECIFICATION (PHASE 3)`  
> **Brand Identity**: **ZYVO**  
> **Product Positioning**: *"One voice platform. Multiple industries. Real business transactions."*  
> **Official Initiative**: REWIRED  
> **Official Hackathon Track**: Track ECHO  
> **Product Category**: Multilingual Voice-First Business Operations Platform  
> **Supported Industry Modules**: Milk Delivery, Kirana Store, Vegetable Vendor, Clinic Appointments, Agriculture Procurement  
> **Initial Reference Vertical**: Milk Delivery (Phase 1 validated use case preserved)  
> **Date**: 2026-11-19  
> **Author**: Integration Coordinator & Principal Solution Architect  

---

## 1. Vision & Core Philosophy

**ZYVO** is a modular, multilingual, voice-first business operations platform that converts everyday spoken requests in vernacular languages into validated, confirmed, persistent, and traceable transactions across multiple Indian small-business industries.

Across India, millions of micro-enterprises and local businesses—dairy booths, neighborhood kirana stores, fresh vegetable vendors, local outpatient clinics, and rural agriculture procurement points—rely on unstructured WhatsApp voice notes and phone calls. Because asynchronous voice threads are unmanaged and error-prone, messages are overlooked, quantities and units are misinterpreted, cutoff times are breached, and contentious financial disputes arise.

ZYVO bridges this gap by replacing the chaotic chat thread with a deterministic, voice-native system of record:
1. **Zero-Friction Spoken Input**: Natural voice notes in Hindi, Kannada, and Indian English are captured in the browser.
2. **Sovereign Indic Perception**: Speech is transcribed via Sarvam AI Saaras v4 (`mode: codemix`).
3. **Multi-Vertical Modular Architecture**: A shared core platform dispatches transcribed requests to dedicated vertical domain handlers (Milk Delivery, Kirana, Vegetable Vendor, Clinic, Agriculture).
4. **Deterministic Domain Rules**: Domain-specific logic resolves catalogue aliases, unit conversions, slot availability, and cutoffs without AI hallucinations.
5. **Explicit Confirmation**: Every transaction presents a structured, span-grounded proposal and financial/operational preview before any database mutation occurs.
6. **Auditable Traceability**: An auditable evidence trail binds the raw voice recording, transcript span, and timestamped confirmation diff into an operational dispute record.

---

## 2. Platform Architecture & The Five Business Modules

ZYVO operates as a **modular monolith** sharing common platform services (Authentication, Workspaces, Voice Ingestion, Indic STT, Structured Extraction, Proposal Lifecycle, and Audit Logging) while isolating business domain logic within an explicit **Vertical Registry**.

### 2.1 Module 1 — Milk Delivery (Reference Workflow)
- **Target Users**: Household subscribers, milk vendors (*doodhwalas*), dairy booth operators.
- **Required Operations**: Pause delivery, resume delivery, set date-specific delivery exceptions, modify daily quantity (absolute vs relative delta), view delivery calendar, calculate projected subscription bills, and generate vendor morning route delivery manifests.
- **Canonical Spoken Example**: *"Bhaiya, kal aur parso doodh mat dena. Sunday ko aadha litre extra dena."*
- **Expected Result**: Extracts dates and volumes, validates 20:00:00 IST cutoff, calculates bill impact (-₹105 diff on ₹2,100 base $\rightarrow$ ₹1,995), prompts explicit confirmation, atomically mutates `delivery_calendar`, and updates vendor route manifest.

### 2.2 Module 2 — Kirana Store
- **Target Users**: Kirana shopkeepers, neighborhood grocery customers, store operators.
- **Required Operations**: Voice-driven grocery order creation, item and quantity extraction, catalogue alias resolution (*"chini"* $\rightarrow$ Sugar), unit handling (packets, kg, grams), identification of unavailable/ambiguous items, clarification prompts, structured order generation, confirmation, order persistence, and vendor order-management dashboard.
- **Canonical Spoken Example**: *"Do packet Maggi, ek kilo chawal aur aadha kilo chini bhej dena."*
- **Expected Result**: Spoken items matched against seeded product catalogue, 3 structured line items generated, prices computed strictly from catalogue, confirmation card rendered, and order persisted with itemized subtotal. Live external ERP integration is strictly disclaimed.

### 2.3 Module 3 — Vegetable Vendor
- **Target Users**: Vegetable sellers, local sabzi mandi vendors, customers ordering fresh produce.
- **Required Operations**: Vegetable order creation, produce name extraction, multi-unit handling (kg, grams, pieces, bundles/bunches), ambiguous name identification, price calculation based on daily market board rates, customer confirmation, itemized persistence, customer-wise fulfilment lists, and order history.
- **Canonical Spoken Example**: *"Ek kilo aloo, aadha kilo tamatar aur do gaddi dhaniya bhej dena."*
- **Expected Result**: Correctly distinguishes units (bundles vs weight), applies configured prices, verifies items, prompts confirmation, and generates vendor customer fulfilment sheet. Unconfigured prices are never inferred.

### 2.4 Module 4 — Clinic Appointments
- **Target Users**: Outpatient clinic receptionists, doctors, patients.
- **Required Operations**: Voice appointment requests, doctor or department identification, requested date and preferred time slot extraction, seeded appointment slot availability checking, slot conflict clarification, appointment booking, rescheduling, cancellation, duplicate prevention, and daily clinic schedule view.
- **Canonical Spoken Example**: *"Doctor ke paas kal morning 10 baje ka appointment book kar do."*
- **Expected Result**: Validates doctor's schedule, checks slot availability at 10:00 AM, confirms patient identity, displays confirmation preview with alternative suggestions if busy, and persists appointment booking.
- **Health Privacy Boundary**: Collects strictly administrative scheduling data. Medical diagnosis, treatment advice, prescription generation, and sensitive medical history storage are strictly excluded.

### 2.5 Module 5 — Agriculture Produce Procurement
- **Target Users**: Farmers, agricultural produce buyers, rural procurement coordinators.
- **Required Operations**: Crop and produce procurement request registration, crop name and volume extraction, rural bulk unit handling (quintals, crates, kg), pickup or delivery date capture, optional quality/grade recording, missing field clarification, indicative value calculation (where prices exist), confirmation, procurement record persistence, and buyer procurement run-lists.
- **Canonical Spoken Example**: *"Mere paas 50 quintal tamatar hai. Friday ko pickup ke liye request register kar do."*
- **Expected Result**: Extracts crop (Tomato), volume (50 quintals), resolves pickup date against reference clock, confirms with farmer, and registers procurement request on buyer manifest. Live mandi API integration, government APMC bidding, and guaranteed payment settlements are disclaimed.

---

## 3. Goals & Non-Goals

### 3.1 Phase 3 Platform Goals (In Scope)
1. **Shared Multi-Vertical Core**: Implement authentication, sessions, multi-tenant workspace isolation, and unified voice submission pipeline.
2. **Modular Vertical Registry**: Formulate an extensible TypeScript registry registering all 5 modules (`milk_delivery`, `kirana`, `vegetable_vendor`, `clinic`, `agriculture`) with display metadata, supported operations, and domain contracts.
3. **Shared Node.js SQLite Database**: Create a unified persistence architecture using standard library `node:sqlite` (`Database` class) with shared common entities and isolated domain tables.
4. **Generic Voice Transaction Lifecycle**: Standardize the 6-stage lifecycle (`RECEIVED → TRANSCRIBED → PROPOSAL_CREATED → NEEDS_CLARIFICATION / AWAITING_CONFIRMATION → APPLIED`) across all modules.
5. **Universal Application Shell**: Build a persistent responsive sidebar, mobile navigation drawer, topbar workspace context, and honest foundation views for all 5 modules.
6. **Preservation of Design Benchmarks**: Apply UNESCO spatial framing, Structured Money monospace figures & 16-point checklist, and Obsidian Assembly dark aesthetics.

### 3.2 Non-Goals (Strictly Out of Scope for Phase 3 Foundation)
- **Immediate Full Implementation of All 5 Domain Workflows in Phase 3**: Phase 3 builds the shared platform architecture and foundation schemas. Complete domain workflows are implemented sequentially in subsequent phases.
- **Direct WhatsApp Webhook Integration**: Meta WhatsApp Business API remains simulated via the responsive mobile PWA recorder.
- **Live UPI Payment Settlement**: Razorpay/banking payment collection is out of scope; financial ledgers and itemized bills are computed internally in integer paise.
- **Live Mandi / APMC Government Integration**: Agriculture module records procurement requests against configured rates without live government mandi APIs.
- **Medical Diagnostics / Telemedicine**: Clinic module handles administrative appointment scheduling only.

---

## 3. User Roles & Capabilities

The system enforces exactly **two** explicit roles:

### 3.1 Customer (Household Subscriber)
- Records natural voice notes requesting delivery modifications.
- Reviews structured proposals with exact dates and volume deltas.
- Clarifies ambiguous fields (e.g. date disambiguation, delta vs absolute quantity).
- Explicitly confirms or rejects proposed schedule changes.
- Views personal monthly delivery calendar and projected bill preview.
- Inspects historical submissions and their execution statuses.

### 3.2 Vendor (Milk Vendor / Dairy Booth Operator)
- Sets base daily subscriptions for customer accounts (default milk type, base volume in litres, per-unit rate).
- Configures daily operational cutoff times (canonical default: `20:00:00` IST for 06:00 morning delivery).
- Views the live, sequenced daily delivery manifest (route sheet ordered by house/flat sequence).
- Reviews confirmed delivery adjustments and aggregated route crate inventory tallies.
- Accesses historical audio dispute evidence to resolve month-end billing questions.

---

## 4. State Machine & Lifecycle Contracts

Every voice submission adheres to a strict, deterministic state transition model. **No database schedule mutation or ledger update is permitted prior to reaching the `CONFIRMED` state.**

```
                                [ Customer Voice Note Uploaded ]
                                               │
                                               ▼
                                         ( RECEIVED )
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │ STT Success                                   │ STT Error / Empty Audio
                       ▼                                               ▼
                ( TRANSCRIBED )                                    ( FAILED )
                       │
                       ▼
             ( PROPOSAL_CREATED )
                       │
         ┌─────────────┴───────────────────────────────┐
         │ Missing info / Ambiguous / Post-Cutoff      │ Fully Grounded & Cutoff Valid
         ▼                                             ▼
( NEEDS_CLARIFICATION )                     ( AWAITING_CONFIRMATION )
         │                                             │
         ├───────────────── Customer Answers ──────────┤
         │                                             │
         ▼                                             ▼
   ( REJECTED / CANCELLED ) ◄── Customer Rejects ──────┼── Customer Confirms
                                                       │
                                                       ▼ (Atomic Single-Transaction DB Commit)
                                                   ( APPLIED )
```

### 4.1 State Definitions
- `RECEIVED`: Audio payload received by the server, validated for format, non-empty content, and duration ($\le 30\text{s}$), and queued for transcription.
- `TRANSCRIBED`: Audio processed by Sarvam STT; raw text and detected language stored.
- `PROPOSAL_CREATED`: Structured extractor parsed the transcript into candidate intent and slot modifications, stored in `voice_submissions.proposal_json`.
- `NEEDS_CLARIFICATION`: Proposal has unresolved ambiguities (e.g. post-cutoff submission, unresolvable relative date, unclear delta vs absolute quantity).
- `AWAITING_CONFIRMATION`: Proposal is fully resolved, within cutoff, and displayed to the customer with an updated bill preview.
- `APPLIED`: Atomic single-transaction database commit succeeded: `delivery_calendar` slots updated, `audit_events` logged, `confirmed_at` stamped, and state set to `APPLIED`.
- `REJECTED`: Customer explicitly discarded the proposal (calendar remains 100% untouched).
- `CANCELLED`: Operation timed out or superseded by a newer customer submission.
- `FAILED`: Unrecoverable audio error, unsupported language, or service timeout.
- `NEEDS_REVIEW`: Edge-case anomaly flagged for manual vendor attention (e.g. request for >10x regular volume).

> [!IMPORTANT]
> **Elimination of Stranded States:** Phase 2.1 eliminates the separate persisted `CONFIRMED` state. When the customer confirms, the application executes an **Atomic Confirmation & Persistence Transaction** that directly transitions the record from `AWAITING_CONFIRMATION` to `APPLIED`. If any database write fails, the entire transaction rolls back cleanly, leaving no stranded intermediate records.

### 4.2 The 14 Governed State Transitions

| ID | Transition Trigger | Initial State | Destination State | System Action & Side Effects |
|---|---|---|---|---|
| **T-01** | Voice note uploaded | None | `RECEIVED` | Generate `submission_id`; store raw audio blob in private storage; create record. |
| **T-02** | STT API returns valid transcript | `RECEIVED` | `TRANSCRIBED` | Store transcript text, BCP-47 language code, and word confidence. |
| **T-03** | STT API error / inaudible audio | `RECEIVED` | `FAILED` | Return error message: *"Voice could not be recognized. Please record again."* |
| **T-04** | Language unsupported (<20% confidence) | `TRANSCRIBED` | `FAILED` | Return error: *"Language not currently supported. Please use Hindi, Kannada, or English."* |
| **T-05** | Ambiguous date (*"kal"* after midnight) | `TRANSCRIBED` | `NEEDS_CLARIFICATION` | Generate clarification prompt with explicit candidate calendar dates. |
| **T-06** | Ambiguous quantity (*"aadha"* without unit) | `TRANSCRIBED` | `NEEDS_CLARIFICATION` | Ask: *"Did you mean 0.5 Litre?"* with one-tap confirmation chips. |
| **T-07** | Post-cutoff submission | `TRANSCRIBED` | `NEEDS_CLARIFICATION` | Warn: *"Tonight's cutoff has passed. Apply starting from [Day After Tomorrow]?"* |
| **T-08** | Proposal valid & fully resolved | `TRANSCRIBED` | `AWAITING_CONFIRMATION` | Render interactive confirmation card with date range and bill diff. |
| **T-09** | Customer answers clarification | `NEEDS_CLARIFICATION`| `AWAITING_CONFIRMATION` | Reparse proposal using customer clarification; update bill preview. |
| **T-10** | Customer taps "Confirm" | `AWAITING_CONFIRMATION`| `APPLIED` | **Atomic DB Transaction**: In a single transaction, update `delivery_calendar`, write `audit_events`, stamp `confirmed_at` and `confirmed_by`, and set state to `APPLIED`. |
| **T-11** | Database write failure during commit | `AWAITING_CONFIRMATION`| `FAILED` | Roll back transaction cleanly; calendar remains untouched; prompt user to retry. |
| **T-12** | Customer taps "Cancel" / "Reject" | `AWAITING_CONFIRMATION`| `REJECTED` | Mark proposal rejected; release locks; no calendar changes made. |
| **T-13** | Network dropped during review | `AWAITING_CONFIRMATION`| `AWAITING_CONFIRMATION` | Proposal preserved in `voice_submissions.proposal_json`; re-fetched on reconnect. |
| **T-14** | Customer submits newer request | `AWAITING_CONFIRMATION`| `CANCELLED` | Mark prior unconfirmed proposal cancelled; evaluate new submission. |

---

## 5. Deterministic Temporal & Delivery Rule Engine

The AI model (LLM/STT) **never** calculates final calendar dates, cutoff deadlines, or delivery quantities. All scheduling operations are executed by a deterministic, test-covered rule engine.

### 5.1 Temporal Context & Clocks
- **System Timezone**: Strictly `Asia/Kolkata` (UTC+05:30).
- **Reference Clock**: Every temporal operation is evaluated against an injected `reference_now` timestamp (allowing 100% reproducible test suites without mocking system time).
- **Recording Timestamp vs Server-Received Timestamp**:
  - `recorded_at`: Client-side recording time provided in request headers.
  - `received_at`: Server arrival time.
  - *Drift Rule*: If `abs(received_at - recorded_at) > 15 minutes`, the client timestamp is marked untrusted, and `received_at` is used as the base reference clock.

### 5.2 Calendar Date Interpretation Rules

| Spoken Idiom | Formal Interpretation Rules (Relative to `reference_date` = $D_0$) |
|---|---|
| **"Aaj"** (Today) | $D_0$. *Cutoff Check*: In milk delivery (morning 06:00), "aaj" is almost always post-cutoff. Triggers immediate validation. |
| **"Kal"** (Tomorrow) | $D_0 + 1\text{ day}$. Evaluated against vendor's cutoff time (canonical default: 20:00:00 IST on $D_0$). If received after 20:00:00, $D_0 + 1$ is post-cutoff. |
| **"Parso"** (Day After Tomorrow) | $D_0 + 2\text{ days}$. |
| **"Sunday" / Named Weekday** | The *next occurring* instance of that weekday strictly after $D_0$. If $D_0$ is Thursday Nov 19, "Sunday" is strictly **November 22, 2026** (never Nov 23, which is Monday). |
| **"Kal se teen din"** | Date range: $[D_0 + 1, D_0 + 1 + 2\text{ days}] = [D_0+1, D_0+3]$ inclusive (3 calendar dates total). |
| **"Somwar se regular"** | From next Monday onward: restore regular daily baseline quantity. |

### 5.3 Operational Cutoff Policy
- **Vendor Cutoff Time**: Configurable per vendor in `vendor_cutoffs.cutoff_time` (Canonical Demonstration Default: `20:00:00` IST).
  - *Demonstration Fixture Scope*: This 20:00:00 IST cutoff is a configurable ZYVO demonstration default fixture (not a verified universal dairy-industry standard; actual vendor cutoffs vary widely).
- **Delivery Target Time**: Default morning delivery window (`06:00:00` IST next day).
- **Authoritative Timestamp Policy**: Server-received time (`server_received_at` in `Asia/Kolkata`) is the authoritative timestamp used for all cutoff evaluations. Client recording time (`recorded_at`) is evaluated for clock drift; if `abs(server_received_at - recorded_at) > 15 minutes`, client timestamp is untrusted and server time strictly governs.
- **Cutoff Decision Matrix & Boundary Condition**:
  - **On or Before Cutoff** (`server_received_at <= 20:00:00 IST`): **Eligible** for next-morning delivery modifications starting $D_0 + 1$ (tomorrow morning).
  - **Strictly After Cutoff** (`server_received_at > 20:00:00 IST`): **Cutoff Violated** for $D_0 + 1$. System proposes modifications starting $D_0 + 2$, with explicit prompt: *"Tonight's packing cutoff (20:00) has passed. Crates are loaded. Delivery changes can begin from [Date $D_0 + 2$]."*

### 5.4 Quantity & Mutation Semantics
- `BASE_QUANTITY`: The customer's default recurring subscription (e.g. 1.0 Litre).
- `ABSOLUTE_SET`: Explicitly replaces daily volume. (*"1 litre karo"*, *"doodh mat dena"* $\rightarrow 0.0\text{ L}$).
- `RELATIVE_DELTA`: Adjusts relative to baseline. (*"Aadha litre extra"* $\rightarrow \text{Base} + 0.5\text{ L} = 1.5\text{ L}$; *"Aadha litre kam"* $\rightarrow \text{Base} - 0.5\text{ L} = 0.5\text{ L}$).
- `PAUSE`: Equivalent to setting effective quantity to $0.0\text{ L}$ across specified date range.

---

## 6. Billing & Financial Calculation Contract

All monetary values are calculated strictly in **integer paise** (1 INR = 100 paise) to prevent floating-point rounding errors.

### 6.1 Mathematical Formulation & Non-Ambiguity Rule

To eliminate any ambiguity or risk of double-counting paused deliveries, ZYVO specifies two mathematically equivalent views of billing derivation:

#### Model 1: Operational Per-Delivery Summation (Authoritative Engine Calculation)
The authoritative projected or final bill for any billing period is calculated strictly by summing the confirmed effective delivery charges across all calendar dates:
$$\text{Total Bill (paise)} = \sum_{d \in \text{BillingCycle}} \text{Charge}(d)$$
where:
$$\text{Charge}(d) = \frac{Q(d) \times R}{1000} \quad (\text{in integer paise})$$
- $Q(d)$: Effective scheduled quantity on date $d$ in millilitres.
- $R$: Unit rate in paise per 1000 mL (e.g. 7000 paise = ₹70.00 / Litre).
- **Pause Treatment**: When a date is paused, $Q(d) = 0\text{ mL}$, which directly yields $\text{Charge}(d) = 0\text{ paise}$. Paused days contribute zero cost to the sum.
- **Extra Quantity Treatment**: When extra volume is added (e.g. $1500\text{ mL}$), $\text{Charge}(d) = \frac{1500 \times 7000}{1000} = 10,500\text{ paise}$.

#### Model 2: Invoice Reconciliation View (Customer Audit & Transparency View)
For customer presentation on itemized invoices and dispute read-backs, the bill is presented as a baseline monthly subscription adjusted by explicit credits and debits:
$$\text{Base Monthly Charge} = N_{\text{days}} \times \left( \frac{Q_{\text{base}} \times R}{1000} \right)$$
$$\text{Pause Credits} = \sum_{\text{paused } d} \left( \frac{Q_{\text{base}} \times R}{1000} \right)$$
$$\text{Extra Volume Charges} = \sum_{\text{modified } d} \left( \frac{(Q(d) - Q_{\text{base}}) \times R}{1000} \right) \quad (\text{for } Q(d) > Q_{\text{base}})$$
$$\text{Net Adjustments} = \text{Extra Volume Charges} - \text{Pause Credits}$$
$$\text{Total Bill (paise)} = \text{Base Monthly Charge} + \text{Net Adjustments}$$

> [!CAUTION]
> **Prohibition of Double-Counting Bug:**
> The application code must **NEVER** calculate billing as `(Delivered Days × Rate) - Pause Credits`. If delivered days already exclude paused deliveries, subtracting pause credits a second time double-penalizes the vendor. 
> - If summing delivered days ($Q(d) \ge 0$), pause credits are **already 0** and must **not** be subtracted again (Model 1).
> - If starting from a full-month baseline ($N_{\text{days}}$), pause credits **must** be subtracted from that full baseline (Model 2).
> Both models yield the identical integer paise result.

### 6.2 Canonical Demonstration Benchmark Test Fixture
- **Customer**: Flat 204 (Sharma).
- **Default Subscription**: 1.0 Litre Cow Milk daily ($Q_{\text{base}} = 1000\text{ mL}$).
- **Rate**: ₹70.00 / Litre ($R = 7000\text{ paise}$).
- **Billing Period**: Full calendar month of November 2026 ($N_{\text{days}} = 30$).
- **Unmodified Monthly Baseline Projection**:
  $$30\text{ days} \times 7000\text{ paise} = 210,000\text{ paise} \quad (\text{₹}2,100.00)$$

**Scenario (Voice Modification Received Thursday, Nov 19, 2026 at 19:45 IST — Before 20:00 Cutoff):**
- Spoken command: *"Kal aur parso doodh mat dena, Sunday ko aadha litre extra dena."*
- Calendar mutations applied:
  - Friday, Nov 20 ($D_0 + 1$): $Q(d) = 0\text{ mL}$ (Paused $\rightarrow$ ₹0.00; Pause Credit: $-7000\text{ paise}$).
  - Saturday, Nov 21 ($D_0 + 2$): $Q(d) = 0\text{ mL}$ (Paused $\rightarrow$ ₹0.00; Pause Credit: $-7000\text{ paise}$).
  - Sunday, Nov 22 ($D_0 + 3$): $Q(d) = 1500\text{ mL}$ (Extra 0.5 L $\rightarrow$ ₹105.00; Extra Charge: $+3500\text{ paise}$).
  - Remaining 27 days: Regular delivery of $1000\text{ mL}$ ($27 \times 7000 = 189,000\text{ paise}$).

**Verification Under Both Models:**
- **Under Model 1 (Summation)**:
  $$\text{Total} = (27 \times 7000) + (2 \times 0) + (1 \times 10,500) = 189,000 + 0 + 10,500 = 199,500\text{ paise} \quad (\text{₹}1,995.00)$$
- **Under Model 2 (Reconciliation)**:
  $$\text{Base} = 210,000\text{ paise}$$
  $$\text{Adjustments} = (+3500) - (7000 + 7000) = +3500 - 14,000 = -10,500\text{ paise}$$
  $$\text{Total} = 210,000 - 10,500 = 199,500\text{ paise} \quad (\text{₹}1,995.00)$$

*Projected Bill (derived dynamically before deliveries occur) transitions from ₹2,100.00 to ₹1,995.00. Final Bill is sealed at month-end once delivery confirmations match calendar records. (Note: This benchmark example is an illustrative test fixture for verification, not a universal vendor pricing policy).*

---

## 7. Multi-Vertical Modular Data Model (SQLite via `node:sqlite`)

The database architecture employs a shared platform core with independent domain entity schemas, enforcing strict relational integrity, foreign keys, and integer paise monetary representation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SHARED PLATFORM ENTITIES                           │
├───────────────┬───────────────────────────────┬─────────────────────────────┤
│     users     │◀────── sessions               │        workspaces           │
│  (Auth Core)  │       (Cookie Auth)           │  (Tenant Boundary / Domain) │
└───────┬───────┴───────────────────────────────┴──────────────┬──────────────┘
        │                                                      │
        │ 1:N                                                  │ 1:N
        ▼                                                      ▼
┌───────────────────────────────┐               ┌─────────────────────────────┐
│     workspace_memberships     │               │      voice_submissions      │
│   (User + Role in Workspace)  │               │   (Shared Voice Lifecycle)  │
└───────────────────────────────┘               └──────────────┬──────────────┘
                                                               │ 1:N
                                                               ▼
                                                ┌─────────────────────────────┐
                                                │        audit_events         │
                                                │     (Dispute Evidence)      │
                                                └─────────────────────────────┘
                                                               │
        ┌──────────────────────┬──────────────────────┬────────┴─────────────┬──────────────────────┐
        ▼                      ▼                      ▼                      ▼                      ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ MODULE 1: MILK │     │MODULE 2: KIRANA│     │  MODULE 3: VEG │     │MODULE 4: CLINIC│     │ MODULE 5: AGRI │
│• cutoffs       │     │• catalog       │     │• produce_cat   │     │• doctors       │     │• crop_catalog  │
│• subscriptions │     │• aliases       │     │• aliases       │     │• slots         │     │• requests      │
│• calendar (SSOT│     │• orders & items│     │• orders & items│     │• appointments  │     │• items & sched │
└────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘
```

### 7.1 Shared Common Platform Tables

#### 1. `users`
- `id`: `TEXT` (UUID, Primary Key)
- `name`: `TEXT` NOT NULL
- `phone`: `TEXT` NOT NULL UNIQUE
- `email`: `TEXT`
- `role`: `TEXT` NOT NULL DEFAULT `'member'` (Enum: `admin`, `operator`, `member`)
- `created_at`: `TEXT` (ISO-8601 UTC)

#### 2. `sessions`
- `id`: `TEXT` (UUID, Primary Key)
- `user_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `users.id` ON DELETE CASCADE)
- `token_hash`: `TEXT` NOT NULL UNIQUE
- `expires_at`: `TEXT` NOT NULL (ISO-8601 UTC)
- `created_at`: `TEXT` (ISO-8601 UTC)

#### 3. `workspaces`
- `id`: `TEXT` (UUID, Primary Key)
- `name`: `TEXT` NOT NULL (e.g. `'Kumar Dairy Booth'`, `'Gupta Kirana Store'`)
- `vertical_type`: `TEXT` NOT NULL (Enum: `milk_delivery`, `kirana`, `vegetable_vendor`, `clinic`, `agriculture`)
- `owner_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `users.id`)
- `created_at`: `TEXT` (ISO-8601 UTC)

#### 4. `workspace_memberships`
- `id`: `TEXT` (UUID, Primary Key)
- `workspace_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `workspaces.id` ON DELETE CASCADE)
- `user_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `users.id` ON DELETE CASCADE)
- `role`: `TEXT` NOT NULL (Enum: `operator`, `customer`, `patient`, `farmer`)
- `created_at`: `TEXT` (ISO-8601 UTC)
- *Constraint*: `UNIQUE(workspace_id, user_id)`

#### 5. `voice_submissions` (Shared Transaction Pipeline)
- `id`: `TEXT` (UUID, Primary Key)
- `workspace_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `workspaces.id`, Indexed)
- `user_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `users.id`, Indexed)
- `vertical_type`: `TEXT` NOT NULL
- `recorded_at`: `TEXT` (ISO-8601 UTC)
- `received_at`: `TEXT` (ISO-8601 UTC)
- `audio_file_path`: `TEXT` NOT NULL (Stored in private `storage/audio/`, never public)
- `audio_mime_type`: `TEXT` NOT NULL (`audio/webm;codecs=opus`, `audio/mp4`, or `audio/wav`)
- `transcript_raw`: `TEXT`
- `detected_language`: `TEXT`
- `state`: `TEXT` NOT NULL (Enum: `RECEIVED`, `TRANSCRIBED`, `PROPOSAL_CREATED`, `NEEDS_CLARIFICATION`, `AWAITING_CONFIRMATION`, `APPLIED`, `REJECTED`, `FAILED`, `CANCELLED`)
- `proposal_json`: `TEXT` (Structured proposal payload, candidate slots, and preview calculations)
- `clarification_prompt`: `TEXT` (Prompt displayed when ambiguous)
- `confirmed_at`: `TEXT` (ISO-8601 UTC)
- `confirmed_by`: `TEXT` (Actor ID)
- `idempotency_key`: `TEXT` (UUID sent with confirmation request)
- `rejection_reason`: `TEXT`

#### 6. `audit_events` (Dispute Evidence Log)
- `id`: `TEXT` (UUID, Primary Key)
- `workspace_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `workspaces.id`, Indexed)
- `submission_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `voice_submissions.id`, Indexed)
- `user_id`: `TEXT` NOT NULL (Foreign Key $\rightarrow$ `users.id`, Indexed)
- `vertical_type`: `TEXT` NOT NULL
- `event_timestamp`: `TEXT` NOT NULL (ISO-8601 UTC)
- `transcript_span`: `TEXT` NOT NULL
- `span_start_char`: `INTEGER`
- `span_end_char`: `INTEGER`
- `action_type`: `TEXT` NOT NULL
- `prior_state_json`: `TEXT` NOT NULL
- `new_state_json`: `TEXT` NOT NULL
- `confirmed_by`: `TEXT` NOT NULL

---

### 7.2 Module 1: Milk Delivery Entities
- **`milk_vendor_cutoffs`**: `vendor_id` (PK $\rightarrow$ `workspaces.id`), `cutoff_time` (Default `'20:00:00'`), `timezone` (`'Asia/Kolkata'`).
- **`milk_customer_subscriptions`**: `id` (PK), `workspace_id` (FK), `customer_id` (FK $\rightarrow$ `users.id`), `product_name` (`'Cow Milk'`), `base_quantity_ml` (1000), `unit_rate_paise` (7000), `is_active` (1).
- **`milk_delivery_calendar`** *(Single Source of Truth)*: `id` (PK), `workspace_id` (FK), `customer_id` (FK $\rightarrow$ `users.id`), `delivery_date` (`'YYYY-MM-DD'`), `product_name`, `scheduled_quantity_ml` (0 if paused), `effective_rate_paise`, `status` (`SCHEDULED`, `DELIVERED`, `PAUSED`, `MODIFIED`), `source_submission_id` (FK Nullable). Constraint: `UNIQUE(workspace_id, customer_id, delivery_date)`.

### 7.3 Module 2: Kirana Store Entities
- **`kirana_product_catalog`**: `id` (PK), `workspace_id` (FK), `name`, `category`, `unit` (`packet`, `kg`, `litre`, `piece`), `unit_price_paise` (Integer paise), `is_available` (1/0).
- **`kirana_product_aliases`**: `id` (PK), `catalog_id` (FK $\rightarrow$ `kirana_product_catalog.id`), `alias_term` (e.g. `'chini'`, `'shakkar'`, `'sugar'`), `language` (`'hi'`, `'kn'`, `'en'`).
- **`kirana_grocery_orders`**: `id` (PK), `workspace_id` (FK), `customer_id` (FK $\rightarrow$ `users.id`), `order_status` (`PENDING_CONFIRMATION`, `CONFIRMED`, `PACKED`, `FULFILLED`, `CANCELLED`), `total_amount_paise`, `source_submission_id` (FK Nullable), `created_at`.
- **`kirana_grocery_order_items`**: `id` (PK), `order_id` (FK $\rightarrow$ `kirana_grocery_orders.id`), `catalog_id` (FK), `item_name`, `quantity`, `unit`, `unit_price_paise`, `subtotal_paise`.

### 7.4 Module 3: Vegetable Vendor Entities
- **`vegetable_produce_catalog`**: `id` (PK), `workspace_id` (FK), `name`, `category`, `supported_units` (`kg`, `grams`, `pieces`, `bundles`), `daily_rate_paise`, `is_in_stock` (1/0).
- **`vegetable_produce_aliases`**: `id` (PK), `produce_id` (FK $\rightarrow$ `vegetable_produce_catalog.id`), `alias_term` (e.g. `'aloo'`, `'batata'`, `'potato'`), `language`.
- **`vegetable_orders`**: `id` (PK), `workspace_id` (FK), `customer_id` (FK $\rightarrow$ `users.id`), `order_status` (`PENDING`, `CONFIRMED`, `DISPATCHED`, `DELIVERED`), `total_amount_paise`, `delivery_date`, `source_submission_id`, `created_at`.
- **`vegetable_order_items`**: `id` (PK), `order_id` (FK $\rightarrow$ `vegetable_orders.id`), `produce_id` (FK), `produce_name`, `quantity`, `unit`, `unit_price_paise`, `subtotal_paise`.

### 7.5 Module 4: Clinic Appointments Entities
- **`clinic_doctors`**: `id` (PK), `workspace_id` (FK), `name`, `department` (e.g. `'General Medicine'`, `'Pediatrics'`), `consultation_fee_paise`, `available_days`, `start_time` (`'09:00:00'`), `end_time` (`'17:00:00'`).
- **`clinic_appointment_slots`**: `id` (PK), `workspace_id` (FK), `doctor_id` (FK), `slot_date`, `start_time`, `end_time`, `is_booked` (1/0), `max_capacity` (1).
- **`clinic_appointments`**: `id` (PK), `workspace_id` (FK), `patient_id` (FK $\rightarrow$ `users.id`), `doctor_id` (FK), `slot_id` (FK Nullable), `appointment_date`, `time_slot`, `status` (`REQUESTED`, `CONFIRMED`, `RESCHEDULED`, `COMPLETED`, `CANCELLED`), `source_submission_id`, `created_at`.
- *Privacy Constraint*: Strictly administrative scheduling metadata. Diagnosis notes and prescription storage are strictly excluded.

### 7.6 Module 5: Agriculture Produce Procurement Entities
- **`agri_crop_catalog`**: `id` (PK), `workspace_id` (FK), `crop_name`, `variety`, `indicative_rate_paise_per_quintal`, `procurement_active` (1/0).
- **`agri_procurement_requests`**: `id` (PK), `workspace_id` (FK), `farmer_id` (FK $\rightarrow$ `users.id`), `request_status` (`REGISTERED`, `VERIFIED`, `PICKUP_SCHEDULED`, `COLLECTED`, `REJECTED`), `total_indicative_value_paise`, `pickup_date`, `source_submission_id`, `created_at`.
- **`agri_procurement_items`**: `id` (PK), `request_id` (FK $\rightarrow$ `agri_procurement_requests.id`), `crop_id` (FK), `crop_name`, `quantity_quintals`, `unit` (`quintal`, `kg`, `crates`), `grade_quality` (`'Grade A'`, `'Standard'`), `rate_paise_per_quintal`, `subtotal_paise`.
- **`agri_pickup_schedules`**: `id` (PK), `workspace_id` (FK), `request_id` (FK), `pickup_date`, `pickup_status`, `logistics_notes`.
- `action_type`: `TEXT` NOT NULL (`PAUSE`, `QUANTITY_DELTA`, `SET_ABSOLUTE`)
- `prior_state_json`: `TEXT` NOT NULL
- `new_state_json`: `TEXT` NOT NULL
- `confirmed_by`: `TEXT` NOT NULL (`CUSTOMER_CONFIRMATION_TAP`)

---

## 8. Minimal REST API Surface

All API endpoints enforce server-side session authentication via HTTP-only, secure, SameSite cookies (`zyvo_session`). The backend derives the actor's identity strictly from the authenticated session, completely eliminating Insecure Direct Object Reference (IDOR) vulnerabilities. Request bodies and query parameters are never trusted for ownership validation.

### 8.1 Reconciled Endpoint Inventory (9 Endpoints)

#### 1. `POST /api/auth/session`
- **Role**: Public (Demo Switcher)
- **Purpose**: Authenticates or switches between seeded demo accounts (`cust_flat204` vs `vend_kumar01`).
- **Request**: `{"role": "customer" | "vendor", "actor_id": "cust_flat204" | "vend_kumar01"}`
- **Response** (`200 OK`): Sets HTTP-only `zyvo_session` cookie; returns `{ "authenticated": true, "actor_id": "...", "role": "..." }`.

#### 2. `POST /api/voice-submissions`
- **Role**: Authenticated `customer`
- **Purpose**: Uploads client-recorded audio blob for speech recognition, extraction, and candidate proposal generation.
- **Request**: `multipart/form-data` containing:
  - `audio_blob`: Audio file (`.webm`, `.mp4`, or `.wav`, max 10MB, max 30s).
  - Header `X-Client-Timestamp`: ISO-8601 string of recording time.
- **Validation**: Rejects empty files (`400`), files $>10\text{MB}$ (`413`), or unsupported MIME (`415`). Checks timestamp drift ($>15\text{ mins}$).
- **Response** (`201 Created`):
  ```json
  {
    "submission_id": "sub_987654",
    "state": "AWAITING_CONFIRMATION",
    "transcript": "kal aur parso doodh mat dena sunday ko aadha litre extra dena",
    "detected_language": "hi-IN",
    "proposal": {
      "dates_affected": ["2026-11-20", "2026-11-21", "2026-11-22"],
      "operations": [
        {"date": "2026-11-20", "day_name": "Friday", "action": "PAUSE", "scheduled_qty_ml": 0},
        {"date": "2026-11-21", "day_name": "Saturday", "action": "PAUSE", "scheduled_qty_ml": 0},
        {"date": "2026-11-22", "day_name": "Sunday", "action": "DELTA", "scheduled_qty_ml": 1500}
      ],
      "cutoff_exceeded": false,
      "projected_bill_adjustment_paise": -10500,
      "projected_monthly_total_paise": 199500
    }
  }
  ```
- **Error Response** (`422 Unprocessable`): Returned if audio inaudible or language unsupported.

#### 3. `GET /api/proposals/{id}`
- **Role**: Authenticated `customer` (owner only)
- **Purpose**: Retrieves pending proposal details, clarification prompts, and current state.
- **Response** (`200 OK`): Current proposal JSON, clarification question if state is `NEEDS_CLARIFICATION`.

#### 4. `POST /api/proposals/{id}/confirm`
- **Role**: Authenticated `customer` (owner only)
- **Purpose**: Explicitly confirms proposal. Triggers **Atomic Single-Transaction DB Commit**.
- **Request**: `{"idempotency_key": "uuid_v4"}`
- **Validation**: Verifies submission is in `AWAITING_CONFIRMATION` and caller owns submission.
- **Response** (`200 OK`):
  ```json
  {
    "submission_id": "sub_987654",
    "state": "APPLIED",
    "applied_at": "2026-11-19T14:32:00Z",
    "updated_calendar_slots": 3,
    "current_bill_paise": 199500
  }
  ```

#### 5. `POST /api/proposals/{id}/reject`
- **Role**: Authenticated `customer` (owner only)
- **Purpose**: Discards candidate proposal. Sets state to `REJECTED`. Calendar remains 100% untouched.
- **Response** (`200 OK`): `{"submission_id": "sub_987654", "state": "REJECTED"}`.

#### 6. `GET /api/customers/{id}/calendar?month=YYYY-MM`
- **Role**: Authenticated `customer` (self) or assigned `vendor`
- **Purpose**: Returns authoritative delivery schedule and derived projected bill for requested month.
- **Response** (`200 OK`): Array of `{ "date": "2026-11-20", "qty_ml": 0, "status": "PAUSED" }` and derived `projected_bill_paise: 199500`.

#### 7. `GET /api/vendors/{id}/manifest?date=YYYY-MM-DD`
- **Role**: Authenticated `vendor` (self)
- **Purpose**: Returns derived delivery run-sheet for specified date ordered by route sequence.
- **Response** (`200 OK`):
  ```json
  {
    "date": "2026-11-20",
    "total_crates_required": 14,
    "total_litres_scheduled": 168.0,
    "customers_count": 140,
    "route_stops": [
      {
        "sequence": 1,
        "customer_name": "Sharma (Flat 204)",
        "status": "PAUSED",
        "deliver_qty_litres": 0.0,
        "special_note": "Paused via Voice"
      }
    ]
  }
  ```

#### 8. `GET /api/audio-records/{id}`
- **Role**: Authenticated `customer` (owner) or assigned `vendor`
- **Purpose**: Streams raw audio file from private `storage/audio/` for dispute resolution.
- **Security & Authorization**: Audio files never reside in public static webroot. Server verifies session ownership; returns `401 Unauthorized` if unauthenticated and `403 Forbidden` if caller is not the owning customer or assigned vendor.
- **Response** (`200 OK`): Binary audio stream with proper `Content-Type: audio/webm` (or `audio/mp4`) supporting HTTP range requests.

#### 9. `POST /api/admin/purge-demo-data`
- **Role**: System Operator / Development Maintenance (Internal Operational Tool)
- **Purpose**: Operational development and evaluation maintenance endpoint to purge test audio recordings and associated transcripts.
- **Security**: Protected strictly by operational header `X-Admin-Secret: <ADMIN_SECRET>`. Not exposed as a regular user role in the application UI. Returns `401 Unauthorized` if secret is missing or invalid.
- **Response** (`200 OK`): `{"purged_audio_count": 12, "purged_records_count": 12}`.
- **Governance & Privacy Note**: This maintenance endpoint provides a controlled mechanism for test-data cleanup; it does not on its own establish complete DPDP Act compliance, which requires clear customer notice, explicit consent, purpose limitation, and separate retention policies.

---

## 9. AI, Audio & Language Architecture

### 9.1 Browser Recording & Audio MIME Validation
- **Client Container Selection**:
  The browser inspects `MediaRecorder.isTypeSupported()` in order of preference:
  1. `audio/webm;codecs=opus` (Native standard for Android Chrome, Desktop Chrome, Firefox, Edge)
  2. `audio/webm` (Generic WebM container)
  3. `audio/mp4` (Native standard for iOS Safari)
  4. `audio/wav` (Fallback)
- **Zero Mislabeling Guarantee**: The client records the genuine MIME type and uploads with its matching extension (`.webm`, `.mp4`, or `.wav`). WebM is **never** labeled as WAV or MP3.
- **Server Audio Validation**:
  - Max duration: **30 seconds** (strictly compliant with Sarvam REST sync limits).
  - Max file size: **10 MB**.
  - Non-empty payload check.
- **Zero FFmpeg CLI Dependency**: Because the official Sarvam REST API natively accepts WebM (`audio/webm`), MP4 (`audio/mp4`), and WAV (`audio/wav`), **no audio transcoding is performed on either client or server**.

### 9.2 Decoupled 6-Stage Multilingual Understanding Pipeline

```
[ Audio Blob ] ──▶ 1. Speech Recognition (Sarvam Saaras v4 codemix) ──▶ Raw Indic Transcript
                         │
                         ▼
                   2. Intent & Slot Extraction (Option B Primary / Option A Fallback)
                         │
                         ▼
                   3. Schema & Slot Validation (Check missing dates/units)
                         │
                         ▼
                   4. Deterministic Business Engine (Asia/Kolkata Clock & Cutoffs)
                         │
                         ▼
                   5. Confirmation Display (Visual Card & Bill Preview)
                         │
                         ▼
                   6. Database Mutation (Atomic Commit to delivery_calendar)
```

#### Extraction Strategy & Model Boundaries:
- **Primary: Option B (Model-Assisted Schema Extractor)**:
  - **Recommended API Model**: **`gemini-3.5-flash-lite`** (Google AI Studio / Gemini API). It is optimized for high-throughput, low-latency, cost-effective structured JSON schema extraction.
  - **Alternative Candidate**: **`gemini-3.8-flash`** for complex multi-intent reasoning and high-precision code-mixed nuances.
  - *Model Lifecycle & Availability Note*: Official Google developer guidance indicates legacy `gemini-1.5` and `gemini-2.0` series are deprecated/retired, and access to early `gemini-2.5-flash` is limited for new API projects. Gemini 3.x models are the actively supported standard on `ai.google.dev`.
  - *Structured Output Contract*: Configured with `response_mime_type: "application/json"` and strict `response_schema` enforcing the TypeScript slot blueprint.
  - *Crucial Credential Distinction*: The Antigravity IDE orchestrator's model access is an IDE-internal entitlement. The running ZYVO web application requires its own separate server-side `GEMINI_API_KEY` in `.env.local` to call the external Gemini API.
  - *Strict Functional Boundary*: The LLM is **strictly an acoustic-to-slot extraction assistant**. It extracts raw phrases into candidate fields: `{ "intent": "MODIFY", "date_phrase": "kal aur parso", "action": "PAUSE", "quantity_phrase": "mat dena", "delta_phrase": "sunday ko aadha extra" }`. The model **NEVER** computes delivery calendar dates, never calculates billing or paise amounts, and never mutates the database. All extracted fields pass through strict schema validation and deterministic TypeScript business rules.
- **Deterministic Fallback: Option A (Bounded Deterministic Pattern Parser)**:
  - A zero-dependency pure TypeScript regex pattern engine matching documented Indic recurring keywords (*"mat dena"*, *"band"*, *"extra"*, *"karo"*, *"aadha"*, *"chhutti"*).
  - *Resilience Guarantee*: If `GEMINI_API_KEY` is not configured, API quota is exceeded, or network latency spikes, the system falls back seamlessly to Option A, labeling the source as `PARSER: DETERMINISTIC_FALLBACK` in the API response and logs.

#### Multilingual Sample Utterances & Rejection Rules:
- **Hindi (`hi-IN`)**:
  - *Valid*: *"Kal aur parso doodh mat dena, Sunday ko aadha litre extra dena."* $\rightarrow$ Nov 20-21 Pause, Nov 22 +500 mL.
  - *Valid*: *"Parso se regular kar dena."* $\rightarrow$ Nov 21 Base 1000 mL.
  - *Clarify*: *"Aadha extra kar do."* $\rightarrow$ Missing date. Asks: *"Kab se aadha litre extra chahiye?"*
  - *Reject*: *"Bijli ka bill bhar do."* $\rightarrow$ Out of domain. Rejection: *"Only milk delivery changes are supported."*
- **Kannada (`kn-IN`)**:
  - *Valid*: *"Naale mattu naaddhu haalu beda, bhaanuvaara ardha litre jaasti kodi."* $\rightarrow$ Nov 20-21 Pause, Nov 22 +500 mL.
  - *Valid*: *"Somavaara haalu beda."* $\rightarrow$ Nov 23 Pause.
  - *Clarify*: *"Eradu kodi."* $\rightarrow$ Missing unit. Asks: *"2 Litre haala athava 2 packet mosara?"*
- **Indian English / Hinglish (`en-IN`)**:
  - *Valid*: *"Please pause milk tomorrow and day after, add half litre on Sunday."* $\rightarrow$ Nov 20-21 Pause, Nov 22 +500 mL.
  - *Clarify*: *"Cancel delivery from tomorrow."* $\rightarrow$ Open-ended pause. Asks: *"Until which date should delivery remain paused?"*

### 9.3 Visual Read-Back vs Audio Highlighting
- **Transcript Text Span Highlighting**: Supported. Extracted slots record `span_start_char` and `span_end_char` within the transcript string, enabling exact yellow highlighting in the UI.
- **Audio Playback**: Supported. The raw audio file is played via an HTML5 audio element.
- **Karaoke Word-Level Sync**: **Explicitly Disclaimed**. The Sarvam REST STT response returns the full transcript string; it does not provide word-level microsecond audio timestamps. Therefore, synchronized word-by-word karaoke bouncing is not promised.

---

## 10. Technology Selection, Runtime & Deployment Architecture

### 10.1 Technology Stack & Node v26 Compatibility
- **Runtime**: **Node.js v26.13.1** on Windows 11 host.
- **Database Engine**: **Built-in `node:sqlite` (`Database` class)**.
  - *API Class & Deprecation*: Node.js 26.11+ establishes `Database` as the recommended standard library export; `DatabaseSync` is preserved only as a deprecated alias. Newly authored code strictly instantiates `new sqlite.Database(path)`.
  - *Execution Model*: All `Database` API methods (`db.exec()`, `db.prepare().run()`, `db.prepare().all()`) are **synchronous**.
  - *Stability Status*: Currently classified as **Release Candidate / Experimental** in the Node.js standard library.
  - *Prototype Rationale*: Ideal for a single-process, local Next.js prototype with moderate sequential transaction volume. Completely eliminates `better-sqlite3`, `node-gyp`, and Python C++ compilation toolchains on Windows 11.
  - *Production Concurrency Limitation*: Synchronous database calls block the Node.js event loop during heavy writes; a large-scale concurrent production deployment would necessitate SQLite WAL mode on dedicated worker threads or migration to PostgreSQL (e.g. Supabase).
  - *Storage Persistence*: Database files reside on persistent host storage (`zyvo.db`).
  - *Repository Cleanliness & Exclusions*: Database files (`zyvo.db`, `zyvo.db-wal`, `zyvo.db-shm`), audio files (`storage/audio/`), runtime logs, and `.env*.local` secrets will be strictly excluded in `.gitignore`.
- **Framework**: **Next.js 15 (React 19, App Router, Tailwind CSS)**.
- **Single-Process Advantage**: Mobile PWA shell, API route handlers, temporal engine, and SQLite database execute within one unified, stateful Node.js process.

### 10.2 Mobile Microphone Testing & Secure Tunnel Architecture
- **Browser Security Constraint**: Modern mobile browsers (iOS Safari, Android Chrome) strictly enforce Secure Context requirements: `navigator.mediaDevices.getUserMedia()` is blocked over plain HTTP (except `http://localhost`). Plain Wi-Fi IP access (`http://192.168.x.x:3000`) is rejected by mobile browsers.
- **Hackathon Tunnel Architecture (Development & Testing Only)**:
  1. The Node.js application runs locally: `http://localhost:3000`.
  2. Local persistent host storage maintains `zyvo.db` and `storage/audio/` across restarts.
  3. A temporary HTTPS tunnel is initiated to expose the port to an evaluator's mobile device:
     ```bash
     # Unrestricted quick tunnel (publicly reachable if URL is known):
     cloudflared tunnel --url http://localhost:3000
     
     # Recommended: Restricted quick tunnel (evaluator email pin protection):
     cloudflared tunnel --url http://localhost:3000 --allowed-mail evaluator@example.com
     
     # Alternative:
     ngrok http 3000
     ```
  4. *Tunnel Security Boundary*: Quick Tunnel URLs are temporary and publicly reachable by default unless restricted. Under no circumstances is a temporary tunnel to be used as a production architecture.
  5. *Mandatory Application Auth*: Tunnel restrictions do **not** replace application authentication. HTTP-only session cookies (`zyvo_session`) and role-based checks remain strictly mandatory on all protected endpoints.
- **Safe Mobile Testing Procedure**:
  1. Evaluator opens the HTTPS tunnel URL (`https://*.trycloudflare.com`) on a physical smartphone.
  2. Evaluator signs in using seeded credentials (`cust_flat204`).
  3. The mobile browser prompts for microphone permissions in the verified Secure Context.
  4. Evaluator records a live spoken voice note (e.g. in Hindi or English).
  5. The audio is captured in native WebM/MP4, transmitted over HTTPS, processed, and reflected on the delivery calendar.

### 10.3 Fallback Architecture
- **Backend**: Python 3.13 + FastAPI (`app/main.py`) serving REST endpoints + SQLite.
- **Frontend**: Vite + React 19 SPA communicating over HTTP.

### 10.4 Git Repository Isolation Recommendation
- **Guidance**: In accordance with Phase 0 findings (`c:\MILKY WAY` is not a git repository and `gemini-web2api` is an independent submodule), ZYVO should be initialized inside a dedicated, isolated project repository at `c:\MILKY WAY\zyvo` with its own clean `.gitignore` and version history.

---

## 11. Security, Privacy & Data Governance Specification

> [!NOTE]
> **Specification vs Implementation Boundary:**
> All security, authentication, session management, and privacy features below are **SPECIFIED & DESIGNED** for implementation in Waves 1–3. Zero application code has been written; no security penetration tests have yet been performed.

### 11.1 Session-Based Authentication & Access Control (Designed)
1. **Session Management Specification**:
   - Authentication sets an HTTP-only, secure cookie: `zyvo_session`.
   - **Cookie Attributes**: `HttpOnly; SameSite=Lax; Path=/; Max-Age=86400` (and `Secure` when served over HTTPS).
   - **Server-Side Verification**: Route handlers parse `zyvo_session`, cryptographically verify the token, and look up the authenticated actor record.
   - **CSRF Defense**: Protected state-mutating requests (`POST`, `PUT`, `DELETE`) require `SameSite=Lax` cookie policy and enforce `Content-Type: application/json` or `multipart/form-data`, mitigating cross-site form submission attacks.
   - **Logout & Revocation**: Dedicated logout handler clears the `zyvo_session` cookie and invalidates the session server-side.
2. **Actor Roles & IDOR Defense (Designed)**:
   - Exactly **two** user roles are modeled: `Customer` and `Vendor`.
   - Every protected route derives ownership strictly from the verified session context, completely ignoring any client-supplied `actor_id` in query parameters or request bodies to prevent Insecure Direct Object Reference (IDOR) attacks.
   - `Customer` can access only their own delivery calendar, proposals, and voice recordings.
   - `Vendor` can access only manifests and dispute records for customers assigned to their route.

### 11.2 Audio Storage, Retention & Dispute Evidence Boundaries (Designed)
1. **Private Audio Storage**: Audio recordings are saved with random UUID filenames inside private server storage (`storage/audio/{uuid}.webm`). They are never placed in public static asset directories.
2. **Authenticated Streaming**: `GET /api/audio-records/{id}` verifies caller identity and returns `403 Forbidden` if the caller is neither the customer who recorded it nor their assigned vendor.
3. **Dispute Audit Trail Scope**:
   - The dispute viewer provides a **tamper-evident audit log for resolving customer-vendor billing questions** by binding the audio recording to the transcript text span and confirmation diff.
   - It is explicitly designed for practical operational dispute resolution; it does **not** claim legal indisputability or permanent cryptographic immutability.
4. **Data Retention & Privacy Principles**:
   - For hackathon demonstrations, **only synthetic customer accounts and consented volunteer test audio** will be used.
   - Soft-delete flag `is_deleted` is specified on `voice_submissions`.
   - A protected operator maintenance endpoint (`POST /api/admin/purge-demo-data`) guarded by `X-Admin-Secret` is provided for test cleanup. Full DPDP Act 2023 compliance requires separate customer privacy notices, consent records, and defined 90-day retention lifecycles.
5. **Secret Management**:
   - API keys (`SARVAM_API_KEY`, `GEMINI_API_KEY`, `ADMIN_SECRET`) are loaded strictly via server environment variables (`process.env.*`).
   - Zero credentials or tokens are ever bundled into client JavaScript.

---

## 12. Acceptance Criteria & Test Gates

| Test ID | Category | Input / Action | Expected Result | Pass Criteria |
|---|---|---|---|---|
| **TC-TIME-01** | Temporal Engine | Reference: Thu Nov 19, 2026.<br>Input: *"Kal aur parso doodh mat dena, Sunday ko aadha litre extra."* | Nov 20: Pause (0L)<br>Nov 21: Pause (0L)<br>Nov 22: Delta +0.5L (1.5L)<br>(Nov 23 is recognized as Monday) | Deterministic calendar dates match exact ISO calendar. |
| **TC-TIME-02** | Cutoff Engine | Audio uploaded at 20:15 (Canonical Cutoff 20:00) requesting skip for tomorrow morning. | State: `NEEDS_CLARIFICATION`. Alert displayed that morning delivery cannot be altered. | Next morning delivery protected; proposal starts from $D_0 + 2$. |
| **TC-TIME-03** | Clock Drift | `recorded_at` is 3 hours earlier than `received_at` (delayed sync). | System detects timestamp discrepancy and prompts confirmation of reference date. | Untrusted timestamps rejected. |
| **TC-QTY-01** | Delta vs Absolute | Input A: *"Aadha litre extra."*<br>Input B: *"Aadha litre karo."* | Input A: Base 1.0L + 0.5L = 1.5L.<br>Input B: Absolute volume = 0.5L. | Delta vs absolute grammar distinguished. |
| **TC-BILL-01** | Billing Ledger | Customer pauses Nov 20 & 21, adds 0.5L on Nov 22. Base: 1L @ ₹70/L. | Projected monthly bill updates from ₹2,100 to ₹1,995 (-₹105.00 diff). | Exact integer paise derivation verified under both Model 1 & Model 2. |
| **TC-CONF-01** | State Gate | Proposal generated in `AWAITING_CONFIRMATION`. Client disconnects without confirming. | Calendar and vendor manifest show zero modifications. | State mutation requires explicit confirmation. |
| **TC-VEND-01** | Vendor Manifest | Customer confirms pause for Nov 20. Vendor loads route sheet for Nov 20. | Flat 204 displays: `0.0 L (PAUSED)`. Total route crates updated in real-time. | Route sheet accurately reflects change. |
| **TC-AUDIT-01** | Dispute Replay | Vendor opens Audit Viewer for Flat 204. | Audio plays original recording; transcript highlights grounded span; confirmation diff displayed. | Dispute evidence verifiable in 5 seconds. |

---

*Last updated: 2026-11-19 (Phase 2 Specification)*

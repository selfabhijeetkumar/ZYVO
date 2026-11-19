# ZYVO — HACKATHON PRESENTATION CONTENT
## Slide-by-Slide Presentation Content for Hackathon Pitch & Judging Panel

---

### SLIDE 1: TITLE & POSITIONING

- **Title:** ZYVO
- **Subtitle:** One Voice Platform. Multiple Industries. Real Business Transactions.
- **Hackathon:** REWIRED · Track ECHO
- **Category:** Voice-Driven Business Commerce & Workflow Automation

---

### SLIDE 2: THE PROBLEM

- **Informal Commerce is Voice-First:** Hundreds of millions of micro-transactions in India (daily milk deliveries, grocery orders, mandi vegetables, clinic appointments, harvest lots) happen via informal voice notes on WhatsApp.
- **Voice Notes Do Not Execute Transactions:**
  - Merchants spend hours re-listening to audio clips and writing daily route sheets by hand.
  - Paper records and verbal promises lead to frequent billing disputes at month-end.
- **Why Existing Apps Fail:**
  - Traditional ERP and e-commerce apps require semi-literate users to navigate dense multi-step screens.
  - Generic AI chatbots hold conversations but lack transactional guarantees, cutoff rules, and dispute audit trails.

---

### SLIDE 3: THE SOLUTION — ZYVO

- **A Unified Indic Voice Operations Engine:**
  - Turns unstructured multilingual voice notes (Hindi, Hinglish, English) into validated, executed database transactions.
- **Two-Phase Confirmation Protocol:**
  - Voice Ingestion $\rightarrow$ Structured Proposal Extraction $\rightarrow$ Explicit User Review $\rightarrow$ Atomic Database Commit.
- **Modular Monolith Architecture:**
  - One shared core infrastructure powering five distinct commercial micro-industries.

---

### SLIDE 4: TARGET USERS & DUAL PERSONAS

- **Everyday Consumers & Farmers (Ramesh Sharma Persona):**
  - Sends a natural voice note to pause milk delivery, order groceries, book a doctor slot, or schedule harvest collection.
  - Reviews the structured proposal with clear pricing in rupees and paise before confirming.
- **Local Merchants & Operators (Kumar Operator Persona):**
  - Receives organized daily route loads, order fulfillment lists, outpatient clinic manifests, and harvest collection runs.
  - Eliminates daily billing reconciliation disputes.

---

### SLIDE 5: FIVE OPERATING BUSINESS WORKFLOWS

1. **Milk Delivery Operations:**
   - 20:00 cutoff rule; atomic calendar overrides; dual-model monthly billing in integer paise (verified 199,500 paise benchmark).
2. **Kirana Store:**
   - Colloquial alias engine (*chini* $\rightarrow$ sugar, *chawal* $\rightarrow$ rice); multi-item grocery carts; merchant bagging queue.
3. **Vegetable Vendor:**
   - Fractional weights (250g, 500g, 1kg) and non-standard bundles (*gaddi*); dynamic Mandi rate board; aggregated weighing manifest.
4. **Clinic Outpatient Scheduling:**
   - Attending doctor slots; double-booking prevention; strict non-diagnostic boundary rejecting clinical symptoms and prescriptions.
5. **Agriculture Produce Procurement:**
   - Harvest lot volume conversion (kg/crates to quintals); authentic Government of India MSP compliance (Wheat/Mustard MSP vs Tomato/Potato non-MSP spot rates).

---

### SLIDE 6: SYSTEM ARCHITECTURE & DATA INTEGRITY

- **Modular Monolith with Decoupled Providers:**
  - Standardized Speech and Intent provider registries supporting future external cloud adapters (Sarvam, Gemini, Groq) with an offline deterministic fallback.
- **Standard Library SQLite Engine (`node:sqlite`):**
  - 24 relational tables running in WAL mode with foreign keys strictly enforced (`PRAGMA foreign_keys = ON`).
  - Zero floating-point arithmetic: all currency stored strictly in integer paise.

---

### SLIDE 7: KEY DIFFERENTIATORS

| Dimension | Generic Voice Chatbot | Heavyweight ERP / App | ZYVO Platform |
|---|---|---|---|
| **Interaction** | Conversational chat | Multi-step form screens | Voice-first with 2-phase review |
| **Execution** | Hallucinated text | Manual typing | Atomic database commit |
| **Dispute Safety** | None | Audit log without voice | Audio recording bound to transaction |
| **Financial Math** | Floating point | Variable | Strict integer paise arithmetic |
| **Cloud Dependency** | 100% online API calls | Cloud dependent | 100% offline-capable local engine |

---

### SLIDE 8: SECURITY, PRIVACY & GOVERNANCE

- **Dispute-Grade Audit Trail:** Every transaction records an immutable log in `audit_events` linking to raw audio stored in `storage/audio/`.
- **Clinic Privacy Boundary:** Server-side regex strictly blocks medical symptoms, diagnoses, and prescriptions.
- **Multi-Tenant Isolation:** Workspace boundaries isolate customer records and vendor catalogs.
- **Official MSP Compliance:** Transparently cites PIB Press Release PRID 2269182 for CCEA MSP rates, removing all false MSP claims on non-mandated crops.

---

### SLIDE 9: DEMONSTRATION WORKFLOW

1. **Live Audio Ingestion:** Capture audio via browser microphone or select benchmark preset.
2. **Structured Extraction:** Immediate slot resolution into an unconfirmed transaction proposal.
3. **Review & Confirm:** Explicit user confirmation commits changes to SQLite.
4. **Operator View:** Real-time route manifests and fulfillment queues update automatically.
5. **Audit Inspection:** Review full state transitions and linked audio files in `/activity`.

---

### SLIDE 10: LIMITATIONS & FUTURE ROADMAP

- **Hackathon Status (Current):**
  - 100% offline-capable with local deterministic extraction (`EXTERNAL_API_ENABLED=false`).
  - Verified across 11 automated test suites passing at 100%.
  - Clean Next.js 16 production build.
- **Phase 8 Roadmap (Post-Hackathon):**
  - Activate live cloud speech-to-text with Sarvam AI Saaras Indic STT for regional Dravidian languages.
  - Integrate UPI QR code generation and auto-debit payments.
  - Connect WhatsApp Business Cloud API webhooks for direct WhatsApp voice note ingestion.

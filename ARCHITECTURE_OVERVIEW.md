# ZYVO — SYSTEM ARCHITECTURE OVERVIEW
## Modular Monolith Platform for Multilingual Voice Operations

---

### 1. HIGH-LEVEL PLATFORM TOPOLOGY

ZYVO is built as an extensible modular monolith using Next.js 16 (React 19, Turbopack) and Node.js standard-library SQLite (`node:sqlite` `DatabaseSync`).

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Ingestion Layer"]
        Mic["Browser MediaRecorder\n(Live Audio Capture)"]
        Upload["Audio Upload\n(WebM / WAV / MP4)"]
        Manual["Manual Transcript\n& Benchmark Presets"]
        Shell["Universal Shell UI\n(Obsidian Assembly Palette)"]
    end

    subgraph PlatformCore ["Platform Core Infrastructure"]
        Auth["Session Auth & Personas\n(zyvo_session, HTTP-only)"]
        Router["Voice & Intent Router\n(Decoupled Provider Engine)"]
        Audit["Audit Logger\n(storage/audio/ + audit_events)"]
        Registry["Typed Vertical Registry\n(VerticalModuleDefinition)"]
    end

    subgraph VerticalEngines ["Vertical Domain Engines"]
        MilkEng["Milk Delivery Engine\n(Billing, Cutoff, Manifest)"]
        KiranaEng["Kirana Grocery Engine\n(Alias Resolution, Paise Cart)"]
        VegEng["Vegetable Mandi Engine\n(Fractional Weights, Mandi Board)"]
        ClinicEng["Clinic Outpatient Engine\n(Privacy Gate, Slot Reservations)"]
        AgriEng["Agri Procurement Engine\n(Official MSP, Quintal Conversion)"]
    end

    subgraph StorageLayer ["Persistence Layer (Node.js SQLite)"]
        DB[("zyvo.db\n(WAL Mode, Foreign Keys Enforced)")]
        AudioStore[("storage/audio/\n(Raw Encrypted Voice Blobs)")]
    end

    Mic --> Router
    Upload --> Router
    Manual --> Router
    Shell --> Auth

    Router --> Audit
    Router --> Registry
    Registry --> MilkEng
    Registry --> KiranaEng
    Registry --> VegEng
    Registry --> ClinicEng
    Registry --> AgriEng

    MilkEng --> DB
    KiranaEng --> DB
    VegEng --> DB
    ClinicEng --> DB
    AgriEng --> DB
    Audit --> DB
    Audit --> AudioStore
```

---

### 2. GENERIC VOICE TRANSACTION LIFECYCLE

Every voice interaction transitions through a 4-stage deterministic lifecycle:

```mermaid
stateDiagram-v2
    [*] --> RECEIVED: Audio / Transcript Uploaded
    RECEIVED --> TRANSCRIBED: Speech Provider Transcribes Audio
    TRANSCRIBED --> AWAITING_CONFIRMATION: Intent Extracted (Confidence >= 75%)
    TRANSCRIBED --> NEEDS_CLARIFICATION: Ambiguous Input (Confidence < 75%)
    NEEDS_CLARIFICATION --> TRANSCRIBED: Customer Clarification Supplied
    AWAITING_CONFIRMATION --> APPLIED: Explicit User Confirmation
    AWAITING_CONFIRMATION --> REJECTED: User Cancellation / Rejection
    APPLIED --> [*]: Atomic Commit to Domain Tables
    REJECTED --> [*]: Zero Domain Table Mutation
```

---

### 3. DATABASE RELATIONAL SCHEMA (24 DOMAIN TABLES)

The database schema is organized into shared platform tables and vertical-specific domain tables:

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ WORKSPACE_MEMBERSHIPS : member_of
    WORKSPACES ||--o{ WORKSPACE_MEMBERSHIPS : contains
    WORKSPACES ||--o{ VOICE_SUBMISSIONS : logs
    VOICE_SUBMISSIONS ||--o{ AUDIT_EVENTS : audited_by

    WORKSPACES ||--o{ MILK_CUSTOMER_SUBSCRIPTIONS : manages
    MILK_CUSTOMER_SUBSCRIPTIONS ||--o{ MILK_DELIVERY_CALENDAR : modifies
    VOICE_SUBMISSIONS ||--o{ MILK_DELIVERY_CALENDAR : sources

    WORKSPACES ||--o{ KIRANA_PRODUCT_CATALOG : stocks
    KIRANA_PRODUCT_CATALOG ||--o{ KIRANA_PRODUCT_ALIASES : aliased_by
    WORKSPACES ||--o{ KIRANA_GROCERY_ORDERS : fulfills
    KIRANA_GROCERY_ORDERS ||--o{ KIRANA_GROCERY_ORDER_ITEMS : contains

    WORKSPACES ||--o{ VEGETABLE_PRODUCE_CATALOG : sells
    VEGETABLE_PRODUCE_CATALOG ||--o{ VEGETABLE_PRODUCE_ALIASES : aliased_by
    WORKSPACES ||--o{ VEGETABLE_ORDERS : weighs
    VEGETABLE_ORDERS ||--o{ VEGETABLE_ORDER_ITEMS : contains

    WORKSPACES ||--o{ CLINIC_DOCTORS : employs
    CLINIC_DOCTORS ||--o{ CLINIC_APPOINTMENT_SLOTS : schedules
    CLINIC_APPOINTMENT_SLOTS ||--o{ CLINIC_APPOINTMENTS : reserves

    WORKSPACES ||--o{ AGRI_CROP_CATALOG : lists
    WORKSPACES ||--o{ AGRI_PROCUREMENT_REQUESTS : procures
    AGRI_PROCUREMENT_REQUESTS ||--o{ AGRI_PROCUREMENT_ITEMS : items
    AGRI_PROCUREMENT_REQUESTS ||--o{ AGRI_PICKUP_SCHEDULES : collects
```

---

### 4. DECOUPLED PROVIDER ARCHITECTURE

ZYVO decouples speech-to-text and intent extraction behind abstract provider registries:

```
src/lib/providers/
├── speech/
│   ├── types.ts                (SpeechToTextProvider interface)
│   ├── provider-registry.ts    (Registry holding sarvam, gemini, groq, mock)
│   ├── provider-router.ts      (Selects provider based on env & network availability)
│   ├── mock.adapter.ts         (Local deterministic benchmark speech adapter)
│   ├── sarvam.adapter.ts       (Sarvam Saaras Indic STT adapter)
│   ├── gemini.adapter.ts       (Google Gemini Audio adapter)
│   └── groq.adapter.ts         (Groq Whisper adapter)
└── intent/
    ├── types.ts                (IntentExtractionProvider interface)
    ├── provider-registry.ts    (Registry holding gemini, groq, deterministic)
    ├── provider-router.ts      (Routing logic for structured slot extraction)
    ├── deterministic.adapter.ts(Local multilingual regex evaluator - Active default)
    ├── gemini.adapter.ts       (Gemini structured JSON mode adapter)
    └── groq.adapter.ts         (Groq LLaMA-3 extractor adapter)
```

**Active Hackathon State:** `EXTERNAL_API_ENABLED=false`. All extractions are handled deterministically via `deterministic.adapter.ts` with zero latency, zero cloud costs, and 100% offline reliability.

# ZYVO Phase 3 Architecture Amendment
## Multi-Vertical Modular Platform Architecture & Vertical Registry Contract

**Document ID:** ARCH-AMEND-2026-11-19-ZYVO-03  
**Phase:** Phase 3 — Multi-Vertical Platform Foundation, Architecture Amendment & Core Implementation  
**Date:** 2026-11-19  
**Status:** APPROVED & ACTIVE  
**Product Brand:** **ZYVO**  
**Official Track:** Track ECHO (REWIRED Hackathon)  
**Positioning:** *"One voice platform. Multiple industries. Real business transactions."*  
**Author:** Integration Coordinator & Principal Solution Architect  

---

## 1. Architectural Transformation & Paradigm Shift

In Phase 2, ZYVO was architected specifically for recurring doorstep milk supply. By explicit user directive for Phase 3, ZYVO expands into a **modular, multilingual, voice-first business operations platform** supporting five distinct industry verticals:
1. **Milk Delivery** (`milk_delivery`) — Reference implementation.
2. **Kirana Store** (`kirana`) — Neighborhood grocery ordering & itemized catalogue matching.
3. **Vegetable Vendor** (`vegetable_vendor`) — Fresh produce ordering with weight/bundle units.
4. **Clinic Appointments** (`clinic`) — Outpatient doctor scheduling & slot availability management.
5. **Agriculture Produce Procurement** (`agriculture`) — Crop procurement registration & farmer pickup scheduling.

### Modular Monolith Architectural Pattern
- **Why Not Microservices?** A 6-hour hackathon build window cannot absorb microservice networking overhead, multiple Docker containers, independent deployments, or distributed tracing.
- **Why Not a Giant Switch Statement?** A monolithic switch statement (`switch(vertical) { case 'milk': ... }`) across every endpoint quickly deteriorates into spaghetti code, making testing and modular vertical development impossible.
- **The Solution — Typed Vertical Registry**:
  A modular monolith architecture with a unified platform core and an explicit **Typed Vertical Registry (`VerticalModuleDefinition`)**. Every vertical module registers its own metadata, supported operations, slot validation schema, proposal processor, and database persistence handlers behind standard TypeScript interfaces.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT WORKSPACE SHELL                                   │
│  ┌───────────────────────┐  ┌────────────────────────────────────────────────────────┐  │
│  │   Persistent Sidebar  │  │ Dynamic Module View (/milk, /kirana, /veg, /clinic, etc│  │
│  │ • ZYVO Overview       │  │ • Voice Recording Modal / PWA Audio Streamer           │  │
│  │ • 5 Industry Modules  │  │ • Real-time Proposal Review & Diff Card                │  │
│  │ • Workspace Context   │  │ • Module-Specific Business Dashboard & Manifests       │  │
│  └───────────┬───────────┘  └───────────────────────────┬────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┼───────────────────────────────┘
               │ HTTP Requests                            │ Audio Upload & Commands
               ▼                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ZYVO PLATFORM CORE (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • Authentication & Sessions (HttpOnly zyvo_session cookie)                              │
│ • Multi-Tenant Workspace & Membership Isolation (workspaces, workspace_memberships)     │
│ • Universal Voice Submission Pipeline (storage/audio/{uuid}.webm)                       │
│ • Sovereign Indic Speech Recognition (Sarvam Saaras v4 REST, zero FFmpeg)               │
│ • Structured Intent & Slot Extractor (Gemini 3.5 Flash-Lite / Option A Regex Parser)    │
│ • Generic Proposal State Machine (RECEIVED → TRANSCRIBED → PROPOSAL → APPLIED)          │
│ • Shared Audit Logging & Dispute Replay (audit_events)                                  │
│ • Node.js Built-in SQLite Database Engine (Database class in node:sqlite)               │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │ Dispatches by vertical_type
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TYPED VERTICAL MODULE REGISTRY                             │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┬─────────────┤
│  milk_delivery   │      kirana      │ vegetable_vendor │      clinic      │ agriculture │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┼─────────────┤
│ • Cutoffs & Subs │ • Product Catalog│ • Produce Catalog│ • Doctors & Depts│ • Crop Cat  │
│ • Calendar SSOT  │ • Aliases Table  │ • Produce Aliases│ • Appt Slots     │ • Requests  │
│ • Manifest View  │ • Grocery Orders │ • Sabzi Orders   │ • Appointments   │ • Items     │
│ • Ledger Preview │ • Line Items     │ • Fulfilment List│ • Slot Conflict  │ • Schedules │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┴─────────────┘
```

---

## 2. Vertical Module Definition Contract

Each business module implements the following standard interface:

```typescript
export interface VerticalModuleDefinition<TSlots = any, TProposal = any> {
  id: 'milk_delivery' | 'kirana' | 'vegetable_vendor' | 'clinic' | 'agriculture';
  displayName: string;
  tagline: string;
  routePath: string;
  iconName: string; // Lucide icon identifier (no emoji)
  supportedOperations: string[];
  foundationStatus: 'active_reference' | 'foundation_ready' | 'pending_workflow';
  
  // Validation & Business Handlers
  validateSlotInput: (slots: TSlots) => { isValid: boolean; errors?: string[]; clarificationNeeded?: string };
  generateProposal: (slots: TSlots, context: TransactionContext) => Promise<TProposal>;
  commitTransaction: (proposal: TProposal, context: TransactionContext, db: Database) => Promise<TransactionCommitResult>;
  getDashboardData: (workspaceId: string, db: Database) => Promise<any>;
}
```

---

## 3. Database Architecture: Shared Platform + Domain Schemas

### Shared Platform Tables
1. `users` — Authentication identities (`id`, `name`, `phone`, `email`, `role`, `created_at`).
2. `sessions` — Cryptographic session tokens (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`).
3. `workspaces` — Multi-tenant domain contexts (`id`, `name`, `vertical_type`, `owner_id`, `created_at`).
4. `workspace_memberships` — Roles within workspace (`id`, `workspace_id`, `user_id`, `role`, `created_at`).
5. `voice_submissions` — Generic voice transaction records (`id`, `workspace_id`, `user_id`, `vertical_type`, `audio_file_path`, `audio_mime_type`, `transcript_raw`, `detected_language`, `state`, `proposal_json`, `clarification_prompt`, `confirmed_at`, `confirmed_by`, `idempotency_key`, `created_at`).
6. `audit_events` — Dispute evidence log (`id`, `workspace_id`, `submission_id`, `user_id`, `vertical_type`, `event_timestamp`, `transcript_span`, `action_type`, `prior_state_json`, `new_state_json`, `confirmed_by`).

### Domain Entity Tables
- **Milk Delivery**: `milk_vendor_cutoffs`, `milk_customer_subscriptions`, `milk_delivery_calendar` (Constraint: `UNIQUE(workspace_id, customer_id, delivery_date)`).
- **Kirana Store**: `kirana_product_catalog`, `kirana_product_aliases`, `kirana_grocery_orders`, `kirana_grocery_order_items`.
- **Vegetable Vendor**: `vegetable_produce_catalog`, `vegetable_produce_aliases`, `vegetable_orders`, `vegetable_order_items`.
- **Clinic Appointments**: `clinic_doctors`, `clinic_appointment_slots`, `clinic_appointments` (Strict non-diagnostic scheduling data only).
- **Agriculture Procurement**: `agri_crop_catalog`, `agri_procurement_requests`, `agri_procurement_items`, `agri_pickup_schedules`.

All monetary amounts strictly use **integer paise**.

---

## 4. Phase 3 Scope & Staging Rules

1. **Phase 3 Focus**: Deliver the **shared platform core, database schemas, vertical registry, and application shell** supporting all five modules.
2. **Honest Foundation Status**: For modules whose complete domain workflows will be built in subsequent phases, the UI displays an honest foundation/setup status. No module will be falsely described as fully functional until its dedicated phase is completed.
3. **Subsequent Phasing**:
   - Phase 4: Module 1 — Milk Delivery (Full Reference Workflow)
   - Phase 5: Module 2 — Kirana Store (Grocery Voice Ordering)
   - Phase 6: Module 3 — Vegetable Vendor (Produce Orders & Fulfilment Lists)
   - Phase 7: Module 4 — Clinic Appointments (Slot Verification & Scheduling)
   - Phase 8: Module 5 — Agriculture Procurement (Produce Registration & Logistics)
   - Phase 9: Final Cross-Module Integration, PWA Polish & Rehearsal

---

*Last updated: 2026-11-19 (Phase 3 Architecture Amendment)*

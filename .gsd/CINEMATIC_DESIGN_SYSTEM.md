# ZYVO CINEMATIC SPATIAL OPERATIONS DESIGN SYSTEM
### The Operational Observatory: Architectural & Visual Specification

**Document ID:** CDS-2026-11-19-ZYVO-01  
**Project:** ZYVO  
**Initiative:** REWIRED (Track ECHO)  
**Positioning:** *"One voice platform. Multiple business workflows."*  
**Date:** 2026-11-19  
**Status:** AUTHORITATIVE SPECIFICATION  

---

## 1. Creative Direction: The Operational Observatory

ZYVO is conceived as an **Operational Observatory**: one engineered voice core connects five distinct business environments, while transactions are presented as precise, contextual records.

The experience feels like a carefully lit precision instrument in a quiet operational gallery, not a neon science-fiction dashboard or generic AI SaaS template.

### The Three Storytelling Layers
1. **Shared Engine (The Voice Core):** A central engineered 3D instrument representing the universal voice-to-transaction ingestion, transcription, structured slot extraction, and proposal generation engine.
2. **Specialized Business Environments (Five Industry Nodes):** Five structurally distinct nodes radiating outward from the Voice Core, each modeling the specialized operational geometry of Milk Delivery, Kirana Grocery, Vegetable Vendor, Outpatient Clinic, and Agriculture Procurement.
3. **Evidence & Truth (The Audit & Transaction Ledger):** Grounded transaction records, manifests, calendar states, and dispute logs presented with mathematical precision, tabular figures, and full provenance linking back to raw audio notes.

---

## 2. Color Palette & Design Tokens

Tokens are calibrated for dark-mode contrast compliance (WCAG 2.2 AA), restrained materiality, and tonal separation without heavy shadows or artificial gradients.

| Token Name | Hex Value | Semantic Role & Purpose |
|---|---|---|
| `--canvas` | `#101211` | Main near-black ambient observatory environment |
| `--surface-recessed` | `#171B19` | Side navigation, sub-panels, and inset wells |
| `--surface-raised` | `#202622` | Primary operational cards, manifests, and tables |
| `--surface-active` | `#2A322D` | Selected tabs, focused states, and hovered rows |
| `--text-primary` | `#F2EFE6` | Headlines, primary operational data, and prominent readouts |
| `--text-secondary` | `#C3CBC3` | Supporting descriptions, section intros, and secondary labels |
| `--text-muted` | `#A4B0A6` | Column headers, timestamps, units, and archival IDs |
| `--accent-emerald` | `#69D9AD` | Primary interaction accent, active Voice Core illumination |
| `--accent-deep-emerald`| `#24765E` | Supporting 3D scene lighting and deep atmospheric tone |
| `--accent-teal` | `#86D5D4` | Cool technical accents and clinic appointment markers |
| `--accent-amber` | `#DAB77A` | Restrained commerce accents, harvest benchmarks, and alerts |
| `--border-subtle` | `#2C3530` | Subtle internal card dividers and table borders |
| `--border-strong` | `#46534A` | Structural containers, interactive controls, and inputs |
| `--state-error` | `#F1A79C` | Error banners and cutoff rejections (paired with text) |
| `--state-success` | `#A4E4B5` | Confirmed proposals and applied states (paired with text) |

### Industry Accents
Each industry shares the core structural system while carrying a restrained, distinct accent:
* **Milk Delivery:** Cool Ivory (`#F2EFE6`) and Muted Blue-Green (`#86D5D4`)
* **Kirana Store:** Warm Amber (`#DAB77A`) and Brushed Bronze (`#B89558`)
* **Vegetable Vendor:** Leaf Green (`#69D9AD`) and Restrained Produce Olive (`#82A355`)
* **Clinic Appointments:** Soft Cyan (`#86D5D4`) and Architectural Ivory (`#F2EFE6`)
* **Agriculture Procurement:** Harvest Amber (`#DAB77A`) and Field Green (`#82A355`)

*Rule: Industry accents are never used in isolation to signal status; every state is paired with clear text and structural iconography.*

---

## 3. Typography Scale & Numerical Precision

To prevent layout jitter and ensure institutional financial rigor, all numbers, prices, weights, quantities, timestamps, and IDs strictly use **tabular monospaced lining numerals**.

| Role | Desktop Size | Mobile Size | Line Height | Tracking | Weight |
|---|---|---|---|---|---|
| **Display Heading** | 56px | 36px | 1.1 | -0.02em | Semibold (600) |
| **Page Heading** | 36px | 28px | 1.2 | -0.015em | Medium (500) |
| **Section Heading** | 22px | 18px | 1.3 | -0.01em | Medium (500) |
| **Body Primary** | 16px | 15px | 1.5 | 0 | Regular (400) |
| **Supporting Text** | 14px | 13px | 1.45 | 0 | Regular (400) |
| **Tabular Figures** | 14px / 16px | 14px | 1.4 | 0.02em | Medium / Mono |
| **Archival Metadata** | 12px | 11px | 1.4 | 0.04em | Medium / Mono |

---

## 4. Surface Hierarchy & Grid System

### Six Visual Layers
1. **Layer 0 (Canvas):** Near-black `#101211` matte backdrop.
2. **Layer 1 (Atmosphere):** Restrained radial emerald/teal gradient glow centered on the Voice Core.
3. **Layer 2 (Spatial Geometry):** Interactive 3D WebGL scene with the Voice Core and 5 industry nodes.
4. **Layer 3 (Primary Information):** High-contrast bone text `#F2EFE6` providing immediate operational clarity.
5. **Layer 4 (Operational Controls):** Tonal raised surfaces (`#202622`), crisp 1px borders (`#46534A`), and 2–4px softly softened corners. Zero pill buttons.
6. **Layer 5 (Evidence & Audit):** Tabular data sheets, diff badges, audio playback widgets, and confirmation drawers.

### Spacing & Grid Scale
* **Base Unit:** 4px spacing scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px).
* **Desktop Grid:** 12-column grid, max-width 1440px, 24px gutters.
* **Tablet Grid:** 8-column grid, max-width 1024px, 16px gutters.
* **Mobile Grid:** 4-column grid, min-width 360px, 12px/16px gutters. Zero horizontal scroll.

---

## 5. Signature 3D Architecture: ZYVO Voice Core & Industry Nodes

### 5.1 Object Engineering
The central **Voice Core** is an engineered spatial instrument:
* **Faceted Inner Core:** An icosahedral / segmented polyhedron rotating slowly on its axis, bathed in emerald illumination.
* **Partial Structural Bands:** Two concentric, notched metallic rings orbiting at deliberate angular offsets, suggesting gyroscopic calibration.
* **Sound-Wave Lattice:** Radiating concentric ring geometry whose vertex scale or pulsation expands when voice recording or audio playback is active.
* **Radial Energy Conduits:** Five luminous polyline vectors projecting outward to the five peripheral industry nodes.

### 5.2 Five Distinct Industry Nodes
Each peripheral node has unique physical geometry reflecting its operational workflow:
1. **Milk Delivery (`NODE-MILK`):** Cylindrical vessel with graduated measurement rings and a subtle directional fluid path.
2. **Kirana Store (`NODE-KIRANA`):** Geometric modular shelf assembly holding unbranded rectangular package forms.
3. **Vegetable Vendor (`NODE-VEG`):** Planar balancing platform with faceted produce silhouettes indicating fractional weight.
4. **Clinic Appointments (`NODE-CLINIC`):** Concentric architectural time-dial planes with open and reserved slot apertures.
5. **Agriculture Procurement (`NODE-AGRI`):** Stepped terraced landscape geometry beneath a geometric harvest storage volume.

### 5.3 Interaction & Synchronization
* **Dual-Channel Selection:** Selecting a node via mouse raycasting or touch in WebGL immediately synchronizes with the companion HTML module switcher, and vice-versa.
* **Keyboard Accessibility:** Every node is operable via standard `<button>` controls with `:focus-visible` outline rings.
* **Camera Reframe:** Selecting a node gently reframes the camera toward that sector (350–500ms cubic-bezier transition).
* **Graceful Degradation:**
  * When `prefers-reduced-motion` is active: Continuous rotation and camera travel are disabled; the scene remains static.
  * When WebGL is unavailable or disabled: An intentional, styled SVG architectural diagram renders seamlessly with identical selection controls and route links.

---

## 6. Voice Interaction State Machine

Visuals are strictly bound to real browser and application lifecycle states:

```
[IDLE] ──────────────────────► [RECORDING]
  │                                │ (Real MediaRecorder + Web Audio Analyser)
  │ (Manual Transcript)           ▼
  └──────────────────────────► [PROCESSING]
                                   │ (Deterministic / Model parsing)
                                   ▼
                         [PROPOSAL_CREATED]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
    [NEEDS_CLARIFICATION]                     [AWAITING_CONFIRMATION]
              │                                         │
              ▼                                   ┌─────┴─────┐
       (User correction)                          ▼           ▼
                                              [APPLIED]   [REJECTED]
```

* **No Fake Waveforms:** The recording waveform reflects real microphone frequency data via `AudioContext` and `AnalyserNode`. If the microphone is inactive or denied, an honest static indicator is displayed.
* **Two-Phase Confirmation:** The `APPLIED` state is rendered only after the backend REST endpoint returns HTTP 200 and commits the SQLite transaction.

---

## 7. Motion & Interaction Matrix

| Interaction | Trigger | Visual Behavior | Duration / Easing | Reduced Motion |
|---|---|---|---|---|
| **Core Idle** | Scene mounted & visible | Subtle gyroscopic drift ($\pm 0.05$ rad) | Continuous, 0.002 rad/frame | Completely static |
| **Node Selection** | Click / Tap / Key | Node scales 1.15x, conduit pulses emerald | 250ms ease-out | Immediate scale change |
| **Camera Reframe** | Module switched | Camera orbital angle shifts toward node | 450ms cubic-bezier(0.2, 0.8, 0.2, 1) | Instant reframe |
| **Voice Record** | User clicks Record | Sound lattice expands, emerald pulse | Immediate state bind | Stable emerald border |
| **Proposal Preview** | Proposal generated | Slide-in drawer with diff summary | 220ms ease-out | Immediate appearance |
| **Backend Applied** | HTTP 200 response | Success banner with audit ID & balance diff | 300ms ease-out | Immediate appearance |

---

## 8. Absolute Anti-Patterns (Strictly Prohibited)

1. ❌ **No purple/violet gradients** or generic "AI space" backgrounds.
2. ❌ **No pill-shaped buttons** (strict 2–4px rectangular corners).
3. ❌ **No emoji icons** in interface buttons or status badges (Lucide SVG only).
4. ❌ **No fake user counters, fake review stars, or artificial social proof badges**.
5. ❌ **No generic AI SaaS copy** (*"Experience the power of next-gen AI"*).
6. ❌ **No cursor-following decorations or custom cursor animations**.
7. ❌ **No em dashes (—)** in user-facing UI copy (use standard punctuation, commas, or colons).
8. ❌ **No unverified or simulated audio waveforms** presented as live microphone input.
9. ❌ **No floating random particles** or distracting decorative noise.

---

*Verified and authoritative for ZYVO Cinematic Spatial Operations Transformation.*

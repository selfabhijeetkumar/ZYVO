# ZYVO — HACKATHON DEMONSTRATION RUNBOOK
## Operational Instructions for Hackathon Judges & Evaluators

---

### 1. SYSTEM OVERVIEW

- **Product Name:** ZYVO
- **Hackathon Initiative:** REWIRED
- **Track:** Track ECHO
- **Positioning:** *"One voice platform. Multiple industries. Real business transactions."*
- **Technology Stack:** Next.js 16 (React 19, Turbopack), TypeScript, Tailwind CSS v4, Node.js v26 standard library SQLite (`DatabaseSync`), Lucide React.
- **Financial Architecture:** Integer paise storage (₹1.00 = 100 paise) across all pricing engines.

---

### 2. PREREQUISITES & STARTUP

#### Step 1: Open Terminal & Navigate to Project
```powershell
cd "c:\MILKY WAY\zyvo"
```

#### Step 2: Verify Dependencies & Database
The project utilizes the Node.js standard library `node:sqlite`. No external database daemons or native C++ compilation are required.
```powershell
npm test
```
*Expected result: 11 / 11 test suites passing (100%).*

#### Step 3: Start Application Server
```powershell
npm run dev
```
Open your browser to: **`http://localhost:3000`**

*(Alternatively, to run the compiled production build: `npm run build && npm run start`)*

---

### 3. DEMO PERSONAS & AUTHENTICATION

ZYVO features a built-in session switcher in the top navigation bar:

1. **Kumar Operator (Platform Operator / Vendor / Doctor / Buyer)**
   - Role: `operator`
   - Capabilities: View route dispatch manifests, weigh/pack vegetable orders, manage OPD clinic schedules, advance procurement status.
2. **Ramesh Sharma (Customer / Farmer / Patient)**
   - Role: `customer` (maps to vertical roles: customer, patient, farmer)
   - Capabilities: Voice/text ordering, modify subscriptions, book doctor consultations, register harvest lots.

*To switch personas:* Click the **Operator** or **Customer** button in the top header. The interface immediately re-authenticates and adjusts views accordingly.

---

### 4. FIVE-INDUSTRY DEMO WALKTHROUGH

Each demonstration follows the canonical ZYVO pipeline:
```
Voice Input / Transcript → Structured Request → Domain Validation → Clarification (if ambiguous) → Proposal Preview → Explicit Confirmation → Committed Transaction → Operator View & Audit Trail
```

#### Demo 1: Milk Delivery Operations (`/milk`)
- **Use Case:** Customer daily doorstep delivery adjustments.
- **Workflow:**
  1. Navigate to `/milk`.
  2. In the Customer View, observe the 30-day baseline bill preview: **₹2,100.00** (30 days @ 1000ml @ ₹70/L).
  3. Under Voice Pipeline Simulator, select the preset:
     `"Bhaiya kal aur parso doodh mat dena, aur 22 ko aadha litre extra bhej dena"`
  4. Click **Process Voice Submission**.
  5. Inspect the Extracted Transaction Proposal:
     - Pause dates: `2026-11-20` and `2026-11-21`
     - Extra delivery: `+500ml` on `2026-11-22`
  6. Click **Confirm & Apply Transaction**.
  7. Observe the updated bill: **₹1,995.00** (199,500 paise, verified Phase 2 benchmark).
  8. Switch to the **Vendor Delivery Manifest** tab: inspect the daily route load in liters and the customer exception list.

#### Demo 2: Kirana Store FMCG Orders (`/kirana`)
- **Use Case:** Frequent grocery basket ordering with colloquial Hindi/Hinglish terms.
- **Workflow:**
  1. Navigate to `/kirana`.
  2. Select preset: `"Do packet Maggi, ek kilo chawal aur aadha kilo chini bhej dena"`.
  3. Click **Process Voice Submission**.
  4. Inspect parsed items:
     - *Maggi* resolved to *Maggi 2-Minute Noodles* (2 packets @ ₹14 = ₹28.00)
     - *Chawal* resolved to *Basmati Rice (Tukda)* (1 kg @ ₹60 = ₹60.00)
     - *Chini* resolved to *Refined Sugar* (0.5 kg @ ₹44/kg = ₹22.00)
     - Subtotal: **₹110.00** (11,000 paise).
  5. Click **Confirm & Apply Transaction**.
  6. Switch to **Vendor Store Fulfillment** tab: observe the order in the bagging queue and advance status from `CONFIRMED` $\rightarrow$ `PACKED` $\rightarrow$ `FULFILLED`.

#### Demo 3: Vegetable Vendor Mandi Produce (`/vegetables`)
- **Use Case:** Mandi fresh produce with fractional weights (grams/bundles/kg).
- **Workflow:**
  1. Navigate to `/vegetables`.
  2. Select preset: `"Bhaiya 1 kilo aloo aur aadha kilo tamatar bhej do"`.
  3. Click **Process Voice Submission**.
  4. Inspect extracted line items:
     - *Aloo* (Potato): 1 kg @ ₹30.00/kg = ₹30.00
     - *Tamatar* (Tomato): 500 grams @ ₹40.00/kg = ₹20.00
     - Subtotal: **₹50.00** (5,000 paise).
  5. Click **Confirm & Apply Transaction**.
  6. Switch to **Vendor Mandi Fulfillment** tab: observe the **Procurement & Weighing Manifest** which automatically aggregates total kilograms and bundles required across all customer orders.

#### Demo 4: Clinic Appointments (`/clinic`)
- **Use Case:** Outpatient doctor consultation booking with non-diagnostic privacy.
- **Workflow:**
  1. Navigate to `/clinic`.
  2. Note the strict Non-Diagnostic Banner: clinical symptoms and prescriptions are never stored.
  3. Select physician **Dr. Ramesh Rao, MBBS** (General Medicine, Fee: ₹300).
  4. Select preset: `"Dr. Ramesh Rao ke saath kal subah 10 baje ka appointment book kar do"`.
  5. Click **Process Voice Submission** and click **Confirm & Apply Transaction**.
  6. Switch to **Doctor Daily Manifest** tab: observe the patient listed in the confirmed schedule.
  7. Demonstrate cancellation: click **Cancel & Free Slot** to immediately release the outpatient slot back to the available pool.

#### Demo 5: Agriculture Produce Procurement (`/agriculture`)
- **Use Case:** Farm-gate harvest lots with official MSP compliance.
- **Workflow:**
  1. Navigate to `/agriculture`.
  2. Observe the Mandi Rate Board:
     - **Wheat:** Official MSP Benchmark (RMS 2025-26: ₹2,425/quintal, PIB PRID 2269182).
     - **Mustard Seed:** Official MSP Benchmark (RMS 2025-26: ₹5,950/quintal).
     - **Tomato & Potato:** Non-MSP Horticultural produce with negotiated indicative spot rates.
  3. Select preset: `"Hamare paas 20 quintal Sharbati gehu taiyar hai, pickup schedule kar do"`.
  4. Click **Process Voice Submission**.
  5. Inspect the indicative payout preview: 20 quintals @ ₹2,425/q = **₹48,500.00** (4,850,000 paise).
  6. Click **Confirm & Apply Transaction**.
  7. Switch to **Buyer Procurement Logistics** tab: observe the lot and advance status: `REGISTERED` $\rightarrow$ `VERIFIED` $\rightarrow$ `PICKUP_SCHEDULED` $\rightarrow$ `COLLECTED`.

---

### 5. AUDIT TIMELINE INSPECTION (`/activity`)

Navigate to `/activity` at any time during the demonstration:
- Every voice note, proposal creation, confirmation, and cancellation creates an immutable record in `audit_events`.
- Click on any submission to inspect the raw transcript, prior state, new state, actor ID, and linked audio file path on disk.

---

### 6. SAFE DEMO DATA RESET

To restore all dynamic demonstration data back to a clean baseline:
```powershell
powershell -File scripts\reset-demo.ps1 -ConfirmDemoReset
```
This purges test orders, calendar modifications, and appointments while preserving core users, workspaces, and product catalogs.

---

### 7. REMOTE MOBILE DEVICE EVALUATION (OPTIONAL)

Remote mobile browsers require a secure HTTPS context for microphone hardware access.

To test on a physical mobile device:
1. Verify application is running: `powershell -File scripts\check-mobile-demo.ps1`
2. If `cloudflared` is installed: `powershell -File scripts\start-mobile-demo.ps1 -StartTunnel`
3. Scan the generated QR code or open the temporary HTTPS URL on your mobile phone.
4. Test live microphone recording in `VoiceActionCard.tsx`!

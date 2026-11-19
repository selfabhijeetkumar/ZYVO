# ZYVO — VERCEL DEPLOYMENT REPORT
## Production & Preview Deployment Verification

**Product:** ZYVO  
**Initiative:** REWIRED · **Track:** ECHO  
**Vercel Project:** `selfabhijeetkumar-9786s-projects/zyvo`  
**Live Production URL:** [https://zyvo-delta.vercel.app](https://zyvo-delta.vercel.app)  
**Deployment URL:** [https://zyvo-4kq9n5mg1-selfabhijeetkumar-9786s-projects.vercel.app](https://zyvo-4kq9n5mg1-selfabhijeetkumar-9786s-projects.vercel.app)  
**Deployment ID:** `dpl_F99KoMyCf5mzeSRL1BSHCdG3PUf4`  
**Deployment Status:** **READY (● Ready)**  
**Build Time:** 38 seconds  
**Timestamp:** 2026-11-19T16:21:00+05:30  

---

## 1. DEPLOYMENT ARCHITECTURE & STATUS

| Metric | Target / Value | Status |
|---|---|---|
| **Vercel Account** | `selfabhijeetkumar-9786` | Authenticated |
| **Project Name** | `zyvo` | Linked |
| **Connected GitHub Repo** | `https://github.com/selfabhijeetkumar/ZYVO` | Connected |
| **Next.js Version** | 16.4.6 (App Router + Turbopack) | Compiled Cleanly |
| **Output Type** | 34 Serverless Functions & Static Prerendered Pages | Deployed |
| **Deployment URL** | `https://zyvo-delta.vercel.app` | Verified Live (HTTP 200) |

---

## 2. VERIFIED ENDPOINTS & PAGES (LIVE ON VERCEL)

1. **Platform Overview & Observatory:**
   - URL: `https://zyvo-delta.vercel.app/`
   - Status: HTTP 200 OK — Rendered Three.js 3D Voice Core, sector switcher, and 5-industry bento grid.

2. **Diagnostics & Telemetry:**
   - URL: `https://zyvo-delta.vercel.app/api/admin/provider-health`
   - Status: HTTP 200 OK — Live health JSON reporting active speech and intent routers, mock-mode fallback protection, and clinic privacy shield.

3. **Kirana Grocery Catalog API:**
   - URL: `https://zyvo-delta.vercel.app/api/kirana/catalog`
   - Status: HTTP 200 OK — Relational product catalog and Indic colloquial aliases returned directly from SQLite database.

4. **Five Industry Operational Screens:**
   - Milk Delivery: `https://zyvo-delta.vercel.app/milk` (HTTP 200)
   - Kirana Store: `https://zyvo-delta.vercel.app/kirana` (HTTP 200)
   - Vegetable Vendor: `https://zyvo-delta.vercel.app/vegetables` (HTTP 200)
   - Clinic Appointments: `https://zyvo-delta.vercel.app/clinic` (HTTP 200)
   - Agriculture Procurement: `https://zyvo-delta.vercel.app/agriculture` (HTTP 200)
   - Activity & Audit: `https://zyvo-delta.vercel.app/activity` (HTTP 200)
   - Platform Settings: `https://zyvo-delta.vercel.app/settings` (HTTP 200)

---

## 3. SQLITE DATABASE COMPATIBILITY & PERSISTENCE FINDINGS

### A. Current Implementation
- **Driver:** Node.js built-in `node:sqlite` (`DatabaseSync` class).
- **Vercel Runtime Configuration:**
  - Vercel Serverless Functions have a read-only root filesystem.
  - To prevent `EROFS: read-only file system` errors, the database and audio storage directories adapt dynamically:
    ```ts
    const dbDir = process.env.VERCEL ? '/tmp' : process.cwd();
    const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'zyvo.db');
    ```
  - On cold start, the database file `/tmp/zyvo.db` is initialized, seeded with master catalogs and seed accounts, and executes in WAL mode.

### B. Production Persistence Boundary Disclosures
- **Ephemeral Container Scope:** A SQLite database residing in `/tmp/zyvo.db` within a Vercel Serverless Function is ephemeral. Data mutations are scoped to that specific lambda execution environment.
- **Concurrency & Cold Starts:** New serverless container instances spin up with a clean seeded database; mutations written in one lambda instance do not replicate across separate concurrent instances.
- **Production Recommendation:** For enterprise multi-region scaling with persistent business data, ZYVO’s database layer can be pointed to a managed cloud database (such as Supabase PostgreSQL, Neon, or Turso managed SQLite) without altering domain application routes. For the hackathon demonstration and preview evaluation, the current `/tmp` execution provides zero-cost, fully functional demonstration capability.

---

## 4. ENVIRONMENT VARIABLE CONFIGURATION

- `EXTERNAL_API_ENABLED=false` (Default on Vercel deployment, guarding against external API costs until the operator explicitly configures API keys in the Vercel Dashboard).
- When ready for live production STT and Intent extraction, configure the following secrets via the Vercel Project Settings (`Environment Variables`):
  - `SARVAM_API_KEY`: Private Sarvam AI subscription key.
  - `GOOGLE_AI_API_KEY`: Private Google AI Gemini key.
  - `EXTERNAL_API_ENABLED`: Set to `true`.

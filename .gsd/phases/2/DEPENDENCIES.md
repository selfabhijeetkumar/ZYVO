# ZYVO Provider Readiness & Dependency Checklist

**Document ID:** DEP-2026-11-19-ZYVO-02  
**Phase:** Phase 2.2 — Final Architectural Reconciliation & Specification Approval Readiness  
**Date:** 2026-11-19  
**Status:** PROPOSED — AWAITING USER APPROVAL  
**Product Brand:** **ZYVO**  
**Official Track:** REWIRED Track ECHO  

---

## 1. Readiness Classification Taxonomy

To ensure complete architectural precision and prevent premature claims, all components are classified into five explicit statuses:
- **Specified**: Architected, schemas defined, contracts documented in `.gsd/SPEC.md`. Zero code written.
- **Documented**: Operational procedures, constraints, and boundaries recorded in guides.
- **Validated by non-destructive test**: Empirically verified via live CLI execution on the host machine without mutating repository state.
- **Implemented**: Application source code written, compiled, and deployed. (*Currently ZERO across the entire project*).
- **Not yet tested**: Planned integration that has not undergone live invocation.

---

## 2. Final Dependency Matrix

| Dependency | Purpose | Current Status | Required Before MVP |
|---|---|---|---|
| **Sarvam API key and credits** | Live Indic speech recognition (STT) across Hindi, Kannada, English | **Pending until verified** (Hackathon registration pending on Indus portal; 500 credits to be activated) | **Yes for live STT** (Offline benchmark audio mock toggle specified as zero-credit fallback) |
| **Gemini API access/key** | Structured intent and slot extraction (`gemini-3.5-flash-lite`, Schema Mode) | **Conditional** (Must verify current model `gemini-3.5-flash-lite` and separate application project entitlement in Google AI Studio) | **Conditional** (Option A Bounded TypeScript Pattern Parser is fully specified as zero-cost deterministic fallback) |
| **SQLite built-in module** | Local persistence and atomic transaction state machine | **Validated by non-destructive test** (Node.js v26.13.1 built-in `node:sqlite` `Database` class empirically verified operational on host) | **Yes** |
| **Cloudflare / ngrok tunnel** | Mobile HTTPS Secure Context for physical smartphone microphone access | **Documented / Not installed** (Not installed in Phase 0; Quick Tunnel with `--allowed-mail` access restriction architected) | **Yes for remote phone test** (Desktop browser testing works directly over `http://localhost:3000`) |
| **Git repository** | Atomic per-task commits (`type(scope): description`) | **Validated CLI / Not initialized** (Git v2.56.0 operational; isolated repository at `c:\MILKY WAY\zyvo` with `.gitignore` planned) | **Before Wave 1** |
| **Audio storage** | Private retention of raw customer voice notes for dispute resolution | **Specified** (Private server storage in `storage/audio/{uuid}.webm` with authenticated streaming endpoint architected) | **Yes** |
| **Authentication & Access Control** | Session management, IDOR defense, and customer/vendor route isolation | **Specified only** (HTTP-only `zyvo_session` cookie, SameSite policy, 2-role matrix, and `X-Admin-Secret` maintenance gate architected; zero code written) | **Yes** |

> [!IMPORTANT]
> **Orchestrator vs Application Key Distinction:**
> Do not assume that using Gemini models inside the Antigravity IDE grants the running web application independent Gemini API access. The running Next.js application requires its own server-side `GEMINI_API_KEY` configured in `.env.local` to call Google AI Studio endpoints. If no key is provided, the application automatically runs on **Option A (Bounded Deterministic Pattern Parser)** with zero degradation in core delivery scheduling capabilities.

---

## 3. Safe Provider-Readiness Checklist for User

Before Wave 1 execution begins, the user may execute the following non-blocking setup actions outside of chat:

### Action 1: Sarvam AI Indus Registration & Key
1. Visit the official Indus portal: `https://indus.sarvam.ai/?utm_source=devrel&utm_medium=hackathon&utm_campaign=rewired`
2. Complete participant registration and generate an API key.
3. Place key in `.env.local` (never committed to Git):
   ```bash
   SARVAM_API_KEY=your_actual_key_here
   ```

### Action 2: Gemini API Key for Structured Extraction (Optional)
1. Visit Google AI Studio: `https://aistudio.google.com/`
2. Create or verify a Gemini API project key with access to `gemini-3.5-flash-lite`.
3. Place key in `.env.local`:
   ```bash
   GEMINI_API_KEY=your_actual_key_here
   ```
*(If omitted, ZYVO executes seamlessly via Option A Bounded Pattern Parser)*.

### Action 3: Git Repository Initialization Permission
- Confirm permission for the engineering team to create an isolated project directory `c:\MILKY WAY\zyvo` and run `git init` inside it to support GSD atomic task commits without affecting `gemini-web2api`.

---

*Last updated: 2026-11-19 (Phase 2.2 Dependencies)*

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#46534A]">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#A4B0A6] hover:text-[#F2EFE6] mb-2 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Observatory
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F2EFE6]">
            ZYVO Platform Privacy Policy
          </h1>
          <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
            DOCUMENT ID: LEGAL-PRIV-2026-01 · DRAFT PRE-LAUNCH SPECIFICATION
          </p>
        </div>
        <div className="w-10 h-10 rounded-xs bg-[#202622] border border-[#69D9AD] flex items-center justify-center text-[#69D9AD]">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Pre-launch Legal Disclaimer Banner */}
      <div className="p-4 rounded-xs border border-[#DAB77A] bg-[#202622] text-[#F2EFE6] text-xs">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#DAB77A] shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-[#DAB77A]">
              Pre-Launch Notice: Legal & Regulatory Review Required
            </div>
            <p className="text-[#C3CBC3] mt-1">
              This document outlines the architectural data privacy and operational integrity safeguards implemented in the ZYVO application. Corporate entity names, registered addresses, formal jurisdictions, and data protection officer contact details are reserved for project owner and legal counsel review prior to public production deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Core Architectural Commitments */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          1. Architectural Data Boundaries & Voice Processing
        </h2>
        <p className="text-xs text-[#C3CBC3] leading-relaxed">
          ZYVO operates as a voice-first business operations platform. Voice submissions captured via client devices are stored locally or in self-hosted relational storage with cryptographic path containment. In the current deployment profile, all speech-to-text transcription and structured intent parsing are performed in a strictly isolated local mode without transmission to third-party advertising or unvetted external services.
        </p>
      </section>

      {/* Section 2: Healthcare & Outpatient Non-Diagnostic Privacy */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          2. Healthcare Privacy Boundary (Clinic Module)
        </h2>
        <p className="text-xs text-[#C3CBC3] leading-relaxed">
          The Clinic Appointments module is strictly limited to administrative scheduling (physician slot selection, rescheduling, and cancellation). The system explicitly rejects and purges any medical symptoms, diagnostic descriptions, prescription records, or clinical notes at the API boundary (enforced by server-side verification). ZYVO does not store or process electronic health records (EHR) or protected health information (PHI).
        </p>
      </section>

      {/* Section 3: Financial & Audit Provenance */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          3. Dispute Audit Trail & Audio Provenance
        </h2>
        <p className="text-xs text-[#C3CBC3] leading-relaxed">
          To resolve vendor-customer discrepancies in daily deliveries and procurement (e.g., milk pauses, mandi weight disputes), voice submissions are linked to immutable audit records containing the recording timestamp, transcript span, and before/after transaction diffs. Users and business operators can inspect or request purging of their voice records through the Activity and Settings interfaces.
        </p>
      </section>

      {/* Section 4: Contact & Pre-launch Review Notice */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          4. Contact Information & Legal Entity
        </h2>
        <p className="text-xs text-[#A4B0A6] font-mono leading-relaxed">
          [LEGAL ENTITY NAME: Pending Owner Formation]<br />
          [REGISTERED JURISDICTION: India / Hackathon Track ECHO]<br />
          [DATA PROTECTION OFFICER CONTACT: legal@zyvo.local - Pending Custom Domain Integration]
        </p>
      </section>
    </div>
  );
}

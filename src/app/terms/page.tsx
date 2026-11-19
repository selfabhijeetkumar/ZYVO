import React from 'react';
import Link from 'next/link';
import { FileText, AlertCircle, ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
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
            ZYVO Terms and Conditions of Service
          </h1>
          <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
            DOCUMENT ID: LEGAL-TERMS-2026-01 · DRAFT PRE-LAUNCH SPECIFICATION
          </p>
        </div>
        <div className="w-10 h-10 rounded-xs bg-[#202622] border border-[#DAB77A] flex items-center justify-center text-[#DAB77A]">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {/* Pre-launch Legal Disclaimer Banner */}
      <div className="p-4 rounded-xs border border-[#DAB77A] bg-[#202622] text-[#F2EFE6] text-xs">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#DAB77A] shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-[#DAB77A]">
              Pre-Launch Notice: Commercial Contract Review Required
            </div>
            <p className="text-[#C3CBC3] mt-1">
              These terms define the operating rules, transaction boundaries, and cutoff policies of the ZYVO platform prototype. Formal legal terms, merchant agreements, payment gateway liability disclosures, and arbitration provisions require sign-off by legal counsel prior to commercial launch.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Platform Purpose & Operational Scope */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          1. Platform Purpose & Multi-Vertical Scope
        </h2>
        <p className="text-xs text-[#C3CBC3] leading-relaxed">
          ZYVO provides a voice-assisted business workflow operating system supporting five specific micro-verticals: Milk Delivery, Kirana Store, Vegetable Vendor, Outpatient Clinic, and Agriculture Produce Procurement. ZYVO functions as a workflow coordination and verification tool, not as a direct seller or distributor of goods.
        </p>
      </section>

      {/* Section 2: Two-Phase Confirmation & Operational Cutoffs */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          2. Two-Phase Voice Confirmation & Cutoff Enforcement
        </h2>
        <p className="text-xs text-[#C3CBC3] leading-relaxed">
          All voice instructions are subject to a mandatory two-phase confirmation protocol. A voice note generates a proposal that must be explicitly reviewed and confirmed before modifying any operational schedules, order queues, or billing balances. In recurring deliveries (such as dairy), modifications requested after the operational cutoff (20:00:00 Asia/Kolkata) are strictly deferred to day D+2 in accordance with vendor depot indent logistics.
        </p>
      </section>

      {/* Section 3: Financial Calculations & Integer Currency */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          3. Billing Precision & Integer Paise Calculations
        </h2>
        <p className="text-xs text-[#C3CBC3] leading-relaxed">
          All financial calculations, billing ledgers, produce totals, and farmer procurement payouts are stored and computed in integer paise (1 Rupee = 100 paise) to eliminate floating-point rounding errors. Indicative agricultural spot market rates are clearly labeled and distinguished from official CCEA MSP benchmarks.
        </p>
      </section>

      {/* Section 4: Reservations & Review Marker */}
      <section className="p-5 rounded-xs border border-[#46534A] bg-[#171B19] space-y-3">
        <h2 className="text-base font-semibold text-[#F2EFE6]">
          4. Jurisdiction & Governance Marker
        </h2>
        <p className="text-xs text-[#A4B0A6] font-mono leading-relaxed">
          [GOVERNING LAW: Laws of India / State Jurisdiction Pending Organization]<br />
          [DISPUTE RESOLUTION: Audit Trail Inspection followed by Independent Arbitration]<br />
          [CUSTOM DOMAIN / TLS: Pending Production Infrastructure Allocation]
        </p>
      </section>
    </div>
  );
}

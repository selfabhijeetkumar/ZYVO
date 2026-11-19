import React from 'react';
import Link from 'next/link';
import { getAllVerticalModules } from '@/lib/vertical-registry';
import { getAuditEvents } from '@/lib/audit';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import SpatialHero from '@/components/spatial/SpatialHero';
import {
  Milk,
  Store,
  Carrot,
  Stethoscope,
  Tractor,
  Layers,
  ShieldCheck,
  Coins,
  ArrowRight,
  Radio,
  FileCheck,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Milk,
  Store,
  Carrot,
  Stethoscope,
  Tractor,
};

export default function PlatformOverviewPage() {
  const modules = getAllVerticalModules();
  let recentEvents: any[] = [];
  try {
    recentEvents = getAuditEvents(undefined, 4);
  } catch (err) {
    console.error('Audit events query error:', err);
  }

  return (
    <div className="space-y-8">
      {/* 1. Spatial Hero: Engineered Voice Core & Industry Orbit */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#69D9AD]">
              OBSERVATORY CORE · VC-01
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#F2EFE6] mt-1">
              ZYVO Operational Observatory
            </h1>
          </div>
          <div className="text-xs text-[#A4B0A6] font-mono">
            ONE VOICE PLATFORM. MULTIPLE BUSINESS WORKFLOWS.
          </div>
        </div>

        {/* 3D WebGL Scene Container */}
        <SpatialHero initialModuleId="milk_delivery" />
      </section>

      {/* 2. Platform Architecture & Protocol Banner */}
      <section className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#69D9AD]">
                System Architecture
              </span>
              <span className="text-[#46534A]">·</span>
              <span className="text-xs text-[#A4B0A6]">Shared Voice-to-Transaction Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-[#F2EFE6]">
              Universal Ingestion with Modular Domain Specialization
            </h2>
            <p className="text-xs sm:text-sm text-[#C3CBC3] leading-relaxed">
              One shared voice ingestion core transcribes and parses multi-dialect Indic speech notes (Hindi, Hinglish, English) into structured transactional proposals. Five decoupled industry adapters enforce strict domain constraints, cutoff logistics, and integer paise arithmetic before database commit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <div className="px-3 py-2 rounded-xs bg-[#202622] border border-[#46534A] text-xs">
              <div className="text-[#A4B0A6] font-mono text-[10px] uppercase">Transaction Protocol</div>
              <div className="text-[#F2EFE6] font-medium mt-0.5">Two-Phase Confirmation</div>
            </div>
            <div className="px-3 py-2 rounded-xs bg-[#202622] border border-[#46534A] text-xs">
              <div className="text-[#A4B0A6] font-mono text-[10px] uppercase">Persistence Engine</div>
              <div className="text-[#69D9AD] font-medium mt-0.5 font-mono">SQLite (node:sqlite WAL)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Five Industry Modules (Bento Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#F2EFE6]">Active Industry Environments</h2>
            <p className="text-xs text-[#A4B0A6] mt-0.5">
              Five specialized business workflows powered by the unified Voice Core
            </p>
          </div>
          <span className="text-xs font-mono text-[#69D9AD]">5 / 5 OPERATIONAL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = ICON_MAP[mod.iconName] || Layers;
            return (
              <div
                key={mod.id}
                className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 flex flex-col justify-between hover:border-[#69D9AD] transition-colors group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xs bg-[#202622] border border-[#46534A] flex items-center justify-center text-[#F2EFE6] group-hover:text-[#69D9AD] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ModuleStatusBadge status={mod.status} label={mod.statusBadgeLabel} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#F2EFE6]">{mod.displayName}</h3>
                    <p className="text-xs text-[#C3CBC3] mt-1 leading-normal line-clamp-2">
                      {mod.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#2C3530] text-[11px] text-[#A4B0A6]">
                    <span className="text-[#F2EFE6] font-medium">Domain Scope: </span>
                    {mod.supportedIntents.slice(0, 2).join(', ')}
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    href={mod.routePath}
                    className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs font-medium transition-colors"
                  >
                    <span>Launch {mod.displayName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#69D9AD]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Real Verified Business Activity (From SQLite Audit Ledger) */}
      <section className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C3530]">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#69D9AD]" />
            <h2 className="text-sm font-semibold text-[#F2EFE6]">
              Recent Verified Operations & Audit Evidence
            </h2>
          </div>
          <Link
            href="/activity"
            className="text-xs text-[#69D9AD] hover:underline font-mono"
          >
            Full Ledger →
          </Link>
        </div>

        {recentEvents.length > 0 ? (
          <div className="divide-y divide-[#2C3530]">
            {recentEvents.map((evt) => (
              <div key={evt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#69D9AD] font-semibold">[{evt.action_type}]</span>
                    <span className="text-[#A4B0A6]">{evt.vertical_type || 'platform'}</span>
                    <span className="text-[#46534A]">·</span>
                    <span className="text-[#F2EFE6]">{evt.actor_name} ({evt.actor_role})</span>
                  </div>
                  {evt.transcript_raw && (
                    <p className="text-[#C3CBC3] italic font-serif text-[11px]">
                      "{evt.transcript_raw}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded-xs bg-[#202622] border border-[#46534A] text-[10px] font-mono text-[#A4E4B5]">
                    {evt.new_state}
                  </span>
                  <span className="text-[11px] font-mono text-[#A4B0A6] tabular-nums">
                    {new Date(evt.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#A4B0A6]">
            No operations recorded yet in this session. Process a voice dispatch in any module above to initialize the audit trail.
          </div>
        )}
      </section>

      {/* 5. Architectural Guarantees & Precision Standards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#69D9AD]">
            01. Voice Lifecycle
          </div>
          <h4 className="text-sm font-medium text-[#F2EFE6]">Deterministic Transaction Protocol</h4>
          <p className="text-xs text-[#C3CBC3] leading-relaxed">
            Every audio note follows an explicit state pipeline. No hallucinated execution: structured proposals must be confirmed before database commit.
          </p>
        </div>

        <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#DAB77A]">
            02. Multi-Tenant Workspace
          </div>
          <h4 className="text-sm font-medium text-[#F2EFE6]">Workspace Data Isolation</h4>
          <p className="text-xs text-[#C3CBC3] leading-relaxed">
            Separate workspaces and database entities for dairy booths, kirana stores, mandi vendors, clinics, and grain procurement lots.
          </p>
        </div>

        <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#86D5D4]">
            03. Privacy Boundaries
          </div>
          <h4 className="text-sm font-medium text-[#F2EFE6]">Non-Diagnostic Health Gate</h4>
          <p className="text-xs text-[#C3CBC3] leading-relaxed">
            Strict isolation for clinic modules: only appointment scheduling is accepted. Symptoms, diagnostics, and prescriptions are rejected by contract.
          </p>
        </div>
      </section>
    </div>
  );
}

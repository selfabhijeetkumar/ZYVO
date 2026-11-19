import Link from 'next/link';
import { getAllVerticalModules } from '@/lib/vertical-registry';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
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
  Mic,
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

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-mono">
            <span>REWIRED 2026 · Track ECHO Official Candidate</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1EADE]">
            ZYVO Multi-Vertical Operations Engine
          </h1>

          <p className="text-sm text-[#8B9CB5] leading-relaxed">
            One voice platform. Multiple industries. Real business transactions.
            Empowering Indian micro-businesses, local vendors, and rural supply chains to transact effortlessly via voice notes in Hindi, Hinglish, and English without complex forms or typing.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs text-[#8B9CB5]">
            <div className="flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Modular Monolith Architecture</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Strict Integer Paise Financials</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Full Audit Traceability</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Industry Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F1EADE]">All 5 Business Modules</h2>
          <span className="text-xs text-[#8B9CB5]">Phase 3 Foundation & Schema Complete</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = ICON_MAP[mod.iconName] || Layers;
            return (
              <div
                key={mod.id}
                className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 flex flex-col justify-between hover:border-[#45474E] transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[#242528] border border-[#2A2C30] flex items-center justify-center text-[#F1EADE] group-hover:text-emerald-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ModuleStatusBadge status={mod.status} label={mod.statusBadgeLabel} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#F1EADE]">{mod.displayName}</h3>
                    <p className="text-xs text-[#8B9CB5] mt-1 leading-normal line-clamp-2">
                      {mod.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#2A2C30] text-[11px] text-[#8B9CB5]">
                    <span className="font-semibold text-[#F1EADE]">Supported: </span>
                    {mod.supportedIntents.slice(0, 2).join(', ')}
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    href={mod.routePath}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#242528] hover:bg-[#2A2C30] text-[#F1EADE] rounded-lg text-xs font-medium transition"
                  >
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Guarantees Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            01. Voice Lifecycle
          </div>
          <h4 className="text-sm font-medium text-[#F1EADE]">Deterministic Transaction Protocol</h4>
          <p className="text-xs text-[#8B9CB5] leading-relaxed">
            Every audio note follows an explicit 8-state pipeline. No hallucinated execution: structured proposals must be confirmed before database commit.
          </p>
        </div>

        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            02. Multi-Tenant Workspace
          </div>
          <h4 className="text-sm font-medium text-[#F1EADE]">Workspace Isolation</h4>
          <p className="text-xs text-[#8B9CB5] leading-relaxed">
            Separate workspaces and database entities for dairy booths, kirana stores, mandi vendors, clinics, and grain procurement lots.
          </p>
        </div>

        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            03. Privacy Boundaries
          </div>
          <h4 className="text-sm font-medium text-[#F1EADE]">Non-Diagnostic Health Gate</h4>
          <p className="text-xs text-[#8B9CB5] leading-relaxed">
            Strict isolation for clinic modules: only appointment scheduling is accepted. Symptoms, diagnostics, and prescriptions are rejected by contract.
          </p>
        </div>
      </div>
    </div>
  );
}

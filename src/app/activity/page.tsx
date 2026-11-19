import React from 'react';
import { getAuditEvents } from '@/lib/audit';
import { Activity, ShieldCheck, ArrowRight, FileCheck, Layers } from 'lucide-react';

export default function ActivityAuditPage() {
  let events: any[] = [];
  try {
    events = getAuditEvents(undefined, 50);
  } catch (err) {
    console.error('Audit query error:', err);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xs bg-[#202622] border border-[#69D9AD] flex items-center justify-center text-[#69D9AD]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#F2EFE6]">
                System Activity & Audit Ledger
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#202622] text-[#69D9AD] border border-[#46534A]">
                PROVENANCE
              </span>
            </div>
            <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
              Relational dispute audit trail : Correlated voice records, state transitions, and operator interventions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A4B0A6] font-mono">
          <ShieldCheck className="w-4 h-4 text-[#69D9AD]" />
          <span>Two-Phase Audit Traceability</span>
        </div>
      </div>

      {/* Audit Provenance Explanation Card */}
      <div className="p-4 bg-[#171B19] border border-[#2C3530] rounded-xs text-xs text-[#C3CBC3] space-y-1">
        <div className="font-semibold text-[#F2EFE6] flex items-center gap-2 font-mono">
          <FileCheck className="w-4 h-4 text-[#69D9AD]" />
          <span>Audit Record Structure</span>
        </div>
        <p className="leading-relaxed">
          Each event represents an explicit state boundary transition in the voice-to-transaction lifecycle (RECEIVED to TRANSCRIBED to PROPOSAL_CREATED to AWAITING_CONFIRMATION to APPLIED or REJECTED). Audio files are stored under path-contained storage and bound to actor IDs for vendor dispute resolution.
        </p>
      </div>

      {/* Activity Table */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C3530]">
          <div>
            <h3 className="text-sm font-semibold text-[#F2EFE6]">Recorded Operations Ledger</h3>
            <p className="text-xs text-[#A4B0A6] mt-0.5 font-mono">Chronological event sequence from SQLite audit_events table</p>
          </div>
          <span className="text-xs text-[#A4B0A6] font-mono tabular-nums">{events.length} Events</span>
        </div>

        {events.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#A4B0A6] border border-dashed border-[#46534A] rounded-xs">
            No audit events logged yet. Submit and confirm voice transactions across the modules to populate the audit ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101211] text-[#A4B0A6] border-b border-[#46534A] font-mono">
                <tr>
                  <th className="p-3">Event Index</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">State Transition</th>
                  <th className="p-3">Grounded Transcript</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3 text-right">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C3530] font-mono">
                {events.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-[#202622]">
                    <td className="p-3 text-[#F2EFE6]">
                      <span className="text-[#A4B0A6] font-mono">[{String(idx + 1).padStart(2, '0')}]</span>{' '}
                      <span className="text-[#C3CBC3]">{e.id.slice(0, 12)}...</span>
                    </td>
                    <td className="p-3 text-[#DAB77A]">
                      {e.vertical_type || 'platform'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-[#202622] text-[#F2EFE6] border border-[#46534A]">
                        {e.action_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-[#A4B0A6]">{e.prior_state || 'NONE'}</span>
                        <ArrowRight className="w-3 h-3 text-[#69D9AD]" />
                        <span className="text-[#A4E4B5] font-semibold">{e.new_state}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#C3CBC3] max-w-xs truncate italic">
                      {e.transcript_raw || e.transcript_span || 'Direct UI interaction'}
                    </td>
                    <td className="p-3 text-[#F2EFE6]">
                      {e.actor_name} <span className="text-[#A4B0A6] text-[10px]">({e.actor_role})</span>
                    </td>
                    <td className="p-3 text-[#A4B0A6] text-[11px] text-right tabular-nums">
                      {e.created_at ? new Date(e.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

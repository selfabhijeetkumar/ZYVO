import { getDb } from '@/lib/db';
import { getAuditEvents } from '@/lib/audit';
import { Activity, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ActivityAuditPage() {
  const events = getAuditEvents(undefined, 40);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F1EADE]">System Activity & Audit Log</h1>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Immutable ledger of all voice transactions, state transitions, and operator interventions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8B9CB5] font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Full Traceability Enabled</span>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F1EADE]">Recent Governance Events</h3>
          <span className="text-xs text-[#8B9CB5] font-mono">{events.length} Recorded Events</span>
        </div>

        {events.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
            No audit events logged yet. Submit and confirm voice transactions across the modules to populate the audit ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">State Transition</th>
                  <th className="p-3">Transcript Span</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-[#242528]/40">
                    <td className="p-3 text-[#F1EADE]">{e.id.slice(0, 12)}...</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#242528] text-[#F1EADE] border border-[#2A2C30]">
                        {e.action_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-[#8B9CB5]">{e.prior_state || 'NONE'}</span>
                        <ArrowRight className="w-3 h-3 text-[#8B9CB5]" />
                        <span className="text-emerald-400 font-semibold">{e.new_state}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#8B9CB5] max-w-xs truncate">
                      {e.transcript_span || 'N/A'}
                    </td>
                    <td className="p-3 text-[#F1EADE]">
                      {e.actor_name} <span className="text-[#8B9CB5] text-[10px]">({e.actor_role})</span>
                    </td>
                    <td className="p-3 text-[#8B9CB5] text-[11px]">
                      {e.created_at.slice(0, 19).replace('T', ' ')}
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

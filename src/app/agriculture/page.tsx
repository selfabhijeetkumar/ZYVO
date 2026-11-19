import { getDb } from '@/lib/db';
import { getVerticalModule } from '@/lib/vertical-registry';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import { Tractor, Sprout, Truck, CheckCircle2 } from 'lucide-react';

export default function AgriculturePage() {
  const db = getDb();
  const moduleDef = getVerticalModule('agriculture');

  const crops = db.prepare('SELECT * FROM agri_crop_catalog WHERE workspace_id = ?').all('ws_agri_01') as any[];
  const requests = db.prepare(`
    SELECT r.*, c.crop_name, u.name as farmer_name
    FROM agri_procurement_requests r
    JOIN agri_crop_catalog c ON r.crop_id = c.id
    JOIN users u ON r.farmer_id = u.id
    WHERE r.workspace_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5
  `).all('ws_agri_01') as any[];
  const pickups = db.prepare(`
    SELECT ps.*, r.crop_id, c.crop_name, r.estimated_volume_quintals
    FROM agri_pickup_schedules ps
    JOIN agri_procurement_requests r ON ps.request_id = r.id
    JOIN agri_crop_catalog c ON r.crop_id = c.id
    ORDER BY ps.scheduled_pickup_date ASC
    LIMIT 5
  `).all() as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#F1EADE]">Agri Produce Procurement</h1>
              <ModuleStatusBadge status="foundation_ready" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Kisan Samriddhi Agri Procurement · Harvest volume lots (quintals), farm-gate pickup scheduling, and MSP pricing
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#151415] border border-[#2A2C30] text-xs text-[#8B9CB5] font-mono">
          Phase 3 Multi-Vertical Foundation
        </div>
      </div>

      {/* Voice Action Card */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[#F1EADE]">Test Farm Procurement Voice Workflow</h2>
        <VoiceActionCard
          verticalType="agriculture"
          workspaceId="ws_agri_01"
          samples={moduleDef?.sampleTranscripts || []}
        />
      </div>

      {/* Crops Catalogue & Scheduled Pickups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crop Catalog */}
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-[#F1EADE]">Active Crop Procurement Board</h3>
            </div>
            <span className="text-xs text-[#8B9CB5] font-mono">{crops.length} Crops</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-2.5">Crop</th>
                  <th className="p-2.5">Variety</th>
                  <th className="p-2.5 text-right">Mandi Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {crops.map((c) => (
                  <tr key={c.id} className="hover:bg-[#242528]/40">
                    <td className="p-2.5 text-[#F1EADE] font-semibold">{c.crop_name}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{c.variety}</td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">
                      ₹{(c.indicative_rate_paise_per_quintal / 100).toLocaleString('en-IN')}/quintal
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pickup Schedules */}
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-[#F1EADE]">Farm-Gate Pickup Routes</h3>
            </div>
            <span className="text-xs text-[#8B9CB5] font-mono">{pickups.length} Trips</span>
          </div>

          {pickups.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
              No pickup trips scheduled yet.
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {pickups.map((p) => (
                <div key={p.id} className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-[#F1EADE] font-semibold">{p.crop_name} ({p.estimated_volume_quintals} quintals)</div>
                    <div className="text-[#8B9CB5] text-[11px]">{p.pickup_location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400">{p.scheduled_pickup_date}</div>
                    <div className="text-[#8B9CB5] text-[10px]">{p.logistics_notes}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Procurement Requests Table */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F1EADE]">Registered Procurement Offers</h3>
          <span className="text-xs text-[#8B9CB5] font-mono">Real-time DB Records</span>
        </div>

        {requests.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
            No procurement offers recorded yet. Submit a voice note above to register a harvest lot.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-2.5">Request ID</th>
                  <th className="p-2.5">Farmer</th>
                  <th className="p-2.5">Crop</th>
                  <th className="p-2.5">Volume</th>
                  <th className="p-2.5">Est. Payout</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#242528]/40">
                    <td className="p-2.5 text-[#F1EADE] font-semibold">{r.id}</td>
                    <td className="p-2.5 text-[#F1EADE]">{r.farmer_name}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{r.crop_name}</td>
                    <td className="p-2.5 text-[#F1EADE]">{r.estimated_volume_quintals} quintals</td>
                    <td className="p-2.5 text-emerald-400 font-bold">
                      ₹{(r.total_estimated_payout_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-[#8B9CB5]">{r.created_at.slice(0, 19).replace('T', ' ')}</td>
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

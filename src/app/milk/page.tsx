import { getDb } from '@/lib/db';
import { getVerticalModule } from '@/lib/vertical-registry';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import { Milk, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MilkDeliveryPage() {
  const db = getDb();
  const moduleDef = getVerticalModule('milk_delivery');

  // Load subscriptions & cutoff
  const cutoff = db.prepare('SELECT * FROM milk_vendor_cutoffs WHERE vendor_id = ?').get('ws_milk_01') as any;
  const subscription = db.prepare('SELECT * FROM milk_customer_subscriptions WHERE workspace_id = ?').get('ws_milk_01') as any;
  const calendarRows = db.prepare(`
    SELECT * FROM milk_delivery_calendar
    WHERE workspace_id = ?
    ORDER BY delivery_date ASC
    LIMIT 7
  `).all('ws_milk_01') as any[];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#F1EADE]">Milk Delivery Operations</h1>
              <ModuleStatusBadge status="active_reference" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Kumar Dairy Milk Booth · Doorstep delivery lifecycle and vacation hold management
            </p>
          </div>
        </div>

        {/* Cutoff pill */}
        <div className="px-3.5 py-2 rounded-xl bg-[#151415] border border-[#2A2C30] flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-[#8B9CB5] tracking-wider">
              Daily Next-Day Cutoff
            </div>
            <div className="text-xs font-mono font-medium text-[#F1EADE]">
              {cutoff?.cutoff_time || '20:00:00'} IST ({cutoff?.timezone || 'Asia/Kolkata'})
            </div>
          </div>
        </div>
      </div>

      {/* Subscription & Active Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
          <div className="text-xs text-[#8B9CB5] font-medium">Customer Subscription</div>
          <div className="text-base font-bold text-[#F1EADE]">
            {subscription?.product_name || 'Standard Cow Milk'}
          </div>
          <div className="text-xs text-[#8B9CB5] font-mono">
            Base Quantity: {subscription?.base_quantity_ml || 1000} ml/day
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            Rate: ₹{((subscription?.unit_rate_paise || 7000) / 100).toFixed(2)}/L
          </div>
        </div>

        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
          <div className="text-xs text-[#8B9CB5] font-medium">Active Customer</div>
          <div className="text-base font-bold text-[#F1EADE]">Ramesh Sharma</div>
          <div className="text-xs text-[#8B9CB5] font-mono">+91 98765 43211</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Morning Route (Slot 06:00 - 07:30 AM)</span>
          </div>
        </div>

        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
          <div className="text-xs text-[#8B9CB5] font-medium">Scheduled Exceptions</div>
          <div className="text-base font-bold text-[#F1EADE]">
            {calendarRows.length} Modified Dates
          </div>
          <div className="text-xs text-[#8B9CB5]">
            Calendar overrides registered via confirmed voice transactions
          </div>
        </div>
      </div>

      {/* Voice Action Pipeline Card */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[#F1EADE]">Test Voice Note Workflow</h2>
        <VoiceActionCard
          verticalType="milk_delivery"
          workspaceId="ws_milk_01"
          samples={moduleDef?.sampleTranscripts || []}
        />
      </div>

      {/* Delivery Calendar Table */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-[#F1EADE]">Upcoming Delivery Calendar</h3>
          </div>
          <span className="text-xs text-[#8B9CB5] font-mono">Real-time DB Records</span>
        </div>

        {calendarRows.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
            No calendar modifications recorded yet. Submit a voice note above to pause or update quantity.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-3">Delivery Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Reason / Origin</th>
                  <th className="p-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {calendarRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#242528]/40">
                    <td className="p-3 text-[#F1EADE] font-semibold">{row.delivery_date}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'PAUSED'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#F1EADE]">{row.quantity_ml} ml</td>
                    <td className="p-3 text-[#8B9CB5] max-w-xs truncate">{row.reason}</td>
                    <td className="p-3 text-[#8B9CB5] text-[11px]">{row.updated_at.slice(0, 19).replace('T', ' ')}</td>
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

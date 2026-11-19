import { getDb } from '@/lib/db';
import { getVerticalModule } from '@/lib/vertical-registry';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import { Store, ShoppingBag, Languages, CheckCircle2 } from 'lucide-react';

export default function KiranaStorePage() {
  const db = getDb();
  const moduleDef = getVerticalModule('kirana');

  const products = db.prepare('SELECT * FROM kirana_product_catalog WHERE workspace_id = ?').all('ws_kirana_01') as any[];
  const aliases = db.prepare(`
    SELECT a.*, p.name as product_name
    FROM kirana_product_aliases a
    JOIN kirana_product_catalog p ON a.catalog_id = p.id
    WHERE p.workspace_id = ?
    ORDER BY p.name ASC
  `).all('ws_kirana_01') as any[];
  const orders = db.prepare(`
    SELECT * FROM kirana_grocery_orders
    WHERE workspace_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all('ws_kirana_01') as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#F1EADE]">Kirana Store Operations</h1>
              <ModuleStatusBadge status="foundation_ready" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Gupta Kirana & General Store · Multilingual grocery catalogue, alias resolution, and line items
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#151415] border border-[#2A2C30] text-xs text-[#8B9CB5] font-mono">
          Phase 3 Multi-Vertical Foundation
        </div>
      </div>

      {/* Voice Action Card */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[#F1EADE]">Test Kirana Voice Workflow</h2>
        <VoiceActionCard
          verticalType="kirana"
          workspaceId="ws_kirana_01"
          samples={moduleDef?.sampleTranscripts || []}
        />
      </div>

      {/* Product Catalog & Multilingual Alias Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Catalog Table */}
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-[#F1EADE]">Stocked Products Catalog</h3>
            </div>
            <span className="text-xs text-[#8B9CB5] font-mono">{products.length} Products</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-2.5">Item Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Unit</th>
                  <th className="p-2.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#242528]/40">
                    <td className="p-2.5 text-[#F1EADE] font-semibold">{p.name}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{p.category}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{p.unit}</td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">
                      ₹{(p.unit_price_paise / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alias Resolution Map */}
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-[#F1EADE]">Voice Alias Dictionary</h3>
            </div>
            <span className="text-xs text-[#8B9CB5] font-mono">{aliases.length} Mappings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-2.5">Voice Term</th>
                  <th className="p-2.5">Language</th>
                  <th className="p-2.5">Resolved Catalog Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {aliases.map((a) => (
                  <tr key={a.id} className="hover:bg-[#242528]/40">
                    <td className="p-2.5 text-amber-300 font-semibold">{a.alias_term}</td>
                    <td className="p-2.5 text-[#8B9CB5] uppercase">{a.language}</td>
                    <td className="p-2.5 text-[#F1EADE]">{a.product_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F1EADE]">Recent Kirana Orders</h3>
          <span className="text-xs text-[#8B9CB5] font-mono">Real-time DB Records</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
            No grocery orders recorded yet. Submit a voice note above to generate a new order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-2.5">Order ID</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Total Amount</th>
                  <th className="p-2.5">Delivery Address</th>
                  <th className="p-2.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#242528]/40">
                    <td className="p-2.5 text-[#F1EADE] font-semibold">{o.id}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                        {o.order_status}
                      </span>
                    </td>
                    <td className="p-2.5 text-emerald-400 font-bold">₹{(o.total_amount_paise / 100).toFixed(2)}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{o.delivery_address}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{o.created_at.slice(0, 19).replace('T', ' ')}</td>
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

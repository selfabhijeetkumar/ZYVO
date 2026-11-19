'use client';

import React, { useState, useEffect } from 'react';
import {
  Carrot,
  Scale,
  Leaf,
  CheckCircle2,
  Package,
  Trash2,
  Plus,
  Users,
  Layers,
  ArrowRight,
  Clock,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';

export default function VegetableVendorPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const [produce, setProduce] = useState<any[]>([]);
  const [aliases, setAliases] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Customer Basket State
  const [basket, setBasket] = useState<
    Array<{
      produceId: string;
      name: string;
      quantity: number;
      unit: string;
      dailyRatePaise: number;
      lineTotalPaise: number;
    }>
  >([
    {
      produceId: 'v_prod_01',
      name: 'Fresh Potato (Aloo)',
      quantity: 1,
      unit: 'kg',
      dailyRatePaise: 3500,
      lineTotalPaise: 3500,
    },
    {
      produceId: 'v_prod_02',
      name: 'Hybrid Tomato (Tamatar)',
      quantity: 500,
      unit: 'grams',
      dailyRatePaise: 4000,
      lineTotalPaise: 2000,
    },
    {
      produceId: 'v_prod_04',
      name: 'Fresh Coriander (Dhaniya)',
      quantity: 1,
      unit: 'bundle',
      dailyRatePaise: 1500,
      lineTotalPaise: 1500,
    },
  ]);

  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Shanti Heights, Near Mandi Gate');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const catRes = await fetch('/api/vegetables/catalog?workspaceId=ws_veg_01');
      if (catRes.ok) {
        const d = await catRes.json();
        setProduce(d.produce || []);
        setAliases(d.aliases || []);
      }

      const ordRes = await fetch('/api/vegetables/orders?workspaceId=ws_veg_01');
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
    } catch (e) {
      console.error('Failed to load vegetable data', e);
    } finally {
      setLoading(false);
    }
  }

  function calculateItemCost(ratePaise: number, quantity: number, unit: string): number {
    const u = unit.toLowerCase();
    if (u === 'g' || u === 'gram' || u === 'grams') {
      return Math.round((ratePaise * quantity) / 1000);
    }
    return Math.round(ratePaise * quantity);
  }

  function addItemToBasket(item: any, quantity: number, unit: string) {
    const existing = basket.find((b) => b.produceId === item.id && b.unit === unit);
    const lineTotal = calculateItemCost(item.daily_rate_paise, quantity, unit);

    if (existing) {
      setBasket(
        basket.map((b) => {
          if (b.produceId === item.id && b.unit === unit) {
            const newQty = b.quantity + quantity;
            return {
              ...b,
              quantity: newQty,
              lineTotalPaise: calculateItemCost(item.daily_rate_paise, newQty, unit),
            };
          }
          return b;
        })
      );
    } else {
      setBasket([
        ...basket,
        {
          produceId: item.id,
          name: item.name,
          quantity,
          unit,
          dailyRatePaise: item.daily_rate_paise,
          lineTotalPaise: lineTotal,
        },
      ]);
    }
  }

  function removeItemFromBasket(index: number) {
    setBasket(basket.filter((_, idx) => idx !== index));
  }

  const basketSubtotalPaise = basket.reduce((acc, item) => acc + item.lineTotalPaise, 0);

  async function handlePlaceOrder() {
    if (basket.length === 0) return;
    setLoading(true);
    try {
      const itemsPayload = basket.map((b) => ({
        produceId: b.produceId,
        itemName: b.name,
        quantity: b.quantity,
        unit: b.unit,
      }));

      const res = await fetch('/api/vegetables/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'ORDER_VEGETABLES',
          workspaceId: 'ws_veg_01',
          items: itemsPayload,
          deliveryAddress,
        }),
      });

      if (res.ok) {
        setActionSuccess('Vegetable produce basket confirmed and sent to Mandi vendor dispatch!');
        setBasket([]);
        await loadData();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        const err = await res.json();
        alert('Order error: ' + (err.error || 'Failed to place vegetable order'));
      }
    } catch (e: any) {
      alert('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/vegetables/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'UPDATE_ORDER_STATUS',
          workspaceId: 'ws_veg_01',
          orderId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Order ${orderId} marked as ${newStatus}`);
        await loadData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e: any) {
      alert('Failed to update status: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculate Vendor Produce Aggregation Manifest
  const manifestMap = new Map<string, { name: string; grams: number; kg: number; bundles: number }>();
  orders.forEach((o) => {
    if (o.status !== 'CANCELLED') {
      (o.items || []).forEach((item: any) => {
        const key = item.produce_id || item.requested_item_name;
        const entry = manifestMap.get(key) || {
          name: item.requested_item_name,
          grams: 0,
          kg: 0,
          bundles: 0,
        };
        const u = (item.unit || '').toLowerCase();
        if (u === 'bundle' || u === 'bundles') {
          entry.bundles += item.quantity;
        } else if (u === 'g' || u === 'gram' || u === 'grams') {
          entry.grams += item.quantity;
        } else {
          entry.kg += item.quantity;
        }
        manifestMap.set(key, entry);
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Carrot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#F1EADE]">Vegetable Vendor Operations</h1>
              <ModuleStatusBadge status="active" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Subhash Fresh Vegetable Market · Dynamic mandi rates, fractional weights (grams/kg), and bundles
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#151415] p-1 rounded-xl border border-[#2A2C30]">
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              activeTab === 'customer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Customer Produce Basket
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              activeTab === 'vendor'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Scale className="w-4 h-4" />
            Vendor Mandi Fulfillment
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Voice Action Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F1EADE] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Natural Speech Voice Ordering (Hinglish/Hindi/English)
          </h2>
          <span className="text-[10px] text-[#8B9CB5] font-mono">Deterministic Intent Router Ready</span>
        </div>
        <VoiceActionCard
          verticalType="vegetable_vendor"
          workspaceId="ws_veg_01"
          samples={[
            {
              language: 'Hinglish',
              text: 'Bhaiya 1 kilo aloo aur aadha kilo tamatar bhej do',
              intent: 'ORDER_VEGETABLES',
            },
            {
              language: 'Hindi',
              text: 'एक गड्डी धनिया और 250 ग्राम हरी मिर्च भिजवा दो',
              intent: 'ORDER_VEGETABLES',
            },
            {
              language: 'English',
              text: 'Deliver 500 grams onion and 2 bundles spinach',
              intent: 'ORDER_VEGETABLES',
            },
          ]}
          onTransactionApplied={loadData}
        />
      </div>

      {/* CUSTOMER TAB */}
      {activeTab === 'customer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produce Rate Board */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F1EADE]">Daily Mandi Fresh Produce Board</h3>
                  <p className="text-xs text-[#8B9CB5]">Select items with fractional weights (grams, kg, bundles)</p>
                </div>
                <button
                  onClick={loadData}
                  className="p-2 text-[#8B9CB5] hover:text-[#F1EADE] transition-colors"
                  title="Refresh rates"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {produce.map((p) => {
                  const ratePerKg = (p.daily_rate_paise / 100).toFixed(2);
                  const isBundle = p.supported_units.includes('bundle');

                  return (
                    <div
                      key={p.id}
                      className="bg-[#151415] border border-[#2A2C30] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-[#8B9CB5] uppercase">{p.category}</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            ₹{ratePerKg} {isBundle ? '/bundle' : '/kg'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F1EADE] group-hover:text-emerald-300 transition-colors">
                          {p.name}
                        </h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#2A2C30] flex flex-wrap items-center gap-2">
                        {isBundle ? (
                          <>
                            <button
                              onClick={() => addItemToBasket(p, 1, 'bundle')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A2C30] hover:bg-emerald-600 hover:text-white text-[11px] font-semibold text-[#F1EADE] transition-all min-h-[36px]"
                            >
                              +1 Bundle
                            </button>
                            <button
                              onClick={() => addItemToBasket(p, 2, 'bundles')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A2C30] hover:bg-emerald-600 hover:text-white text-[11px] font-semibold text-[#F1EADE] transition-all min-h-[36px]"
                            >
                              +2 Bundles
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => addItemToBasket(p, 250, 'grams')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A2C30] hover:bg-emerald-600 hover:text-white text-[11px] font-semibold text-[#F1EADE] transition-all min-h-[36px]"
                            >
                              +250g
                            </button>
                            <button
                              onClick={() => addItemToBasket(p, 500, 'grams')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A2C30] hover:bg-emerald-600 hover:text-white text-[11px] font-semibold text-[#F1EADE] transition-all min-h-[36px]"
                            >
                              +500g
                            </button>
                            <button
                              onClick={() => addItemToBasket(p, 1, 'kg')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A2C30] hover:bg-emerald-600 hover:text-white text-[11px] font-semibold text-[#F1EADE] transition-all min-h-[36px]"
                            >
                              +1 kg
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Local Produce Aliases Card */}
              <div className="mt-4 pt-4 border-t border-[#2A2C30]">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-[#F1EADE]">Colloquial Produce Vocabulary</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aliases.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-md bg-[#151415] border border-[#2A2C30] text-[11px] text-[#8B9CB5]"
                    >
                      <strong className="text-emerald-300">{a.alias_term}</strong> → {a.produce_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Basket Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-[#F1EADE]">Produce Basket</h3>
                </div>
                <span className="text-xs text-[#8B9CB5] font-mono">{basket.length} items</span>
              </div>

              {basket.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
                  Basket is empty. Pick items from the Mandi board on the left or use voice.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-[#2A2C30] max-h-80 overflow-y-auto pr-1">
                    {basket.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#F1EADE]">{item.name}</p>
                          <p className="text-[11px] text-[#8B9CB5] font-mono">
                            {item.quantity} {item.unit} @ ₹{(item.dailyRatePaise / 100).toFixed(2)}/kg
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-400 font-mono">
                            ₹{(item.lineTotalPaise / 100).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItemFromBasket(idx)}
                            className="text-[#8B9CB5] hover:text-rose-400 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#2A2C30] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8B9CB5]">Subtotal (Integer Paise)</span>
                      <span className="text-sm font-bold text-[#F1EADE] font-mono">
                        ₹{(basketSubtotalPaise / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#8B9CB5]">Delivery Address</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-[#151415] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-[#F1EADE] focus:outline-none focus:border-emerald-500"
                        placeholder="House / Flat / Street details"
                      />
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading || basket.length === 0}
                      className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-lg shadow-emerald-950/40"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Place Mandi Order (₹{(basketSubtotalPaise / 100).toFixed(2)})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VENDOR TAB */}
      {activeTab === 'vendor' && (
        <div className="space-y-6">
          {/* Vendor Produce Aggregation Manifest */}
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F1EADE]">
                    Daily Mandi Procurement & Weighing Manifest
                  </h3>
                  <p className="text-xs text-[#8B9CB5]">
                    Aggregated weights and bundles required across all active orders
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#8B9CB5]">{manifestMap.size} Produce Types</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from(manifestMap.values()).map((m, idx) => {
                const totalGrams = m.grams + m.kg * 1000;
                const displayWeight =
                  totalGrams > 0 ? `${(totalGrams / 1000).toFixed(2)} kg` : null;
                const displayBundles = m.bundles > 0 ? `${m.bundles} bundles` : null;

                return (
                  <div
                    key={idx}
                    className="bg-[#151415] border border-[#2A2C30] rounded-xl p-3.5 space-y-1"
                  >
                    <span className="text-xs font-semibold text-[#F1EADE] truncate block">{m.name}</span>
                    <div className="flex items-center gap-2">
                      {displayWeight && (
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {displayWeight}
                        </span>
                      )}
                      {displayBundles && (
                        <span className="text-xs font-bold text-emerald-300 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                          {displayBundles}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orders Fulfillment Board */}
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-[#F1EADE]">Mandi Orders Queue</h3>
              </div>
              <span className="text-xs text-[#8B9CB5] font-mono">{orders.length} Active Orders</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
                No orders waiting in queue.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-[#151415] border border-[#2A2C30] rounded-xl p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2C30] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#F1EADE]">{o.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                : o.status === 'WEIGHED_PACKED'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                : 'bg-blue-950/60 text-blue-300 border-blue-800'
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#8B9CB5] mt-1">
                          Customer: <span className="text-[#F1EADE] font-semibold">{o.customer_name}</span> ({o.customer_phone}) · {o.delivery_address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          ₹{(o.estimated_total_paise / 100).toFixed(2)}
                        </span>
                        {o.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'WEIGHED_PACKED')}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all min-h-[36px]"
                          >
                            Weigh & Pack
                          </button>
                        )}
                        {o.status === 'WEIGHED_PACKED' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all min-h-[36px]"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {(o.items || []).map((item: any, iIdx: number) => (
                        <div
                          key={iIdx}
                          className="bg-[#1B1C1E] border border-[#2A2C30] rounded-lg p-2 flex items-center justify-between"
                        >
                          <span className="text-[#F1EADE] font-medium">{item.requested_item_name}</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

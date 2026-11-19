'use client';

import React, { useState, useEffect } from 'react';
import {
  Carrot,
  Scale,
  CheckCircle2,
  Package,
  Trash2,
  Plus,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import IndustryAccentScene from '@/components/spatial/IndustryAccentScene';

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
        setActionSuccess('Vegetable produce basket confirmed and committed to Mandi vendor dispatch.');
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
        setActionSuccess(`Order ${orderId} advanced to ${newStatus}`);
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
      {/* Header with Spatial Accent */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <IndustryAccentScene moduleType="vegetable" accentColor="#69D9AD" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#F2EFE6]">
                Vegetable Vendor Operations
              </h1>
              <ModuleStatusBadge status="active" />
            </div>
            <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
              Subhash Fresh Vegetable Market : Mandi spot rates, fractional weights (grams/kg), and bundles
            </p>
          </div>
        </div>

        {/* Tab Switcher with min 44px targets */}
        <div className="flex items-center bg-[#101211] p-1 rounded-xs border border-[#46534A]">
          <button
            onClick={() => setActiveTab('customer')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all ${
              activeTab === 'customer'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#69D9AD]" />
            <span>Customer Produce Basket</span>
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all ${
              activeTab === 'vendor'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#DAB77A]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Scale className="w-4 h-4 text-[#DAB77A]" />
            <span>Vendor Mandi Fulfillment</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#202622] border border-[#A4E4B5] rounded-xs text-xs text-[#A4E4B5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#A4E4B5] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Voice Action Card */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-[#F2EFE6] uppercase font-mono tracking-wider">
          Voice Produce Dispatch
        </h2>
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
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#2C3530]">
                <div>
                  <h3 className="text-sm font-semibold text-[#F2EFE6]">Daily Mandi Fresh Produce Board</h3>
                  <p className="text-xs text-[#A4B0A6]">Fractional units supported: grams, kg, bundles</p>
                </div>
                <button
                  onClick={loadData}
                  className="min-h-[44px] px-3 py-1.5 text-xs text-[#A4B0A6] hover:text-[#F2EFE6] flex items-center gap-1.5 border border-[#46534A] rounded-xs bg-[#202622]"
                  title="Refresh rates"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {produce.map((p) => {
                  const ratePerKg = (p.daily_rate_paise / 100).toFixed(2);
                  const isBundle = p.supported_units.includes('bundle');

                  return (
                    <div
                      key={p.id}
                      className="bg-[#101211] border border-[#2C3530] rounded-xs p-4 flex flex-col justify-between hover:border-[#69D9AD] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#A4B0A6] uppercase">{p.category}</span>
                          <span className="text-xs font-mono font-bold text-[#69D9AD] tabular-nums">
                            ₹{ratePerKg} / {p.unit}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-[#F2EFE6]">{p.name}</div>
                        <div className="text-[11px] text-[#A4B0A6] font-mono">
                          Aliases: {p.aliases?.join(', ')}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-2 border-t border-[#2C3530]">
                        {isBundle ? (
                          <button
                            onClick={() => addItemToBasket(p, 1, 'bundle')}
                            className="min-h-[36px] px-2.5 py-1 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs font-mono"
                          >
                            +1 Bundle
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => addItemToBasket(p, 250, 'grams')}
                              className="min-h-[36px] px-2 py-1 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs font-mono"
                            >
                              +250g
                            </button>
                            <button
                              onClick={() => addItemToBasket(p, 500, 'grams')}
                              className="min-h-[36px] px-2 py-1 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs font-mono"
                            >
                              +500g
                            </button>
                            <button
                              onClick={() => addItemToBasket(p, 1, 'kg')}
                              className="min-h-[36px] px-2 py-1 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs font-mono"
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
            </div>
          </div>

          {/* Customer Produce Basket */}
          <div className="space-y-4">
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#2C3530]">
                <h3 className="text-sm font-semibold text-[#F2EFE6]">Produce Basket</h3>
                <span className="text-xs text-[#A4B0A6] font-mono tabular-nums">{basket.length} Items</span>
              </div>

              {basket.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#A4B0A6] border border-dashed border-[#46534A] rounded-xs">
                  Basket is empty. Select weights from the Mandi board.
                </div>
              ) : (
                <div className="space-y-2">
                  {basket.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#F2EFE6]">{item.name}</div>
                        <div className="text-[11px] text-[#A4B0A6] font-mono tabular-nums">
                          {item.quantity} {item.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#69D9AD] tabular-nums">
                          ₹{(item.lineTotalPaise / 100).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItemFromBasket(idx)}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[#A4B0A6] hover:text-[#F1A79C]"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-[#2C3530] space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#A4B0A6]">Total Basket:</span>
                      <span className="text-base font-bold text-[#69D9AD] tabular-nums">
                        ₹{(basketSubtotalPaise / 100).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading || basket.length === 0}
                      className="min-h-[44px] w-full py-2.5 bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] rounded-xs text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Produce Order</span>
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
          {/* Mandi Prep Aggregation Manifest */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C3530]">
              <div>
                <h3 className="text-sm font-semibold text-[#F2EFE6]">
                  Vendor Mandi Preparation Manifest
                </h3>
                <p className="text-xs text-[#A4B0A6] mt-0.5 font-mono">
                  Aggregated weights required for morning market prep and parcel dispatch
                </p>
              </div>
              <button
                onClick={loadData}
                className="min-h-[44px] px-3.5 py-1.5 bg-[#202622] text-[#A4B0A6] hover:text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from(manifestMap.entries()).map(([key, data]) => {
                const totalKg = data.kg + data.grams / 1000;
                return (
                  <div key={key} className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs space-y-1">
                    <div className="text-xs font-semibold text-[#F2EFE6]">{data.name}</div>
                    <div className="text-sm font-mono font-bold text-[#69D9AD] tabular-nums">
                      {data.bundles > 0
                        ? `${data.bundles} Bundles`
                        : `${totalKg.toFixed(2)} kg total`}
                    </div>
                    {data.grams > 0 && data.kg > 0 && (
                      <div className="text-[10px] text-[#A4B0A6] font-mono tabular-nums">
                        ({data.kg} kg + {data.grams}g)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orders Queue Table */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#F2EFE6]">Customer Orders Queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101211] text-[#A4B0A6] border-b border-[#46534A] font-mono">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Items Breakdown</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C3530] font-mono">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#202622]">
                      <td className="p-3 text-[#F2EFE6] font-semibold">{ord.id}</td>
                      <td className="p-3 text-[#A4B0A6]">
                        {ord.items?.map((it: any) => `${it.requested_item_name} (${it.quantity} ${it.unit})`).join(', ')}
                      </td>
                      <td className="p-3 text-right text-[#69D9AD] font-bold tabular-nums">
                        ₹{(ord.total_amount_paise / 100).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                            ord.status === 'FULFILLED'
                              ? 'bg-[#202622] text-[#A4E4B5] border border-[#A4E4B5]'
                              : ord.status === 'PACKED'
                              ? 'bg-[#202622] text-[#86D5D4] border border-[#86D5D4]'
                              : 'bg-[#202622] text-[#DAB77A] border border-[#DAB77A]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {ord.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'PACKED')}
                            className="min-h-[36px] px-3 py-1 bg-[#202622] hover:bg-[#2A322D] text-[#86D5D4] border border-[#86D5D4] rounded-xs text-xs font-sans"
                          >
                            Mark Packed
                          </button>
                        )}
                        {ord.status === 'PACKED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'FULFILLED')}
                            className="min-h-[36px] px-3 py-1 bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] rounded-xs text-xs font-semibold font-sans"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

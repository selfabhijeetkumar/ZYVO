'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  ShoppingBag,
  Languages,
  CheckCircle2,
  Package,
  Trash2,
  Plus,
  Users,
  Layers,
  ArrowRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';

export default function KiranaStorePage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [aliases, setAliases] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Customer Basket State
  const [basket, setBasket] = useState<Array<{ catalogId: string; name: string; quantity: number; unit: string; pricePaise: number }>>([
    { catalogId: 'k_prod_01', name: 'Maggi 2-Minute Noodles', quantity: 2, unit: 'packet', pricePaise: 1400 },
    { catalogId: 'k_prod_02', name: 'Basmati Rice (Tukda)', quantity: 1, unit: 'kg', pricePaise: 6000 },
    { catalogId: 'k_prod_03', name: 'Refined Sugar', quantity: 0.5, unit: 'kg', pricePaise: 4400 },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const catRes = await fetch('/api/kirana/catalog?workspaceId=ws_kirana_01');
      if (catRes.ok) {
        const d = await catRes.json();
        setCatalog(d.products || []);
        setAliases(d.aliases || []);
      }

      const ordRes = await fetch('/api/kirana/orders?workspaceId=ws_kirana_01');
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
    } catch (e) {
      console.error('Failed to load kirana data', e);
    } finally {
      setLoading(false);
    }
  }

  function addItemToBasket(prod: any) {
    const existing = basket.find((b) => b.catalogId === prod.id);
    if (existing) {
      setBasket(
        basket.map((b) =>
          b.catalogId === prod.id ? { ...b, quantity: b.quantity + 1 } : b
        )
      );
    } else {
      setBasket([
        ...basket,
        {
          catalogId: prod.id,
          name: prod.name,
          quantity: 1,
          unit: prod.unit,
          pricePaise: prod.unit_price_paise,
        },
      ]);
    }
  }

  function removeItemFromBasket(catalogId: string) {
    setBasket(basket.filter((b) => b.catalogId !== catalogId));
  }

  function updateQuantity(catalogId: string, delta: number) {
    setBasket(
      basket
        .map((b) => {
          if (b.catalogId === catalogId) {
            const newQty = Math.max(0.5, b.quantity + delta);
            return { ...b, quantity: newQty };
          }
          return b;
        })
        .filter((b) => b.quantity > 0)
    );
  }

  const totalBasketPaise = basket.reduce(
    (sum, item) => sum + Math.round(item.pricePaise * item.quantity),
    0
  );

  async function handleConfirmBasketOrder() {
    if (basket.length === 0) return;
    setLoading(true);
    setActionSuccess(null);
    try {
      const itemsPayload = basket.map((b) => ({
        catalogId: b.catalogId,
        requestedItemName: b.name,
        quantity: b.quantity,
        unit: b.unit,
      }));

      const res = await fetch('/api/kirana/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'ws_kirana_01',
          customerId: 'user_customer_01',
          items: itemsPayload,
          deliveryAddress: 'Doorstep Ground Floor Drop',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Order confirmed! ${data.result.summary}`);
        setBasket([]);
        await loadData();
      }
    } catch (err: any) {
      console.error('Order creation failed', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/kirana/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ORDER_STATUS',
          workspaceId: 'ws_kirana_01',
          orderId,
          newStatus,
          reason: `Status advanced to ${newStatus} by vendor`,
        }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error('Failed to update order status', e);
    } finally {
      setLoading(false);
    }
  }

  const SAMPLES = [
    {
      language: 'Hinglish',
      text: 'Do packet Maggi, ek kilo chawal aur aadha kilo chini bhej dena',
      intent: 'CREATE_GROCERY_ORDER',
    },
    {
      language: 'Hindi',
      text: 'फॉर्च्यून सनफ्लावर तेल एक लीटर और दो किलो बासमती चावल भिजवा दो',
      intent: 'CREATE_GROCERY_ORDER',
    },
  ];

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
              <ModuleStatusBadge status="active_reference" label="Phase 5 Complete Workflow" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Gupta Kirana & General Store · Multilingual grocery ordering, catalogue alias resolution, and order fulfillment
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-[#151415] border border-[#2A2C30] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2 ${
              activeTab === 'customer'
                ? 'bg-[#242528] text-[#F1EADE] shadow-sm border border-[#2A2C30]'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer Basket</span>
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2 ${
              activeTab === 'vendor'
                ? 'bg-[#242528] text-[#F1EADE] shadow-sm border border-[#2A2C30]'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vendor Orders</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* CUSTOMER BASKET & ORDER CREATION */}
      {activeTab === 'customer' && (
        <div className="space-y-6">
          {/* Active Basket Builder Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basket Items List */}
            <div className="lg:col-span-2 bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-[#F1EADE]">Current Grocery Basket</h3>
                </div>
                <span className="text-xs text-[#8B9CB5] font-mono">{basket.length} Items</span>
              </div>

              {basket.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
                  Your grocery basket is empty. Add products from the catalogue below or submit a voice note.
                </div>
              ) : (
                <div className="space-y-2">
                  {basket.map((item) => (
                    <div
                      key={item.catalogId}
                      className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#F1EADE]">{item.name}</div>
                        <div className="text-[11px] text-[#8B9CB5] font-mono">
                          ₹{(item.pricePaise / 100).toFixed(2)} / {item.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-[#242528] px-2 py-1 rounded border border-[#2A2C30]">
                          <button
                            onClick={() => updateQuantity(item.catalogId, -0.5)}
                            className="text-[#8B9CB5] hover:text-[#F1EADE] font-bold px-1"
                          >
                            -
                          </button>
                          <span className="font-mono text-[#F1EADE] font-semibold">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.catalogId, 0.5)}
                            className="text-[#8B9CB5] hover:text-[#F1EADE] font-bold px-1"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right min-w-[70px]">
                          <div className="font-bold text-emerald-400 font-mono">
                            ₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItemFromBasket(item.catalogId)}
                          className="text-[#8B9CB5] hover:text-red-400 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subtotal & Confirmation Card */}
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B9CB5]">
                  Order Subtotal
                </h3>
                <div className="text-3xl font-bold text-amber-400 font-mono">
                  ₹{(totalBasketPaise / 100).toFixed(2)}
                </div>
                <div className="text-xs text-[#8B9CB5] space-y-1 font-mono pt-2 border-t border-[#2A2C30]">
                  <div>Items: {basket.length}</div>
                  <div>Delivery: Doorstep Free Drop</div>
                  <div>Payment: Pay on Delivery</div>
                </div>
              </div>

              <button
                onClick={handleConfirmBasketOrder}
                disabled={loading || basket.length === 0}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Grocery Order</span>
              </button>
            </div>
          </div>

          {/* Voice Action Card */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#F1EADE]">Test Voice Grocery Order</h2>
            <VoiceActionCard
              verticalType="kirana"
              workspaceId="ws_kirana_01"
              samples={SAMPLES}
              onTransactionApplied={loadData}
            />
          </div>

          {/* Product Catalog Grid to Add Items */}
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#F1EADE]">Stocked Catalogue (Click + to Add)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {catalog.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#F1EADE]">{prod.name}</div>
                    <div className="text-[11px] text-[#8B9CB5]">{prod.category}</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-1">
                      ₹{(prod.unit_price_paise / 100).toFixed(2)} / {prod.unit}
                    </div>
                  </div>

                  <button
                    onClick={() => addItemToBasket(prod)}
                    className="p-2 bg-[#242528] hover:bg-[#2A2C30] text-[#F1EADE] rounded-lg border border-[#2A2C30]"
                    title="Add to basket"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VENDOR ORDERS VIEW */}
      {activeTab === 'vendor' && (
        <div className="space-y-6">
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F1EADE]">Incoming Customer Grocery Orders</h3>
                <p className="text-xs text-[#8B9CB5] mt-0.5">
                  Real-time store run-list with item bagging and fulfillment workflow
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-[#242528] text-[#8B9CB5] hover:text-[#F1EADE] rounded-lg text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
                No orders placed yet. Place an order via voice or customer basket above.
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-[#151415] border border-[#2A2C30] rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2C30] pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-[#F1EADE]">{ord.id}</span>
                        <span className="text-xs text-[#8B9CB5] ml-2">
                          · {ord.customer_name} ({ord.customer_phone})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                            ord.order_status === 'FULFILLED'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                              : ord.order_status === 'PACKED'
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {ord.order_status}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          ₹{(ord.total_amount_paise / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div className="text-xs text-[#8B9CB5] space-y-1">
                      {ord.items?.map((it: any) => (
                        <div key={it.id} className="flex justify-between">
                          <span>
                            • {it.item_name || it.requested_item_name} ({it.quantity} {it.unit})
                          </span>
                          <span className="text-[#F1EADE]">₹{(it.subtotal_paise / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2C30]/50 text-xs font-sans">
                      {ord.order_status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'PACKED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-medium transition"
                        >
                          Mark as Packed
                        </button>
                      )}
                      {ord.order_status === 'PACKED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'FULFILLED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-medium transition"
                        >
                          Mark Fulfilled & Delivered
                        </button>
                      )}
                      {ord.order_status !== 'CANCELLED' && ord.order_status !== 'FULFILLED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                          className="px-3 py-1.5 bg-[#242528] text-red-300 hover:text-red-200 rounded-lg text-[11px] font-medium transition"
                        >
                          Cancel Order
                        </button>
                      )}
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

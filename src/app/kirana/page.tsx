'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  ShoppingBag,
  CheckCircle2,
  Package,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import IndustryAccentScene from '@/components/spatial/IndustryAccentScene';

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
      {/* Header with Spatial Accent */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <IndustryAccentScene moduleType="kirana" accentColor="#DAB77A" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#F2EFE6]">
                Kirana Store Operations
              </h1>
              <ModuleStatusBadge status="active_reference" label="Phase 5 Workflow" />
            </div>
            <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
              Gupta Kirana Store : Colloquial alias matching, integer paise billing, and fulfillment queue
            </p>
          </div>
        </div>

        {/* Tab Controls with min 44px targets */}
        <div className="flex items-center bg-[#101211] border border-[#46534A] rounded-xs p-1">
          <button
            onClick={() => setActiveTab('customer')}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-xs transition flex items-center gap-2 ${
              activeTab === 'customer'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#DAB77A]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#DAB77A]" />
            <span>Customer Basket</span>
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-xs transition flex items-center gap-2 ${
              activeTab === 'vendor'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#69D9AD]" />
            <span>Vendor Orders</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#202622] border border-[#A4E4B5] rounded-xs text-xs text-[#A4E4B5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#A4E4B5] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* CUSTOMER BASKET & ORDER CREATION */}
      {activeTab === 'customer' && (
        <div className="space-y-6">
          {/* Active Basket Builder Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basket Items List */}
            <div className="lg:col-span-2 bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#2C3530]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#DAB77A]" />
                  <h3 className="text-sm font-semibold text-[#F2EFE6]">Active Grocery Basket</h3>
                </div>
                <span className="text-xs text-[#A4B0A6] font-mono tabular-nums">{basket.length} Items</span>
              </div>

              {basket.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A4B0A6] border border-dashed border-[#46534A] rounded-xs">
                  Your grocery basket is empty. Add products from the catalogue below or submit a voice note.
                </div>
              ) : (
                <div className="space-y-2">
                  {basket.map((item) => (
                    <div
                      key={item.catalogId}
                      className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#F2EFE6]">{item.name}</div>
                        <div className="text-[11px] text-[#A4B0A6] font-mono tabular-nums">
                          ₹{(item.pricePaise / 100).toFixed(2)} / {item.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Quantity Controls with accessible 44px touch targets */}
                        <div className="flex items-center gap-2 bg-[#202622] px-2 py-1 rounded-xs border border-[#46534A]">
                          <button
                            onClick={() => updateQuantity(item.catalogId, -0.5)}
                            className="min-w-[28px] min-h-[28px] text-[#A4B0A6] hover:text-[#F2EFE6] font-bold px-1"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            -
                          </button>
                          <span className="font-mono text-[#F2EFE6] font-semibold tabular-nums">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.catalogId, 0.5)}
                            className="min-w-[28px] min-h-[28px] text-[#A4B0A6] hover:text-[#F2EFE6] font-bold px-1"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right min-w-[70px]">
                          <div className="font-bold text-[#69D9AD] font-mono tabular-nums">
                            ₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItemFromBasket(item.catalogId)}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[#A4B0A6] hover:text-[#F1A79C] p-1"
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
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
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A4B0A6] font-mono">
                  Order Ledger Subtotal
                </h3>
                <div className="text-3xl font-bold text-[#DAB77A] font-mono tabular-nums">
                  ₹{(totalBasketPaise / 100).toFixed(2)}
                </div>
                <div className="text-xs text-[#A4B0A6] space-y-1 font-mono pt-2 border-t border-[#2C3530]">
                  <div>Items Selected: {basket.length}</div>
                  <div>Delivery: Free Ground Drop</div>
                  <div>Settlement: Pay on Delivery</div>
                </div>
              </div>

              <button
                onClick={handleConfirmBasketOrder}
                disabled={loading || basket.length === 0}
                className="min-h-[44px] w-full py-2.5 bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] rounded-xs text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Grocery Order</span>
              </button>
            </div>
          </div>

          {/* Voice Action Card */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-[#F2EFE6] uppercase font-mono tracking-wider">
              Voice Grocery Dispatch
            </h2>
            <VoiceActionCard
              verticalType="kirana"
              workspaceId="ws_kirana_01"
              samples={SAMPLES}
              onTransactionApplied={loadData}
            />
          </div>

          {/* Product Catalog Grid */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#F2EFE6]">
              Store Inventory (Click + to Add to Basket)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {catalog.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#F2EFE6]">{prod.name}</div>
                    <div className="text-[11px] text-[#A4B0A6]">{prod.category}</div>
                    <div className="text-xs font-bold text-[#69D9AD] font-mono tabular-nums mt-1">
                      ₹{(prod.unit_price_paise / 100).toFixed(2)} / {prod.unit}
                    </div>
                  </div>

                  <button
                    onClick={() => addItemToBasket(prod)}
                    className="min-w-[44px] min-h-[44px] p-2 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] rounded-xs border border-[#46534A] flex items-center justify-center"
                    title={`Add ${prod.name} to basket`}
                    aria-label={`Add ${prod.name} to basket`}
                  >
                    <Plus className="w-4 h-4 text-[#69D9AD]" />
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
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C3530]">
              <div>
                <h3 className="text-sm font-semibold text-[#F2EFE6]">Store Order Fulfillment Queue</h3>
                <p className="text-xs text-[#A4B0A6] mt-0.5 font-mono">
                  Live packing and dispatch queue : Status transitions CONFIRMED to PACKED to FULFILLED
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

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A4B0A6] border border-dashed border-[#46534A] rounded-xs">
                No orders placed yet. Place an order via voice or customer basket above.
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-[#101211] border border-[#2C3530] rounded-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C3530] pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-[#F2EFE6]">{ord.id}</span>
                        <span className="text-xs text-[#A4B0A6] ml-2">
                          : {ord.customer_name} ({ord.customer_phone})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                            ord.order_status === 'FULFILLED'
                              ? 'bg-[#202622] text-[#A4E4B5] border border-[#A4E4B5]'
                              : ord.order_status === 'PACKED'
                              ? 'bg-[#202622] text-[#86D5D4] border border-[#86D5D4]'
                              : 'bg-[#202622] text-[#DAB77A] border border-[#DAB77A]'
                          }`}
                        >
                          {ord.order_status}
                        </span>
                        <span className="text-xs font-bold text-[#69D9AD] tabular-nums">
                          ₹{(ord.total_amount_paise / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div className="text-xs text-[#A4B0A6] space-y-1">
                      {ord.items?.map((it: any) => (
                        <div key={it.id} className="flex justify-between">
                          <span>
                            • {it.item_name || it.requested_item_name} ({it.quantity} {it.unit})
                          </span>
                          <span className="text-[#F2EFE6] tabular-nums">
                            ₹{(it.subtotal_paise / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2C3530] text-xs font-sans">
                      {ord.order_status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'PACKED')}
                          className="min-h-[44px] px-3.5 py-1.5 bg-[#202622] hover:bg-[#2A322D] text-[#86D5D4] border border-[#86D5D4] rounded-xs text-xs font-medium transition"
                        >
                          Mark as Packed
                        </button>
                      )}
                      {ord.order_status === 'PACKED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'FULFILLED')}
                          className="min-h-[44px] px-3.5 py-1.5 bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] rounded-xs text-xs font-semibold transition"
                        >
                          Mark Fulfilled & Delivered
                        </button>
                      )}
                      {ord.order_status !== 'CANCELLED' && ord.order_status !== 'FULFILLED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                          className="min-h-[44px] px-3 py-1.5 bg-[#202622] text-[#F1A79C] hover:text-[#F2EFE6] border border-[#F1A79C] rounded-xs text-xs font-medium transition"
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

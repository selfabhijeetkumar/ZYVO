'use client';

import React, { useState, useEffect } from 'react';
import {
  Milk,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Truck,
  Users,
  Coins,
  Pause,
  Play,
  Plus,
  Edit2,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import IndustryAccentScene from '@/components/spatial/IndustryAccentScene';

export default function MilkDeliveryPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor'>('customer');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [bill, setBill] = useState<any>(null);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [manifest, setManifest] = useState<any>(null);
  const [manifestDate, setManifestDate] = useState<string>('2026-11-20');

  // Quick Action form states
  const [showQuickAction, setShowQuickAction] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState({
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    extraMl: 500,
    newBaseQty: 1500,
    reason: '',
  });
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [manifestDate]);

  async function loadData() {
    setLoading(true);
    try {
      const subRes = await fetch('/api/milk/subscription?workspaceId=ws_milk_01');
      if (subRes.ok) {
        const d = await subRes.json();
        setSubscription(d.subscription);
      }

      const billRes = await fetch('/api/milk/bill-preview?workspaceId=ws_milk_01&yearMonth=2026-11');
      if (billRes.ok) {
        const d = await billRes.json();
        setBill(d.bill);
      }

      const calRes = await fetch('/api/milk/calendar?workspaceId=ws_milk_01&startDate=2026-11-15&endDate=2026-11-30');
      if (calRes.ok) {
        const d = await calRes.json();
        setCalendar(d.calendar || []);
      }

      const manRes = await fetch(`/api/milk/manifest?workspaceId=ws_milk_01&date=${manifestDate}`);
      if (manRes.ok) {
        const d = await manRes.json();
        setManifest(d.manifest);
      }
    } catch (e) {
      console.error('Error loading milk data', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickAction(actionType: string) {
    setLoading(true);
    setActionSuccess(null);
    try {
      const payload: any = {
        action: actionType,
        workspaceId: 'ws_milk_01',
        customerId: 'user_customer_01',
      };

      if (actionType === 'PAUSE_DELIVERY') {
        payload.startDate = actionForm.startDate;
        payload.endDate = actionForm.endDate;
        payload.reason = actionForm.reason || 'Customer paused delivery via quick action';
      } else if (actionType === 'RESUME_DELIVERY') {
        payload.startDate = actionForm.startDate;
      } else if (actionType === 'ADD_EXTRA_DELIVERY') {
        payload.targetDate = actionForm.startDate;
        payload.extraMl = Number(actionForm.extraMl);
      } else if (actionType === 'CHANGE_QUANTITY') {
        payload.quantityMl = Number(actionForm.newBaseQty);
        payload.isPermanent = true;
      }

      const res = await fetch('/api/voice-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalType: 'milk_delivery',
          workspaceId: 'ws_milk_01',
          manualTranscript:
            actionType === 'PAUSE_DELIVERY'
              ? `Bhaiya ${actionForm.startDate} se ${actionForm.endDate} tak doodh mat dena`
              : actionType === 'ADD_EXTRA_DELIVERY'
              ? `Bhaiya ${actionForm.startDate} ko ${actionForm.extraMl}ml extra doodh dena`
              : actionType === 'RESUME_DELIVERY'
              ? `Bhaiya ${actionForm.startDate} se doodh shuru kar dena`
              : `Roz ka ${actionForm.newBaseQty}ml kar do`,
        }),
      });

      const data = await res.json();
      if (data.submission?.id) {
        const confirmRes = await fetch(`/api/proposals/${data.submission.id}/confirm`, {
          method: 'POST',
        });
        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          setActionSuccess(confirmData.result?.summary || 'Transaction applied successfully');
          setShowQuickAction(null);
          await loadData();
        }
      }
    } catch (err: any) {
      console.error('Quick action failed', err);
    } finally {
      setLoading(false);
    }
  }

  const SAMPLES = [
    {
      language: 'Hinglish',
      text: 'Bhaiya kal subah doodh mat dena, hum 3 din ke liye gaon ja rahe hain',
      intent: 'PAUSE_DELIVERY',
    },
    {
      language: 'Hinglish',
      text: 'Sunday ko aadha litre extra dena, mehman aa rahe hain',
      intent: 'ADD_EXTRA_DELIVERY',
    },
    {
      language: 'Hinglish',
      text: 'Kal se delivery phir start kar dena',
      intent: 'RESUME_DELIVERY',
    },
    {
      language: 'Hindi',
      text: 'रोज का एक लीटर से आधा लीटर कर दो',
      intent: 'CHANGE_QUANTITY',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header with Spatial Accent */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <IndustryAccentScene moduleType="milk" accentColor="#86D5D4" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#F2EFE6]">
                Milk Delivery Operations
              </h1>
              <ModuleStatusBadge status="active_reference" />
            </div>
            <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
              Kumar Dairy Booth : Recurring doorstep delivery, 20:00 cutoff engine, and billing ledger
            </p>
          </div>
        </div>

        {/* View Switcher Tabs with min 44px targets */}
        <div className="flex items-center bg-[#101211] border border-[#46534A] rounded-xs p-1">
          <button
            onClick={() => setActiveTab('customer')}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-xs transition flex items-center gap-2 ${
              activeTab === 'customer'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#86D5D4]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#86D5D4]" />
            <span>Customer View</span>
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-xs transition flex items-center gap-2 ${
              activeTab === 'vendor'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#DAB77A]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#DAB77A]" />
            <span>Vendor Route Manifest</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#202622] border border-[#A4E4B5] rounded-xs text-xs text-[#A4E4B5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#A4E4B5] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* CUSTOMER VIEW */}
      {activeTab === 'customer' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-2">
              <div className="text-xs text-[#A4B0A6] font-medium uppercase font-mono">
                Daily Base Subscription
              </div>
              <div className="text-xl font-bold text-[#F2EFE6]">
                {subscription?.product_name || 'Standard Cow Milk'}
              </div>
              <div className="text-xs text-[#A4B0A6] font-mono tabular-nums">
                Base Quantity: <span className="text-[#F2EFE6] font-semibold">{subscription?.base_quantity_ml || 1000} ml/day</span>
              </div>
              <div className="text-xs text-[#86D5D4] font-mono tabular-nums">
                Contract Rate: ₹{((subscription?.unit_rate_paise || 7000) / 100).toFixed(2)}/L
              </div>
            </div>

            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-2">
              <div className="text-xs text-[#A4B0A6] font-medium flex items-center justify-between uppercase font-mono">
                <span>Month Bill Preview (Nov 2026)</span>
                <Coins className="w-3.5 h-3.5 text-[#DAB77A]" />
              </div>
              <div className="text-2xl font-bold text-[#DAB77A] font-mono tabular-nums">
                ₹{bill ? (bill.totalBillPaise / 100).toFixed(2) : '1,995.00'}
              </div>
              <div className="text-[11px] text-[#A4B0A6] space-y-0.5 font-mono tabular-nums">
                <div>Base 30 Days: ₹{bill ? (bill.baseContractAmountPaise / 100).toFixed(2) : '2,100.00'}</div>
                <div className="text-[#A4E4B5]">
                  - Pause Deduction: ₹{bill ? (bill.pausedCreditDeductionPaise / 100).toFixed(2) : '140.00'} ({bill?.pausedDays || 2} days)
                </div>
                <div className="text-[#DAB77A]">
                  + Extra Deliveries: ₹{bill ? (bill.extraDeliveriesAmountPaise / 100).toFixed(2) : '35.00'} ({bill?.extraDeliveryDays || 1} day)
                </div>
              </div>
            </div>

            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-2">
              <div className="text-xs text-[#A4B0A6] font-medium flex items-center justify-between uppercase font-mono">
                <span>Operational Cutoff Policy</span>
                <Clock className="w-3.5 h-3.5 text-[#69D9AD]" />
              </div>
              <div className="text-xl font-bold text-[#F2EFE6] font-mono tabular-nums">20:00:00 IST</div>
              <p className="text-xs text-[#C3CBC3] leading-relaxed">
                Requests before 8:00 PM take effect tomorrow morning. Requests submitted after 8:00 PM are locked to Day D+2 per dairy depot indenting rules.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A4B0A6] font-mono">
              Quick Action Schedule Modifications
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowQuickAction('PAUSE')}
                className="min-h-[44px] px-3.5 py-2 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] rounded-xs text-xs font-medium transition flex items-center gap-2 border border-[#46534A]"
              >
                <Pause className="w-3.5 h-3.5 text-[#DAB77A]" />
                <span>Pause Delivery</span>
              </button>
              <button
                onClick={() => setShowQuickAction('RESUME')}
                className="min-h-[44px] px-3.5 py-2 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] rounded-xs text-xs font-medium transition flex items-center gap-2 border border-[#46534A]"
              >
                <Play className="w-3.5 h-3.5 text-[#69D9AD]" />
                <span>Resume Delivery</span>
              </button>
              <button
                onClick={() => setShowQuickAction('EXTRA')}
                className="min-h-[44px] px-3.5 py-2 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] rounded-xs text-xs font-medium transition flex items-center gap-2 border border-[#46534A]"
              >
                <Plus className="w-3.5 h-3.5 text-[#86D5D4]" />
                <span>Add Extra Milk</span>
              </button>
              <button
                onClick={() => setShowQuickAction('CHANGE_BASE')}
                className="min-h-[44px] px-3.5 py-2 bg-[#202622] hover:bg-[#2A322D] text-[#F2EFE6] rounded-xs text-xs font-medium transition flex items-center gap-2 border border-[#46534A]"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#A4B0A6]" />
                <span>Change Base Quantity</span>
              </button>
            </div>

            {/* Quick Action Form Modal/Inliner */}
            {showQuickAction && (
              <div className="pt-4 border-t border-[#2C3530] space-y-3 bg-[#101211] p-4 rounded-xs border border-[#46534A]">
                <div className="text-xs font-semibold text-[#F2EFE6]">
                  {showQuickAction === 'PAUSE' && 'Pause Delivery (Date Range)'}
                  {showQuickAction === 'RESUME' && 'Resume Subscription'}
                  {showQuickAction === 'EXTRA' && 'Add Extra Milk for Target Date'}
                  {showQuickAction === 'CHANGE_BASE' && 'Modify Permanent Daily Subscription Quantity'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#A4B0A6]">Start / Target Date:</label>
                    <input
                      type="date"
                      value={actionForm.startDate}
                      onChange={(e) => setActionForm({ ...actionForm, startDate: e.target.value })}
                      className="w-full mt-1 bg-[#171B19] border border-[#46534A] rounded-xs p-2 text-xs text-[#F2EFE6]"
                    />
                  </div>

                  {showQuickAction === 'PAUSE' && (
                    <div>
                      <label className="text-[11px] text-[#A4B0A6]">End Date (Inclusive):</label>
                      <input
                        type="date"
                        value={actionForm.endDate}
                        onChange={(e) => setActionForm({ ...actionForm, endDate: e.target.value })}
                        className="w-full mt-1 bg-[#171B19] border border-[#46534A] rounded-xs p-2 text-xs text-[#F2EFE6]"
                      />
                    </div>
                  )}

                  {showQuickAction === 'EXTRA' && (
                    <div>
                      <label className="text-[11px] text-[#A4B0A6]">Extra Quantity (ml):</label>
                      <input
                        type="number"
                        value={actionForm.extraMl}
                        step={250}
                        onChange={(e) => setActionForm({ ...actionForm, extraMl: Number(e.target.value) })}
                        className="w-full mt-1 bg-[#171B19] border border-[#46534A] rounded-xs p-2 text-xs text-[#F2EFE6]"
                      />
                    </div>
                  )}

                  {showQuickAction === 'CHANGE_BASE' && (
                    <div>
                      <label className="text-[11px] text-[#A4B0A6]">New Daily Base Quantity (ml):</label>
                      <input
                        type="number"
                        value={actionForm.newBaseQty}
                        step={250}
                        onChange={(e) => setActionForm({ ...actionForm, newBaseQty: Number(e.target.value) })}
                        className="w-full mt-1 bg-[#171B19] border border-[#46534A] rounded-xs p-2 text-xs text-[#F2EFE6]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (showQuickAction === 'PAUSE') handleQuickAction('PAUSE_DELIVERY');
                      else if (showQuickAction === 'RESUME') handleQuickAction('RESUME_DELIVERY');
                      else if (showQuickAction === 'EXTRA') handleQuickAction('ADD_EXTRA_DELIVERY');
                      else if (showQuickAction === 'CHANGE_BASE') handleQuickAction('CHANGE_QUANTITY');
                    }}
                    disabled={loading}
                    className="min-h-[44px] px-4 py-2 bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] rounded-xs text-xs font-semibold transition"
                  >
                    Confirm Action
                  </button>
                  <button
                    onClick={() => setShowQuickAction(null)}
                    className="min-h-[44px] px-3 py-2 bg-[#202622] text-[#A4B0A6] hover:text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Voice Action Pipeline Card */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-[#F2EFE6] uppercase font-mono tracking-wider">
              Voice Dispatch Pipeline
            </h2>
            <VoiceActionCard
              verticalType="milk_delivery"
              workspaceId="ws_milk_01"
              samples={SAMPLES}
              onTransactionApplied={loadData}
            />
          </div>

          {/* Upcoming Delivery Calendar */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2C3530]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#86D5D4]" />
                <h3 className="text-sm font-semibold text-[#F2EFE6]">
                  Active Delivery Calendar (November 2026)
                </h3>
              </div>
              <span className="text-xs text-[#A4B0A6] font-mono">Real-time SQLite Ledger</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
              {bill?.dailyEntries?.slice(14, 28).map((d: any) => (
                <div
                  key={d.date}
                  className={`p-3 rounded-xs border text-xs font-mono flex flex-col justify-between ${
                    d.status === 'PAUSED'
                      ? 'bg-[#202622] border-[#DAB77A] text-[#DAB77A]'
                      : d.status === 'MODIFIED'
                      ? 'bg-[#202622] border-[#86D5D4] text-[#86D5D4]'
                      : 'bg-[#101211] border-[#2C3530] text-[#F2EFE6]'
                  }`}
                >
                  <div className="text-[11px] text-[#A4B0A6]">{d.date.slice(5)}</div>
                  <div className="text-sm font-bold my-1 tabular-nums">{d.deliveredQuantityMl} ml</div>
                  <div className="text-[10px] capitalize font-medium">{d.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VENDOR MANIFEST VIEW */}
      {activeTab === 'vendor' && (
        <div className="space-y-6">
          {/* Manifest Controls & Summary */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#2C3530]">
              <div>
                <h2 className="text-base font-bold text-[#F2EFE6]">Daily Route Delivery Manifest</h2>
                <p className="text-xs text-[#A4B0A6] mt-0.5 font-mono">
                  Morning depot drop run-sheet : Enforced 20:00 IST cutoff
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-[#A4B0A6] font-medium">Route Date:</label>
                <input
                  type="date"
                  value={manifestDate}
                  onChange={(e) => setManifestDate(e.target.value)}
                  className="bg-[#101211] border border-[#46534A] rounded-xs px-3 py-1.5 text-xs text-[#F2EFE6]"
                />
              </div>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs">
                <div className="text-[11px] text-[#A4B0A6] font-mono">Total Volume</div>
                <div className="text-xl font-bold text-[#69D9AD] font-mono tabular-nums mt-1">
                  {manifest?.totalVolumeLitres || 0} L
                </div>
              </div>

              <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs">
                <div className="text-[11px] text-[#A4B0A6] font-mono">Active Drops</div>
                <div className="text-xl font-bold text-[#F2EFE6] font-mono tabular-nums mt-1">
                  {manifest?.activeDeliveries || 0}
                </div>
              </div>

              <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs">
                <div className="text-[11px] text-[#A4B0A6] font-mono">Paused Customers</div>
                <div className="text-xl font-bold text-[#DAB77A] font-mono tabular-nums mt-1">
                  {manifest?.pausedDeliveries || 0}
                </div>
              </div>

              <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs">
                <div className="text-[11px] text-[#A4B0A6] font-mono">Extra Deliveries</div>
                <div className="text-xl font-bold text-[#86D5D4] font-mono tabular-nums mt-1">
                  {manifest?.extraDeliveries || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Delivery Run-List Table */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2C3530]">
              <h3 className="text-sm font-semibold text-[#F2EFE6]">
                Customer Delivery Run-List ({manifestDate})
              </h3>
              <span className="text-xs text-[#A4B0A6] font-mono tabular-nums">
                {manifest?.items?.length || 0} Deliveries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101211] text-[#A4B0A6] border-b border-[#46534A] font-mono">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Dispatch Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Special Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C3530] font-mono">
                  {manifest?.items?.map((item: any) => (
                    <tr key={item.customerId} className="hover:bg-[#202622]">
                      <td className="p-3 text-[#F2EFE6] font-semibold">{item.customerName}</td>
                      <td className="p-3 text-[#A4B0A6]">{item.customerPhone}</td>
                      <td className="p-3 text-[#C3CBC3]">{item.productName}</td>
                      <td className="p-3 text-right text-[#69D9AD] font-bold tabular-nums">
                        {item.scheduledQuantityMl} ml
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                            item.status === 'PAUSED'
                              ? 'bg-[#202622] text-[#DAB77A] border border-[#DAB77A]'
                              : item.status === 'MODIFIED'
                              ? 'bg-[#202622] text-[#86D5D4] border border-[#86D5D4]'
                              : 'bg-[#202622] text-[#A4E4B5] border border-[#A4E4B5]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#A4B0A6] text-[11px] truncate max-w-xs">
                        {item.notes || 'Standard Morning Drop'}
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  Milk,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  Coins,
  Pause,
  Play,
  Plus,
  Edit2,
  RefreshCw,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';

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
      // 1. Subscription
      const subRes = await fetch('/api/milk/subscription?workspaceId=ws_milk_01');
      if (subRes.ok) {
        const d = await subRes.json();
        setSubscription(d.subscription);
      }

      // 2. Bill preview
      const billRes = await fetch('/api/milk/bill-preview?workspaceId=ws_milk_01&yearMonth=2026-11');
      if (billRes.ok) {
        const d = await billRes.json();
        setBill(d.bill);
      }

      // 3. Calendar
      const calRes = await fetch('/api/milk/calendar?workspaceId=ws_milk_01&startDate=2026-11-15&endDate=2026-11-30');
      if (calRes.ok) {
        const d = await calRes.json();
        setCalendar(d.calendar || []);
      }

      // 4. Manifest
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
      let payload: any = {
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

      // Submit via proposal or direct API confirmation
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
        // Auto confirm for deterministic quick action controls
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
              Kumar Dairy Milk Booth · Doorstep delivery lifecycle, billing engine, and route manifests
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#151415] border border-[#2A2C30] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2 ${
              activeTab === 'customer'
                ? 'bg-[#242528] text-[#F1EADE] shadow-sm border border-[#2A2C30]'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Customer View</span>
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2 ${
              activeTab === 'vendor'
                ? 'bg-[#242528] text-[#F1EADE] shadow-sm border border-[#2A2C30]'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Vendor Manifest View</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* CUSTOMER VIEW */}
      {activeTab === 'customer' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
              <div className="text-xs text-[#8B9CB5] font-medium">Daily Subscription</div>
              <div className="text-lg font-bold text-[#F1EADE]">
                {subscription?.product_name || 'Cow Milk'}
              </div>
              <div className="text-xs text-[#8B9CB5] font-mono">
                Base Quantity: <span className="text-[#F1EADE] font-semibold">{subscription?.base_quantity_ml || 1000} ml/day</span>
              </div>
              <div className="text-xs text-emerald-400 font-mono">
                Rate: ₹{((subscription?.unit_rate_paise || 7000) / 100).toFixed(2)}/L
              </div>
            </div>

            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
              <div className="text-xs text-[#8B9CB5] font-medium flex items-center justify-between">
                <span>Month Bill Preview (Nov 2026)</span>
                <Coins className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                ₹{bill ? (bill.totalBillPaise / 100).toFixed(2) : '1,995.00'}
              </div>
              <div className="text-[11px] text-[#8B9CB5] space-y-0.5 font-mono">
                <div>Base 30 Days: ₹{bill ? (bill.baseContractAmountPaise / 100).toFixed(2) : '2,100.00'}</div>
                <div className="text-emerald-400">
                  - Pause Savings: ₹{bill ? (bill.pausedCreditDeductionPaise / 100).toFixed(2) : '140.00'} ({bill?.pausedDays || 2} days)
                </div>
                <div className="text-amber-400">
                  + Extra Milk: ₹{bill ? (bill.extraDeliveriesAmountPaise / 100).toFixed(2) : '35.00'} ({bill?.extraDeliveryDays || 1} day)
                </div>
              </div>
            </div>

            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-2">
              <div className="text-xs text-[#8B9CB5] font-medium flex items-center justify-between">
                <span>Daily Next-Day Cutoff</span>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-[#F1EADE] font-mono">20:00:00 IST</div>
              <p className="text-xs text-[#8B9CB5] leading-relaxed">
                Changes submitted before 8:00 PM take effect tomorrow morning. Requests after 8:00 PM take effect on Day+2.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B9CB5]">
              Quick Action Controls
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowQuickAction('PAUSE')}
                className="px-3.5 py-2 bg-[#242528] hover:bg-[#2A2C30] text-[#F1EADE] rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-[#2A2C30]"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Delivery</span>
              </button>
              <button
                onClick={() => setShowQuickAction('RESUME')}
                className="px-3.5 py-2 bg-[#242528] hover:bg-[#2A2C30] text-[#F1EADE] rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-[#2A2C30]"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume Delivery</span>
              </button>
              <button
                onClick={() => setShowQuickAction('EXTRA')}
                className="px-3.5 py-2 bg-[#242528] hover:bg-[#2A2C30] text-[#F1EADE] rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-[#2A2C30]"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Extra Milk</span>
              </button>
              <button
                onClick={() => setShowQuickAction('CHANGE_BASE')}
                className="px-3.5 py-2 bg-[#242528] hover:bg-[#2A2C30] text-[#F1EADE] rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-[#2A2C30]"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Change Daily Base Quantity</span>
              </button>
            </div>

            {/* Quick Action Form Modal/Inliner */}
            {showQuickAction && (
              <div className="pt-4 border-t border-[#2A2C30] space-y-3 bg-[#151415] p-4 rounded-lg">
                <div className="text-xs font-semibold text-[#F1EADE]">
                  {showQuickAction === 'PAUSE' && 'Pause Delivery (Date Range)'}
                  {showQuickAction === 'RESUME' && 'Resume Subscription'}
                  {showQuickAction === 'EXTRA' && 'Add Extra Milk for Target Date'}
                  {showQuickAction === 'CHANGE_BASE' && 'Modify Permanent Daily Subscription Quantity'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#8B9CB5]">Start / Target Date:</label>
                    <input
                      type="date"
                      value={actionForm.startDate}
                      onChange={(e) => setActionForm({ ...actionForm, startDate: e.target.value })}
                      className="w-full mt-1 bg-[#1B1C1E] border border-[#2A2C30] rounded-lg p-2 text-xs text-[#F1EADE]"
                    />
                  </div>

                  {showQuickAction === 'PAUSE' && (
                    <div>
                      <label className="text-[11px] text-[#8B9CB5]">End Date (Inclusive):</label>
                      <input
                        type="date"
                        value={actionForm.endDate}
                        onChange={(e) => setActionForm({ ...actionForm, endDate: e.target.value })}
                        className="w-full mt-1 bg-[#1B1C1E] border border-[#2A2C30] rounded-lg p-2 text-xs text-[#F1EADE]"
                      />
                    </div>
                  )}

                  {showQuickAction === 'EXTRA' && (
                    <div>
                      <label className="text-[11px] text-[#8B9CB5]">Extra Quantity (ml):</label>
                      <input
                        type="number"
                        value={actionForm.extraMl}
                        step={250}
                        onChange={(e) => setActionForm({ ...actionForm, extraMl: Number(e.target.value) })}
                        className="w-full mt-1 bg-[#1B1C1E] border border-[#2A2C30] rounded-lg p-2 text-xs text-[#F1EADE]"
                      />
                    </div>
                  )}

                  {showQuickAction === 'CHANGE_BASE' && (
                    <div>
                      <label className="text-[11px] text-[#8B9CB5]">New Daily Base Quantity (ml):</label>
                      <input
                        type="number"
                        value={actionForm.newBaseQty}
                        step={250}
                        onChange={(e) => setActionForm({ ...actionForm, newBaseQty: Number(e.target.value) })}
                        className="w-full mt-1 bg-[#1B1C1E] border border-[#2A2C30] rounded-lg p-2 text-xs text-[#F1EADE]"
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                  >
                    Confirm Action
                  </button>
                  <button
                    onClick={() => setShowQuickAction(null)}
                    className="px-3 py-2 bg-[#242528] text-[#8B9CB5] hover:text-[#F1EADE] rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Voice Action Pipeline Card */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#F1EADE]">Voice Pipeline Simulator</h2>
            <VoiceActionCard
              verticalType="milk_delivery"
              workspaceId="ws_milk_01"
              samples={SAMPLES}
              onTransactionApplied={loadData}
            />
          </div>

          {/* Upcoming Delivery Calendar */}
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-[#F1EADE]">Upcoming Delivery Calendar (November 2026)</h3>
              </div>
              <span className="text-xs text-[#8B9CB5] font-mono">Real-time DB Schedule</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
              {bill?.dailyEntries?.slice(14, 28).map((d: any) => (
                <div
                  key={d.date}
                  className={`p-3 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                    d.status === 'PAUSED'
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                      : d.status === 'MODIFIED'
                      ? 'bg-blue-950/20 border-blue-800/40 text-blue-300'
                      : 'bg-[#151415] border-[#2A2C30] text-[#F1EADE]'
                  }`}
                >
                  <div className="text-[11px] text-[#8B9CB5]">{d.date.slice(5)}</div>
                  <div className="text-sm font-bold my-1">{d.deliveredQuantityMl} ml</div>
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
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#F1EADE]">Daily Delivery Manifest</h2>
                <p className="text-xs text-[#8B9CB5] mt-0.5">
                  Route dispatch manifest for morning delivery drop · Cutoff: 20:00 IST
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-[#8B9CB5] font-medium">Select Route Date:</label>
                <input
                  type="date"
                  value={manifestDate}
                  onChange={(e) => setManifestDate(e.target.value)}
                  className="bg-[#151415] border border-[#2A2C30] rounded-lg px-3 py-1.5 text-xs text-[#F1EADE]"
                />
              </div>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg">
                <div className="text-[11px] text-[#8B9CB5]">Total Dispatch Volume</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                  {manifest?.totalVolumeLitres || 0} L
                </div>
              </div>

              <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg">
                <div className="text-[11px] text-[#8B9CB5]">Active Deliveries</div>
                <div className="text-xl font-bold text-[#F1EADE] font-mono mt-1">
                  {manifest?.activeDeliveries || 0} Customers
                </div>
              </div>

              <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg">
                <div className="text-[11px] text-[#8B9CB5]">Paused Customers</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                  {manifest?.pausedDeliveries || 0}
                </div>
              </div>

              <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg">
                <div className="text-[11px] text-[#8B9CB5]">Extra Deliveries</div>
                <div className="text-xl font-bold text-blue-400 font-mono mt-1">
                  {manifest?.extraDeliveries || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Delivery Run-List Table */}
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F1EADE]">Customer Delivery Run-List ({manifestDate})</h3>
              <span className="text-xs text-[#8B9CB5] font-mono">{manifest?.items?.length || 0} Deliveries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-right">Dispatch Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Special Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2C30] font-mono">
                  {manifest?.items?.map((item: any) => (
                    <tr key={item.customerId} className="hover:bg-[#242528]/40">
                      <td className="p-3 text-[#F1EADE] font-semibold">{item.customerName}</td>
                      <td className="p-3 text-[#8B9CB5]">{item.customerPhone}</td>
                      <td className="p-3 text-[#F1EADE]">{item.productName}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">
                        {item.scheduledQuantityMl} ml
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'PAUSED'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                              : item.status === 'MODIFIED'
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#8B9CB5] text-[11px] truncate max-w-xs">
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

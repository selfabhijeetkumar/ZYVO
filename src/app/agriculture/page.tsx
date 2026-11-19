'use client';

import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Sprout,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  RefreshCw,
  Sparkles,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';

export default function AgriculturePage() {
  const [activeTab, setActiveTab] = useState<'farmer' | 'buyer'>('farmer');
  const [crops, setCrops] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Farmer Form State
  const [selectedCropId, setSelectedCropId] = useState<string>('crop_01');
  const [volumeInput, setVolumeInput] = useState<number>(10);
  const [unit, setUnit] = useState<'quintals' | 'kg' | 'crates'>('quintals');
  const [pickupLocation, setPickupLocation] = useState<string>('Village Mandi Gate 4, Rampur Road');
  const [preferredDate, setPreferredDate] = useState<string>('2026-11-23');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const cropRes = await fetch('/api/agriculture/crops?workspaceId=ws_agri_01');
      if (cropRes.ok) {
        const d = await cropRes.json();
        setCrops(d.crops || []);
        if (d.crops && d.crops.length > 0 && !selectedCropId) {
          setSelectedCropId(d.crops[0].id);
        }
      }

      const reqRes = await fetch('/api/agriculture/requests?workspaceId=ws_agri_01');
      if (reqRes.ok) {
        const d = await reqRes.json();
        setRequests(d.requests || []);
      }
    } catch (e) {
      console.error('Failed to load agriculture data', e);
    } finally {
      setLoading(false);
    }
  }

  // Calculate volume in quintals for payout preview
  let volumeQuintals = volumeInput || 0;
  if (unit === 'kg') volumeQuintals = volumeInput / 100;
  if (unit === 'crates') volumeQuintals = (volumeInput * 25) / 100;

  const selectedCrop = crops.find((c) => c.id === selectedCropId);
  const ratePaise = selectedCrop ? selectedCrop.indicative_rate_paise_per_quintal : 150000;
  const estimatedPayoutPaise = Math.round(ratePaise * volumeQuintals);

  async function handleRegisterProcurement() {
    if (volumeQuintals <= 0) {
      setErrorMessage('Please enter a valid volume greater than zero.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/agriculture/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_PROCUREMENT',
          workspaceId: 'ws_agri_01',
          farmerId: 'user_customer_01',
          cropId: selectedCropId,
          cropName: selectedCrop?.crop_name,
          variety: selectedCrop?.variety,
          estimatedVolumeQuintals: volumeQuintals,
          unit: 'quintals',
          pickupLocation,
          preferredDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.result?.summary || 'Procurement request registered successfully!');
        await loadData();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to register procurement offer');
      }
    } catch (e: any) {
      setErrorMessage('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(requestId: string, newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/agriculture/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROCUREMENT_STATUS',
          workspaceId: 'ws_agri_01',
          requestId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Procurement lot ${requestId} status updated to ${newStatus}`);
        await loadData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e: any) {
      alert('Failed to update status: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Summary Metrics for Buyer Tab
  const totalVolumeQuintals = requests
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((acc, r) => acc + (r.estimated_volume_quintals || 0), 0);

  const totalCommittedPayoutPaise = requests
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((acc, r) => acc + (r.total_estimated_payout_paise || 0), 0);

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
              <ModuleStatusBadge status="active" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Kisan Samriddhi Agri Procurement · Harvest volume lots (quintals), farm-gate pickup scheduling, and MSP pricing
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#151415] p-1 rounded-xl border border-[#2A2C30]">
          <button
            onClick={() => setActiveTab('farmer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              activeTab === 'farmer'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Sprout className="w-4 h-4" />
            Farmer Harvest Registration
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              activeTab === 'buyer'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Truck className="w-4 h-4" />
            Buyer Procurement Logistics
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Voice Action Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F1EADE] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Natural Speech Harvest Registration (Hinglish/Hindi/English)
          </h2>
          <span className="text-[10px] text-[#8B9CB5] font-mono">Deterministic Intent Router Ready</span>
        </div>
        <VoiceActionCard
          verticalType="agriculture"
          workspaceId="ws_agri_01"
          samples={[
            {
              language: 'Hinglish',
              text: 'Hamare paas 20 quintal Sharbati gehu taiyar hai, pickup schedule kar do',
              intent: 'REGISTER_PROCUREMENT',
            },
            {
              language: 'Hindi',
              text: '500 किलो टमाटर की फसल तैयार है मंडी उठान के लिए',
              intent: 'REGISTER_PROCUREMENT',
            },
            {
              language: 'English',
              text: 'Register 15 quintals mustard seed harvest for farm pickup',
              intent: 'REGISTER_PROCUREMENT',
            },
          ]}
          onTransactionApplied={loadData}
        />
      </div>

      {/* FARMER TAB */}
      {activeTab === 'farmer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Crop Procurement Board */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F1EADE]">Crop Procurement Rate Board</h3>
                  <p className="text-xs text-[#8B9CB5]">
                    Official MSP benchmarks (PIB PRID 2269182) for mandated crops and indicative spot rates for non-MSP produce
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="p-2 text-[#8B9CB5] hover:text-[#F1EADE] transition-colors"
                  title="Refresh rates"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {crops.map((c) => {
                  const isSelected = c.id === selectedCropId;
                  const ratePerQuintal = (c.indicative_rate_paise_per_quintal / 100).toLocaleString('en-IN');
                  const isMsp = c.is_msp_mandated === 1;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCropId(c.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[#151415] border-[#2A2C30] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border font-mono ${
                              isMsp
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {isMsp ? 'Official MSP' : 'Indicative Spot'}
                          </span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            ₹{ratePerQuintal} / q
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F1EADE]">{c.crop_name}</h4>
                        <p className="text-[11px] text-[#8B9CB5]">Variety: {c.variety}</p>

                        {isMsp ? (
                          <div className="text-[10px] text-emerald-400/90 space-y-0.5 pt-1 border-t border-[#2A2C30]">
                            <div>Season: {c.marketing_season || 'RMS 2025-26'}</div>
                            <div className="truncate">
                              Source: {c.source_name || 'CCEA, Govt. of India (PIB)'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#8B9CB5] pt-1 border-t border-[#2A2C30]">
                            Non-MSP crop · Mandi negotiated spot value
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#2A2C30] flex items-center justify-between text-xs">
                        <span className={isSelected ? 'text-amber-400 font-semibold' : 'text-[#8B9CB5]'}>
                          {isSelected ? 'Selected Crop' : 'Click to select'}
                        </span>
                        {c.source_url && (
                          <a
                            href={c.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-blue-400 hover:underline"
                          >
                            PIB Ref ↗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Farm Gate Pickup Routes Info */}
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-[#F1EADE]">Direct Farm-Gate Logistics Policy</h3>
              </div>
              <p className="text-xs text-[#8B9CB5] leading-relaxed">
                ZYVO procurement partners provide weighing and direct farm-gate collection for harvest lots over 5 quintals. Rates are benchmarked against official mandi minimum support criteria, with zero broker deduction.
              </p>
            </div>
          </div>

          {/* Harvest Registration Form */}
          <div className="space-y-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-[#F1EADE]">Register Harvest Lot</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-[#8B9CB5] block mb-1">Selected Crop</label>
                  <div className="p-2.5 bg-[#151415] border border-[#2A2C30] rounded-lg text-[#F1EADE] font-semibold flex justify-between">
                    <span>{selectedCrop?.crop_name || 'Crop'}</span>
                    <span className="text-emerald-400 font-mono">
                      ₹{((selectedCrop?.indicative_rate_paise_per_quintal || 150000) / 100).toLocaleString('en-IN')}/q
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#8B9CB5] block mb-1">Harvest Volume</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={volumeInput}
                      onChange={(e) => setVolumeInput(parseFloat(e.target.value) || 0)}
                      className="w-2/3 bg-[#151415] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-[#F1EADE] font-mono focus:outline-none focus:border-amber-500"
                    />
                    <select
                      value={unit}
                      onChange={(e: any) => setUnit(e.target.value)}
                      className="w-1/3 bg-[#151415] border border-[#2A2C30] rounded-lg px-2 py-2 text-xs text-[#F1EADE] focus:outline-none focus:border-amber-500"
                    >
                      <option value="quintals">Quintals</option>
                      <option value="kg">Kilograms</option>
                      <option value="crates">Crates (25kg)</option>
                    </select>
                  </div>
                  {unit !== 'quintals' && (
                    <p className="text-[10px] text-amber-300/80 mt-1 font-mono">
                      = {volumeQuintals.toFixed(2)} quintals
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-[#8B9CB5] block mb-1">Farm Pickup Location</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-[#151415] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-[#F1EADE] focus:outline-none focus:border-amber-500"
                    placeholder="Field number / Landmark / Gate"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#8B9CB5] block mb-1">Preferred Pickup Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-[#151415] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-[#F1EADE] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg space-y-1">
                  <div className="flex justify-between text-[#8B9CB5]">
                    <span>
                      {selectedCrop?.is_msp_mandated === 1 ? 'Official MSP Rate' : 'Indicative Mandi Rate'}
                    </span>
                    <span className="font-mono">
                      ₹{((selectedCrop?.indicative_rate_paise_per_quintal || 150000) / 100).toLocaleString('en-IN')}/q
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-[#2A2C30]">
                    <span className="text-[#F1EADE] font-semibold">Total Indicative Payout</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ₹{(estimatedPayoutPaise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8B9CB5] pt-1">
                    Indicative payout estimate based on quality inspection; not a government purchase guarantee.
                  </p>
                </div>

                <button
                  onClick={handleRegisterProcurement}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-lg shadow-amber-950/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Register Lot (₹{(estimatedPayoutPaise / 100).toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUYER TAB */}
      {activeTab === 'buyer' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-4 space-y-1">
              <span className="text-xs text-[#8B9CB5]">Active Procurement Lots</span>
              <div className="text-xl font-bold text-[#F1EADE] font-mono">
                {requests.filter((r) => r.status !== 'CANCELLED').length}
              </div>
            </div>

            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-4 space-y-1">
              <span className="text-xs text-[#8B9CB5]">Total Harvest Volume</span>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {totalVolumeQuintals.toFixed(1)} quintals
              </div>
            </div>

            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-4 space-y-1">
              <span className="text-xs text-[#8B9CB5]">Committed Payout Value</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                ₹{(totalCommittedPayoutPaise / 100).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Active Procurement Requests Table */}
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-[#F1EADE]">Procurement Offers & Logistics Queue</h3>
              </div>
              <button
                onClick={loadData}
                className="p-2 text-[#8B9CB5] hover:text-[#F1EADE] transition-colors"
                title="Refresh requests"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
                No procurement offers registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                    <tr>
                      <th className="p-3">Request ID</th>
                      <th className="p-3">Farmer</th>
                      <th className="p-3">Crop & Volume</th>
                      <th className="p-3">Pickup Location & Date</th>
                      <th className="p-3">Payout</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2C30] font-mono">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-[#242528]/40">
                        <td className="p-3 text-[#F1EADE] font-bold">{r.id}</td>
                        <td className="p-3 text-[#F1EADE]">
                          {r.farmer_name}
                          <span className="block text-[10px] text-[#8B9CB5] font-normal">{r.farmer_phone}</span>
                        </td>
                        <td className="p-3 text-[#F1EADE]">
                          {r.crop_name} ({r.variety})
                          <span className="block text-[11px] text-amber-400 font-bold">
                            {r.estimated_volume_quintals} quintals
                          </span>
                        </td>
                        <td className="p-3 text-[#8B9CB5]">
                          {r.pickup_date || 'Standard'}
                          <span className="block text-[10px] text-[#8B9CB5] truncate max-w-xs">
                            {r.schedule?.pickup_location || 'Farm Gate'}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400 font-bold">
                          ₹{(r.total_estimated_payout_paise / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              r.status === 'COLLECTED'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                : r.status === 'PICKUP_SCHEDULED'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                : r.status === 'VERIFIED'
                                ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                                : r.status === 'CANCELLED'
                                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                : 'bg-gray-800 text-gray-300 border-gray-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {r.status === 'REGISTERED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'VERIFIED')}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-medium transition-all"
                            >
                              Verify Lot
                            </button>
                          )}
                          {r.status === 'VERIFIED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'PICKUP_SCHEDULED')}
                              className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-medium transition-all"
                            >
                              Schedule Pickup
                            </button>
                          )}
                          {r.status === 'PICKUP_SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'COLLECTED')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-medium transition-all"
                            >
                              Mark Collected
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

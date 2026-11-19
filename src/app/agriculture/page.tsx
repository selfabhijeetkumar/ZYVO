'use client';

import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Sprout,
  Truck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import IndustryAccentScene from '@/components/spatial/IndustryAccentScene';

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
        setActionSuccess(data.result?.summary || 'Procurement request registered successfully.');
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

  const totalVolumeQuintals = requests
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((acc, r) => acc + (r.estimated_volume_quintals || 0), 0);

  const totalCommittedPayoutPaise = requests
    .filter((r) => r.status !== 'CANCELLED')
    .reduce((acc, r) => acc + (r.total_estimated_payout_paise || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Spatial Accent */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <IndustryAccentScene moduleType="agriculture" accentColor="#DAB77A" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#F2EFE6]">
                Agri Produce Procurement
              </h1>
              <ModuleStatusBadge status="active" />
            </div>
            <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
              Kisan Samriddhi Platform : Harvest lots (quintals), farm-gate pickup logistics, and official CCEA MSP benchmarks
            </p>
          </div>
        </div>

        {/* Tab Switcher with min 44px targets */}
        <div className="flex items-center bg-[#101211] p-1 rounded-xs border border-[#46534A]">
          <button
            onClick={() => setActiveTab('farmer')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all ${
              activeTab === 'farmer'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#DAB77A]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Sprout className="w-4 h-4 text-[#DAB77A]" />
            <span>Farmer Harvest Registration</span>
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all ${
              activeTab === 'buyer'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Truck className="w-4 h-4 text-[#69D9AD]" />
            <span>Buyer Procurement Logistics</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#202622] border border-[#A4E4B5] rounded-xs text-xs text-[#A4E4B5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#A4E4B5] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#202622] border border-[#F1A79C] rounded-xs text-xs text-[#F1A79C] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#F1A79C] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Voice Action Card */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-[#F2EFE6] uppercase font-mono tracking-wider">
          Voice Harvest Registration Dispatch
        </h2>
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
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#2C3530]">
                <div>
                  <h3 className="text-sm font-semibold text-[#F2EFE6]">Crop Procurement Rate Board</h3>
                  <p className="text-xs text-[#A4B0A6]">
                    Official CCEA MSP benchmarks (PIB PRID 2269182) and verified spot rates for non-MSP produce
                  </p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {crops.map((c) => {
                  const isSelected = c.id === selectedCropId;
                  const ratePerQuintal = (c.indicative_rate_paise_per_quintal / 100).toLocaleString('en-IN');
                  const isMsp = c.is_msp_mandated === 1;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCropId(c.id)}
                      className={`cursor-pointer rounded-xs p-4 border transition-colors flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#2A322D] border-[#DAB77A]'
                          : 'bg-[#101211] border-[#2C3530] hover:border-[#46534A]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs border font-mono ${
                              isMsp
                                ? 'bg-[#202622] text-[#A4E4B5] border-[#A4E4B5]'
                                : 'bg-[#202622] text-[#A4B0A6] border-[#46534A]'
                            }`}
                          >
                            {isMsp ? 'Official MSP' : 'Indicative Spot'}
                          </span>
                          <span className="text-xs font-bold text-[#69D9AD] font-mono tabular-nums">
                            ₹{ratePerQuintal} / q
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F2EFE6]">{c.crop_name}</h4>
                        <p className="text-[11px] text-[#A4B0A6]">Variety: {c.variety}</p>

                        {isMsp ? (
                          <div className="text-[10px] text-[#A4E4B5] space-y-0.5 pt-1 border-t border-[#2C3530]">
                            <div>Season: {c.marketing_season || 'RMS 2025-26'}</div>
                            <div className="truncate font-mono">
                              Source: {c.source_name || 'CCEA, Govt. of India (PIB)'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#A4B0A6] pt-1 border-t border-[#2C3530]">
                            Non-MSP perishable crop : Mandi spot market rate
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#2C3530] flex items-center justify-between text-xs">
                        <span className={isSelected ? 'text-[#DAB77A] font-semibold' : 'text-[#A4B0A6]'}>
                          {isSelected ? 'Selected Crop' : 'Click to select'}
                        </span>
                        {c.source_url && (
                          <a
                            href={c.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-[#86D5D4] hover:underline font-mono"
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

            {/* Farm Gate Pickup Policy */}
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#DAB77A]" />
                <h3 className="text-sm font-semibold text-[#F2EFE6]">Direct Farm-Gate Logistics Policy</h3>
              </div>
              <p className="text-xs text-[#C3CBC3] leading-relaxed">
                ZYVO procurement partners provide weighing and direct farm-gate collection for harvest lots over 5 quintals. Rates are benchmarked against official mandi minimum support criteria with zero broker deductions.
              </p>
            </div>
          </div>

          {/* Harvest Registration Form */}
          <div className="space-y-4">
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#2C3530]">
                <Sprout className="w-4 h-4 text-[#DAB77A]" />
                <h3 className="text-sm font-semibold text-[#F2EFE6]">Register Harvest Lot</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-[#A4B0A6] block mb-1">Selected Crop</label>
                  <div className="p-2.5 bg-[#101211] border border-[#2C3530] rounded-xs text-[#F2EFE6] font-semibold flex justify-between">
                    <span>{selectedCrop?.crop_name || 'Crop'}</span>
                    <span className="text-[#69D9AD] font-mono tabular-nums">
                      ₹{((selectedCrop?.indicative_rate_paise_per_quintal || 150000) / 100).toLocaleString('en-IN')}/q
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#A4B0A6] block mb-1">Harvest Volume</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={volumeInput}
                      onChange={(e) => setVolumeInput(parseFloat(e.target.value) || 0)}
                      className="w-2/3 bg-[#101211] border border-[#46534A] rounded-xs px-3 py-2 text-xs text-[#F2EFE6] font-mono tabular-nums"
                    />
                    <select
                      value={unit}
                      onChange={(e: any) => setUnit(e.target.value)}
                      className="w-1/3 bg-[#101211] border border-[#46534A] rounded-xs px-2 py-2 text-xs text-[#F2EFE6]"
                    >
                      <option value="quintals">Quintals</option>
                      <option value="kg">Kilograms</option>
                      <option value="crates">Crates (25kg)</option>
                    </select>
                  </div>
                  {unit !== 'quintals' && (
                    <p className="text-[10px] text-[#DAB77A] mt-1 font-mono tabular-nums">
                      = {volumeQuintals.toFixed(2)} quintals
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-[#A4B0A6] block mb-1">Farm Pickup Location</label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-[#101211] border border-[#46534A] rounded-xs px-3 py-2 text-xs text-[#F2EFE6]"
                    placeholder="Field number / Landmark / Gate"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A4B0A6] block mb-1">Preferred Pickup Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-[#101211] border border-[#46534A] rounded-xs px-3 py-2 text-xs text-[#F2EFE6] font-mono"
                  />
                </div>

                <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs space-y-1">
                  <div className="flex justify-between text-[#A4B0A6]">
                    <span>
                      {selectedCrop?.is_msp_mandated === 1 ? 'Official MSP Benchmark' : 'Indicative Mandi Spot'}
                    </span>
                    <span className="font-mono tabular-nums">
                      ₹{((selectedCrop?.indicative_rate_paise_per_quintal || 150000) / 100).toLocaleString('en-IN')}/q
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-[#2C3530]">
                    <span className="text-[#F2EFE6] font-semibold">Total Indicative Payout</span>
                    <span className="text-[#69D9AD] font-bold font-mono tabular-nums">
                      ₹{(estimatedPayoutPaise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A4B0A6] pt-1">
                    Indicative payout based on harvest volume; verified upon mandi quality check.
                  </p>
                </div>

                <button
                  onClick={handleRegisterProcurement}
                  disabled={loading}
                  className="min-h-[44px] w-full py-2.5 rounded-xs bg-[#69D9AD] hover:bg-[#86D5D4] disabled:opacity-50 text-[#101211] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Lot (₹{(estimatedPayoutPaise / 100).toLocaleString('en-IN')})</span>
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
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-4 space-y-1">
              <span className="text-xs text-[#A4B0A6] font-mono">Active Procurement Lots</span>
              <div className="text-xl font-bold text-[#F2EFE6] font-mono tabular-nums">
                {requests.filter((r) => r.status !== 'CANCELLED').length}
              </div>
            </div>

            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-4 space-y-1">
              <span className="text-xs text-[#A4B0A6] font-mono">Total Harvest Volume</span>
              <div className="text-xl font-bold text-[#DAB77A] font-mono tabular-nums">
                {totalVolumeQuintals.toFixed(1)} quintals
              </div>
            </div>

            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-4 space-y-1">
              <span className="text-xs text-[#A4B0A6] font-mono">Committed Payout Value</span>
              <div className="text-xl font-bold text-[#69D9AD] font-mono tabular-nums">
                ₹{(totalCommittedPayoutPaise / 100).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Active Procurement Requests Table */}
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C3530]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#DAB77A]" />
                <h3 className="text-sm font-semibold text-[#F2EFE6]">Procurement Offers & Logistics Queue</h3>
              </div>
              <button
                onClick={loadData}
                className="min-h-[44px] px-3.5 py-1.5 bg-[#202622] text-[#A4B0A6] hover:text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A4B0A6] border border-dashed border-[#46534A] rounded-xs">
                No procurement offers registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101211] text-[#A4B0A6] border-b border-[#46534A] font-mono">
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
                  <tbody className="divide-y divide-[#2C3530] font-mono">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-[#202622]">
                        <td className="p-3 text-[#F2EFE6] font-bold">{r.id}</td>
                        <td className="p-3 text-[#F2EFE6]">
                          {r.farmer_name}
                          <span className="block text-[10px] text-[#A4B0A6] font-normal">{r.farmer_phone}</span>
                        </td>
                        <td className="p-3 text-[#F2EFE6]">
                          {r.crop_name} ({r.variety})
                          <span className="block text-[11px] text-[#DAB77A] font-bold tabular-nums">
                            {r.estimated_volume_quintals} quintals
                          </span>
                        </td>
                        <td className="p-3 text-[#A4B0A6]">
                          {r.pickup_date || 'Standard'}
                          <span className="block text-[10px] text-[#A4B0A6] truncate max-w-xs">
                            {r.schedule?.pickup_location || 'Farm Gate'}
                          </span>
                        </td>
                        <td className="p-3 text-[#69D9AD] font-bold tabular-nums">
                          ₹{(r.total_estimated_payout_paise / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold border ${
                              r.status === 'COLLECTED'
                                ? 'bg-[#202622] text-[#A4E4B5] border-[#A4E4B5]'
                                : r.status === 'PICKUP_SCHEDULED'
                                ? 'bg-[#202622] text-[#DAB77A] border-[#DAB77A]'
                                : r.status === 'VERIFIED'
                                ? 'bg-[#202622] text-[#86D5D4] border-[#86D5D4]'
                                : 'bg-[#202622] text-[#A4B0A6] border-[#46534A]'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {r.status === 'REGISTERED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'VERIFIED')}
                              className="min-h-[36px] px-2.5 py-1 rounded-xs bg-[#202622] hover:bg-[#2A322D] text-[#86D5D4] border border-[#86D5D4] text-[10px] font-medium font-sans"
                            >
                              Verify Lot
                            </button>
                          )}
                          {r.status === 'VERIFIED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'PICKUP_SCHEDULED')}
                              className="min-h-[36px] px-2.5 py-1 rounded-xs bg-[#202622] hover:bg-[#2A322D] text-[#DAB77A] border border-[#DAB77A] text-[10px] font-medium font-sans"
                            >
                              Schedule Pickup
                            </button>
                          )}
                          {r.status === 'PICKUP_SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'COLLECTED')}
                              className="min-h-[36px] px-2.5 py-1 rounded-xs bg-[#69D9AD] hover:bg-[#86D5D4] text-[#101211] text-[10px] font-semibold font-sans"
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

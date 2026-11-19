'use client';

import React, { useState } from 'react';
import { Settings, Database, Mic, Cpu, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  async function handlePurgeDemoData() {
    if (!confirm('Are you sure you want to purge all demo transaction records and reset catalogs?')) {
      return;
    }

    setPurging(true);
    setPurgeSuccess(false);

    try {
      const res = await fetch('/api/admin/purge-demo-data', {
        method: 'POST',
      });
      if (res.ok) {
        setPurgeSuccess(true);
        setTimeout(() => setPurgeSuccess(false), 4000);
      }
    } catch (e) {
      console.error('Failed to purge demo data', e);
    } finally {
      setPurging(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F1EADE]">Platform Diagnostics & Controls</h1>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Configuration telemetry, database persistence, and demonstration administration
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#151415] border border-[#2A2C30] text-xs text-[#8B9CB5] font-mono">
          Engine Version 2.0.0
        </div>
      </div>

      {/* Engine Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-[#F1EADE]">Database Storage</h3>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[#8B9CB5]">Driver: <span className="text-[#F1EADE]">node:sqlite (DatabaseSync)</span></div>
            <div className="text-[#8B9CB5]">Storage: <span className="text-[#F1EADE]">zyvo.db (WAL Mode)</span></div>
            <div className="text-[#8B9CB5]">Foreign Keys: <span className="text-emerald-400 font-semibold">ENFORCED (PRAGMA ON)</span></div>
          </div>
        </div>

        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-[#F1EADE]">Speech-to-Text Pipeline</h3>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[#8B9CB5]">Provider: <span className="text-[#F1EADE]">Sarvam Saaras v4</span></div>
            <div className="text-[#8B9CB5]">Fallback: <span className="text-emerald-400">Benchmark Evaluator</span></div>
            <div className="text-[#8B9CB5]">Languages: <span className="text-[#F1EADE]">Hindi, Hinglish, English</span></div>
          </div>
        </div>

        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-[#F1EADE]">Slot Extraction Engine</h3>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[#8B9CB5]">Schema LLM: <span className="text-[#F1EADE]">Gemini 3.5 Flash-Lite</span></div>
            <div className="text-[#8B9CB5]">Deterministic: <span className="text-emerald-400 font-semibold">Bounded Regex Parser</span></div>
            <div className="text-[#8B9CB5]">Financials: <span className="text-amber-400">Integer Paise (₹1 = 100p)</span></div>
          </div>
        </div>
      </div>

      {/* Operator Data Purge Card */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F1EADE]">Purge Demo Transaction Ledger</h3>
          <p className="text-xs text-[#8B9CB5] mt-1 leading-relaxed">
            Resets all temporary voice submissions, delivery calendar adjustments, grocery orders, vegetable baskets, clinic appointments, and agri procurement entries back to the clean baseline. Seed users, workspaces, and master product catalogs are safely preserved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeDemoData}
            disabled={purging}
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-200 rounded-lg text-xs font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {purging ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Resetting Database...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Demo Transactions</span>
              </>
            )}
          </button>

          {purgeSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Database baseline restored successfully</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

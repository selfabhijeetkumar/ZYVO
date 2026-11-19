'use client';

import React, { useState } from 'react';
import { Settings, Database, Mic, Cpu, Trash2, CheckCircle2, RefreshCw, Globe, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  async function handlePurgeDemoData() {
    if (!confirm('Are you sure you want to purge all demo transaction records and reset to baseline?')) {
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
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xs bg-[#202622] border border-[#69D9AD] flex items-center justify-center text-[#69D9AD]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#F2EFE6]">
                Platform Diagnostics & Telemetry
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#202622] text-[#69D9AD] border border-[#46534A]">
                OBSERVATORY
              </span>
            </div>
            <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
              Configuration telemetry, database persistence, and pre-launch deployment controls
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xs bg-[#101211] border border-[#46534A] text-xs text-[#A4B0A6] font-mono">
          ENGINE V3.0.0 · NODE:SQLITE
        </div>
      </div>

      {/* Engine Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#69D9AD]" />
            <h3 className="text-sm font-semibold text-[#F2EFE6]">Database Storage</h3>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[#A4B0A6]">Driver: <span className="text-[#F2EFE6]">node:sqlite (DatabaseSync)</span></div>
            <div className="text-[#A4B0A6]">Storage: <span className="text-[#F2EFE6]">zyvo.db (WAL Mode)</span></div>
            <div className="text-[#A4B0A6]">Foreign Keys: <span className="text-[#A4E4B5] font-semibold">ENFORCED (PRAGMA ON)</span></div>
          </div>
        </div>

        <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#DAB77A]" />
            <h3 className="text-sm font-semibold text-[#F2EFE6]">Speech Pipeline Router</h3>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[#A4B0A6]">Provider Router: <span className="text-[#F2EFE6]">Decoupled Provider Registry</span></div>
            <div className="text-[#A4B0A6]">External API: <span className="text-[#69D9AD]">EXTERNAL_API_ENABLED=false</span></div>
            <div className="text-[#A4B0A6]">Dialects: <span className="text-[#F2EFE6]">Hindi, Hinglish, English</span></div>
          </div>
        </div>

        <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#86D5D4]" />
            <h3 className="text-sm font-semibold text-[#F2EFE6]">Structured Intent Extraction</h3>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[#A4B0A6]">Deterministic: <span className="text-[#69D9AD] font-semibold">Bounded Regex Parser</span></div>
            <div className="text-[#A4B0A6]">Financial Engine: <span className="text-[#DAB77A]">Strict Integer Paise</span></div>
            <div className="text-[#A4B0A6]">Confirmation: <span className="text-[#86D5D4]">Two-Phase Commit Gate</span></div>
          </div>
        </div>
      </div>

      {/* Pre-launch Deployment & Domain Architecture Card */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#86D5D4]" />
          <h3 className="text-sm font-semibold text-[#F2EFE6]">Production Launch Prerequisites</h3>
        </div>
        <p className="text-xs text-[#C3CBC3] leading-relaxed">
          The following operational items are documented as pre-launch requirements prior to public production deployment:
        </p>
        <ul className="text-xs text-[#A4B0A6] space-y-1.5 font-mono list-disc list-inside">
          <li>Custom Domain DNS Binding: Point CNAME / A records to host environment (e.g. app.zyvo.in).</li>
          <li>TLS / SSL Certificate Termination: Managed via Cloudflare or Let's Encrypt automated certificate lifecycle.</li>
          <li>Production Environment Secrets: Populate production credentials in self-hosted vault when activating live external API mode.</li>
          <li>Legal Counsel Sign-off: Complete corporate entity incorporation and formalize terms of service.</li>
        </ul>
      </div>

      {/* Operator Data Purge Card */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F2EFE6]">Purge Demo Transaction Ledger</h3>
          <p className="text-xs text-[#A4B0A6] mt-1 leading-relaxed">
            Resets all temporary voice submissions, delivery calendar adjustments, grocery orders, vegetable baskets, clinic appointments, and agri procurement entries back to clean seed baseline. Seed users, workspaces, and master product catalogs are safely preserved with foreign-key cascade protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeDemoData}
            disabled={purging}
            className="min-h-[44px] px-4 py-2 bg-[#202622] hover:bg-[#2A322D] border border-[#F1A79C] text-[#F1A79C] rounded-xs text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
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
            <div className="flex items-center gap-1.5 text-xs text-[#A4E4B5] font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Database baseline restored successfully</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

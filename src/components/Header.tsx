'use client';

import React, { useEffect, useState } from 'react';
import { User, Shield, Users } from 'lucide-react';

interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export function Header() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to fetch session', e);
    }
  }

  async function switchUser(role: 'operator' | 'customer') {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to switch user', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="h-16 border-b border-[#46534A] bg-[#101211]/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm sm:text-base tracking-wide text-[#F2EFE6]">ZYVO</span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-xs bg-[#202622] text-[#A4B0A6] border border-[#46534A] font-mono">
            REWIRED · Track ECHO
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#46534A] text-xs text-[#A4B0A6]">
          <span className="inline-block w-2 h-2 rounded-xs bg-[#69D9AD] animate-pulse" />
          <span>Observatory Engine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Persona Switcher with Accessible 44px Touch Targets */}
        <div className="flex items-center bg-[#171B19] border border-[#46534A] rounded-xs p-1">
          <button
            onClick={() => switchUser('operator')}
            disabled={loading}
            className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-xs transition flex items-center gap-1.5 ${
              user?.role === 'operator'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
            title="Switch to Platform Operator (Kumar)"
            aria-pressed={user?.role === 'operator'}
          >
            <Shield className="w-3.5 h-3.5 text-[#69D9AD]" />
            <span className="hidden sm:inline">Operator</span>
          </button>

          <button
            onClick={() => switchUser('customer')}
            disabled={loading}
            className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-xs transition flex items-center gap-1.5 ${
              user?.role !== 'operator'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#DAB77A]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
            title="Switch to Customer/Farmer/Patient (Sharma)"
            aria-pressed={user?.role !== 'operator'}
          >
            <Users className="w-3.5 h-3.5 text-[#DAB77A]" />
            <span className="hidden sm:inline">Customer</span>
          </button>
        </div>

        {/* User Identity Box */}
        <div className="hidden sm:flex items-center gap-2 min-h-[44px] px-3 py-1.5 rounded-xs bg-[#171B19] border border-[#46534A] text-xs">
          <User className="w-3.5 h-3.5 text-[#A4B0A6]" />
          <span className="text-[#F2EFE6] font-medium">{user ? user.name : 'Loading...'}</span>
          <span className="text-[#A4B0A6] capitalize">({user?.role || 'member'})</span>
        </div>
      </div>
    </header>
  );
}

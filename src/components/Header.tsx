'use client';

import React, { useEffect, useState } from 'react';
import { User, Shield, Users, Radio } from 'lucide-react';

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
    <header className="h-16 border-b border-[#2A2C30] bg-[#151415]/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base tracking-wide text-[#F1EADE]">ZYVO</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#242528] text-[#8B9CB5] border border-[#2A2C30] font-mono">
            REWIRED · Track ECHO
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#2A2C30] text-xs text-[#8B9CB5]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Engine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Demo Persona Switcher */}
        <div className="flex items-center bg-[#1B1C1E] border border-[#2A2C30] rounded-lg p-1">
          <button
            onClick={() => switchUser('operator')}
            disabled={loading}
            className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1.5 ${
              user?.role === 'operator'
                ? 'bg-[#242528] text-[#F1EADE] shadow-sm border border-[#2A2C30]'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
            title="Switch to Platform Operator (Kumar)"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Operator</span>
          </button>

          <button
            onClick={() => switchUser('customer')}
            disabled={loading}
            className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1.5 ${
              user?.role !== 'operator'
                ? 'bg-[#242528] text-[#F1EADE] shadow-sm border border-[#2A2C30]'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
            title="Switch to Customer/Farmer/Patient (Sharma)"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Customer</span>
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B1C1E] border border-[#2A2C30] text-xs">
          <User className="w-3.5 h-3.5 text-[#8B9CB5]" />
          <span className="text-[#F1EADE] font-medium">{user ? user.name : 'Loading...'}</span>
          <span className="text-[#8B9CB5] capitalize">({user?.role || 'member'})</span>
        </div>
      </div>
    </header>
  );
}

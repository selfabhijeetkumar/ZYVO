'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Milk,
  Store,
  Carrot,
  Stethoscope,
  Tractor,
  Activity,
  Settings,
  Menu,
  X,
  Radio,
} from 'lucide-react';

const MODULE_NAV = [
  {
    name: 'Milk Delivery',
    href: '/milk',
    icon: Milk,
    status: 'active',
    statusLabel: 'Active',
  },
  {
    name: 'Kirana Store',
    href: '/kirana',
    icon: Store,
    status: 'active',
    statusLabel: 'Active',
  },
  {
    name: 'Vegetable Vendor',
    href: '/vegetables',
    icon: Carrot,
    status: 'active',
    statusLabel: 'Active',
  },
  {
    name: 'Clinic Outpatient',
    href: '/clinic',
    icon: Stethoscope,
    status: 'active',
    statusLabel: 'Active',
  },
  {
    name: 'Agri Procurement',
    href: '/agriculture',
    icon: Tractor,
    status: 'active',
    statusLabel: 'Active',
  },
];

const SYSTEM_NAV = [
  {
    name: 'Platform Overview',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Activity & Audit',
    href: '/activity',
    icon: Activity,
  },
  {
    name: 'Platform Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3.5 bg-[#1B1C1E] border border-[#2A2C30] text-[#F1EADE] rounded-full shadow-lg"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#1B1C1E] border-r border-[#2A2C30] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo / Title Area */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-[#2A2C30]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#F1EADE]">ZYVO</div>
              <div className="text-[10px] text-[#8B9CB5] tracking-wider uppercase font-medium">Operations Engine</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-3 py-4 space-y-6">
            {/* Core Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#8B9CB5]">
                Platform
              </div>
              <nav className="space-y-1">
                {SYSTEM_NAV.slice(0, 1).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#242528] text-[#F1EADE] border border-[#2A2C30]'
                          : 'text-[#8B9CB5] hover:bg-[#242528]/50 hover:text-[#F1EADE]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#8B9CB5]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Modules Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#8B9CB5]">
                Industry Modules
              </div>
              <nav className="space-y-1">
                {MODULE_NAV.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = pathname === mod.href;
                  const isRef = mod.status === 'active';
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#242528] text-[#F1EADE] border border-[#2A2C30]'
                          : 'text-[#8B9CB5] hover:bg-[#242528]/50 hover:text-[#F1EADE]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#8B9CB5]'}`} />
                        <span>{mod.name}</span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isRef
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-[#151415] text-[#8B9CB5] border border-[#2A2C30]'
                        }`}
                      >
                        {mod.statusLabel}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Governance & Logs Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#8B9CB5]">
                Governance
              </div>
              <nav className="space-y-1">
                {SYSTEM_NAV.slice(1).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#242528] text-[#F1EADE] border border-[#2A2C30]'
                          : 'text-[#8B9CB5] hover:bg-[#242528]/50 hover:text-[#F1EADE]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#8B9CB5]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer Card */}
          <div className="p-4 border-t border-[#2A2C30]">
            <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg">
              <div className="text-[11px] font-medium text-[#F1EADE]">Structured Money</div>
              <div className="text-[10px] text-[#8B9CB5] mt-0.5">
                Integer paise financials · Zero floating-point drift
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

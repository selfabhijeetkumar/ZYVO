'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  FileText,
} from 'lucide-react';

const MODULE_NAV = [
  {
    name: 'Milk Delivery',
    href: '/milk',
    icon: Milk,
    statusLabel: 'Active',
    accentColor: '#86D5D4',
  },
  {
    name: 'Kirana Store',
    href: '/kirana',
    icon: Store,
    statusLabel: 'Active',
    accentColor: '#DAB77A',
  },
  {
    name: 'Vegetable Vendor',
    href: '/vegetables',
    icon: Carrot,
    statusLabel: 'Active',
    accentColor: '#69D9AD',
  },
  {
    name: 'Clinic Outpatient',
    href: '/clinic',
    icon: Stethoscope,
    statusLabel: 'Active',
    accentColor: '#86D5D4',
  },
  {
    name: 'Agri Procurement',
    href: '/agriculture',
    icon: Tractor,
    statusLabel: 'Active',
    accentColor: '#DAB77A',
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
  },
];

const LEGAL_NAV = [
  {
    name: 'Privacy Policy',
    href: '/privacy',
    icon: ShieldCheck,
  },
  {
    name: 'Terms & Conditions',
    href: '/terms',
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Toggle Button with WCAG 44px min target and square styling */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="min-w-[44px] min-h-[44px] p-3 bg-[#171B19] border border-[#46534A] text-[#F2EFE6] rounded-xs shadow-xl flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#69D9AD]"
          aria-label={mobileOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5 text-[#F2EFE6]" /> : <Menu className="w-5 h-5 text-[#69D9AD]" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#171B19] border-r border-[#46534A] flex flex-col justify-between transition-transform duration-200 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Main Navigation"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo / Title Area */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-[#46534A]">
            <div className="w-8 h-8 rounded-xs bg-[#202622] border border-[#69D9AD] flex items-center justify-center text-[#69D9AD]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#F2EFE6]">ZYVO</div>
              <div className="text-[10px] text-[#A4B0A6] tracking-wider uppercase font-mono">
                Observatory Core
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-3 py-4 space-y-5">
            {/* Platform Overview */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#A4B0A6]">
                Observatory
              </div>
              <nav className="space-y-1">
                {SYSTEM_NAV.slice(0, 1).map((item) => {
                  const Icon = item.icon || LayoutDashboard;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`min-h-[44px] flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xs transition-colors relative ${
                        isActive
                          ? 'bg-[#202622] text-[#F2EFE6] border border-[#46534A]'
                          : 'text-[#C3CBC3] hover:bg-[#202622]/60 hover:text-[#F2EFE6]'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#69D9AD] rounded-r-xs" />
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#69D9AD]' : 'text-[#A4B0A6]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Modules Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#A4B0A6]">
                Industry Nodes
              </div>
              <nav className="space-y-1">
                {MODULE_NAV.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = pathname === mod.href;
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      onClick={() => setMobileOpen(false)}
                      className={`min-h-[44px] flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xs transition-colors relative ${
                        isActive
                          ? 'bg-[#202622] text-[#F2EFE6] border border-[#46534A]'
                          : 'text-[#C3CBC3] hover:bg-[#202622]/60 hover:text-[#F2EFE6]'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#69D9AD] rounded-r-xs" />
                      )}
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#69D9AD]' : 'text-[#A4B0A6]'}`} />
                        <span>{mod.name}</span>
                      </div>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-xs font-mono bg-[#101211] text-[#A4B0A6] border border-[#2C3530]"
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
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#A4B0A6]">
                Governance & Audit
              </div>
              <nav className="space-y-1">
                {SYSTEM_NAV.slice(1).map((item) => {
                  const Icon = item.icon || Settings;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`min-h-[44px] flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xs transition-colors relative ${
                        isActive
                          ? 'bg-[#202622] text-[#F2EFE6] border border-[#46534A]'
                          : 'text-[#C3CBC3] hover:bg-[#202622]/60 hover:text-[#F2EFE6]'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#69D9AD] rounded-r-xs" />
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#69D9AD]' : 'text-[#A4B0A6]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Legal & Compliance Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-[#A4B0A6]">
                Legal & Pre-Launch
              </div>
              <nav className="space-y-1">
                {LEGAL_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`min-h-[44px] flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xs transition-colors relative ${
                        isActive
                          ? 'bg-[#202622] text-[#F2EFE6] border border-[#46534A]'
                          : 'text-[#C3CBC3] hover:bg-[#202622]/60 hover:text-[#F2EFE6]'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#69D9AD] rounded-r-xs" />
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#69D9AD]' : 'text-[#A4B0A6]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer Card with Institutional Precision Note */}
          <div className="p-4 border-t border-[#46534A]">
            <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs">
              <div className="text-[11px] font-medium text-[#F2EFE6] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-xs bg-[#69D9AD]" />
                <span>Financial Precision Engine</span>
              </div>
              <div className="text-[10px] text-[#A4B0A6] mt-1 font-mono">
                Integer paise arithmetic : Zero floating-point drift
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

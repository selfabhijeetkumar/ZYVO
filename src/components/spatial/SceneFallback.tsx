'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MODULE_NODES } from './ZyvoVoiceCore';

interface SceneFallbackProps {
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
}

export default function SceneFallback({
  selectedModuleId = 'milk_delivery',
  onSelectModule,
}: SceneFallbackProps) {
  const [activeModule, setActiveModule] = useState(selectedModuleId);

  const handleSelect = (id: string) => {
    setActiveModule(id);
    if (onSelectModule) {
      onSelectModule(id);
    }
  };

  const activeNode = MODULE_NODES.find((m) => m.id === activeModule) || MODULE_NODES[0];

  return (
    <div className="w-full rounded-md border border-[#46534A] bg-[#101211] p-6 text-[#F2EFE6] shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#2C3530]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#69D9AD]">
            OPERATIONAL OBSERVATORY (SCHEMATIC VIEW)
          </div>
          <h3 className="text-base font-semibold text-[#F2EFE6] mt-0.5">
            Voice Core Architecture & Connected Industry Orbit
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-[#202622] text-[#A4B0A6] border border-[#46534A]">
          SCHEMATIC MODE
        </span>
      </div>

      {/* SVG Architectural Topology */}
      <div className="my-6 flex justify-center">
        <svg
          viewBox="0 0 600 280"
          className="w-full max-w-2xl h-auto overflow-visible"
          role="img"
          aria-label="Schematic diagram of Voice Core connected to five industry nodes"
        >
          {/* Radial Grid lines */}
          <circle cx="300" cy="140" r="120" fill="none" stroke="#2C3530" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="300" cy="140" r="70" fill="none" stroke="#2C3530" strokeWidth="1" />

          {/* Central Voice Core */}
          <circle cx="300" cy="140" r="38" fill="#171B19" stroke="#69D9AD" strokeWidth="2" />
          <circle cx="300" cy="140" r="24" fill="#202622" stroke="#24765E" strokeWidth="1.5" />
          <text x="300" y="137" textAnchor="middle" fill="#69D9AD" fontSize="10" fontFamily="monospace" fontWeight="bold">
            VOICE CORE
          </text>
          <text x="300" y="149" textAnchor="middle" fill="#A4B0A6" fontSize="8" fontFamily="monospace">
            VC-01
          </text>

          {/* Conduit Lines and Nodes */}
          {/* 1. Milk Delivery */}
          <line x1="300" y1="140" x2="100" y2="70" stroke={activeModule === 'milk_delivery' ? '#86D5D4' : '#46534A'} strokeWidth={activeModule === 'milk_delivery' ? '2.5' : '1'} />
          <circle cx="100" cy="70" r="24" fill={activeModule === 'milk_delivery' ? '#2A322D' : '#171B19'} stroke="#86D5D4" strokeWidth="1.5" />
          <text x="100" y="73" textAnchor="middle" fill="#F2EFE6" fontSize="9" fontWeight="medium">
            Milk
          </text>

          {/* 2. Kirana Store */}
          <line x1="300" y1="140" x2="500" y2="70" stroke={activeModule === 'kirana' ? '#DAB77A' : '#46534A'} strokeWidth={activeModule === 'kirana' ? '2.5' : '1'} />
          <circle cx="500" cy="70" r="24" fill={activeModule === 'kirana' ? '#2A322D' : '#171B19'} stroke="#DAB77A" strokeWidth="1.5" />
          <text x="500" y="73" textAnchor="middle" fill="#F2EFE6" fontSize="9" fontWeight="medium">
            Kirana
          </text>

          {/* 3. Vegetable Vendor */}
          <line x1="300" y1="140" x2="140" y2="210" stroke={activeModule === 'vegetable_vendor' ? '#69D9AD' : '#46534A'} strokeWidth={activeModule === 'vegetable_vendor' ? '2.5' : '1'} />
          <circle cx="140" cy="210" r="24" fill={activeModule === 'vegetable_vendor' ? '#2A322D' : '#171B19'} stroke="#69D9AD" strokeWidth="1.5" />
          <text x="140" y="213" textAnchor="middle" fill="#F2EFE6" fontSize="9" fontWeight="medium">
            Vegetables
          </text>

          {/* 4. Clinic */}
          <line x1="300" y1="140" x2="460" y2="210" stroke={activeModule === 'clinic' ? '#86D5D4' : '#46534A'} strokeWidth={activeModule === 'clinic' ? '2.5' : '1'} />
          <circle cx="460" cy="210" r="24" fill={activeModule === 'clinic' ? '#2A322D' : '#171B19'} stroke="#86D5D4" strokeWidth="1.5" />
          <text x="460" y="213" textAnchor="middle" fill="#F2EFE6" fontSize="9" fontWeight="medium">
            Clinic
          </text>

          {/* 5. Agriculture */}
          <line x1="300" y1="140" x2="300" y2="250" stroke={activeModule === 'agriculture' ? '#DAB77A' : '#46534A'} strokeWidth={activeModule === 'agriculture' ? '2.5' : '1'} />
          <circle cx="300" cy="250" r="24" fill={activeModule === 'agriculture' ? '#2A322D' : '#171B19'} stroke="#DAB77A" strokeWidth="1.5" />
          <text x="300" y="253" textAnchor="middle" fill="#F2EFE6" fontSize="9" fontWeight="medium">
            Agriculture
          </text>
        </svg>
      </div>

      {/* Synchronized Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t border-[#2C3530]">
        {MODULE_NODES.map((node) => {
          const isSelected = node.id === activeModule;
          return (
            <button
              key={node.id}
              onClick={() => handleSelect(node.id)}
              className={`min-h-[44px] p-2.5 rounded-xs border text-left transition-colors ${
                isSelected
                  ? 'bg-[#2A322D] border-[#69D9AD] text-[#F2EFE6]'
                  : 'bg-[#202622] border-[#46534A] text-[#C3CBC3] hover:text-[#F2EFE6]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: node.accentColor }} />
                <span className="text-xs font-semibold">{node.name}</span>
              </div>
              <div className="text-[10px] text-[#A4B0A6] truncate">{node.category}</div>
            </button>
          );
        })}
      </div>

      {/* Active Node Provenance & Destination Link */}
      <div className="mt-4 p-3 rounded-xs bg-[#171B19] border border-[#2C3530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-[#F2EFE6]">{activeNode.name}</div>
          <div className="text-[11px] text-[#A4B0A6] mt-0.5">{activeNode.operationalDetail}</div>
        </div>
        <Link
          href={activeNode.route}
          className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-xs bg-[#69D9AD] text-[#101211] hover:bg-[#86D5D4] transition-colors shrink-0"
        >
          Open Workflow →
        </Link>
      </div>
    </div>
  );
}

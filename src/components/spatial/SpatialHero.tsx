'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import SceneFallback from './SceneFallback';

const ZyvoVoiceCore = dynamic(() => import('./ZyvoVoiceCore'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[420px] lg:h-[480px] rounded-md border border-[#46534A] bg-[#101211] flex items-center justify-center">
      <div className="text-center space-y-2">
        <span className="inline-block w-3 h-3 rounded-xs bg-[#69D9AD] animate-pulse" />
        <div className="text-xs font-mono text-[#A4B0A6]">
          INITIALIZING SPATIAL OBSERVATORY CORE...
        </div>
      </div>
    </div>
  ),
});

interface SpatialHeroProps {
  initialModuleId?: string;
}

export default function SpatialHero({ initialModuleId = 'milk_delivery' }: SpatialHeroProps) {
  const [selectedModule, setSelectedModule] = useState(initialModuleId);

  return (
    <div className="w-full">
      <ZyvoVoiceCore
        selectedModuleId={selectedModule}
        onSelectModule={(id) => setSelectedModule(id)}
      />
    </div>
  );
}

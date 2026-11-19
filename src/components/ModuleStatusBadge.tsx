import React from 'react';

interface ModuleStatusBadgeProps {
  status: 'active_reference' | 'foundation_ready' | 'active';
  label?: string;
  size?: 'sm' | 'md';
}

export function ModuleStatusBadge({ status, label, size = 'sm' }: ModuleStatusBadgeProps) {
  const isReference = status === 'active_reference' || status === 'active';
  const displayLabel = label || (isReference ? 'Active Workflow' : 'Foundation Ready');

  const textClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-xs border font-mono ${textClass} ${
        isReference
          ? 'bg-[#202622] text-[#69D9AD] border-[#46534A]'
          : 'bg-[#202622] text-[#DAB77A] border-[#46534A]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-xs ${
          isReference ? 'bg-[#69D9AD]' : 'bg-[#DAB77A]'
        }`}
      />
      {displayLabel}
    </span>
  );
}

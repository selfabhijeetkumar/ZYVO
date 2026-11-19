import React from 'react';

interface ModuleStatusBadgeProps {
  status: 'active_reference' | 'foundation_ready';
  label?: string;
  size?: 'sm' | 'md';
}

export function ModuleStatusBadge({ status, label, size = 'sm' }: ModuleStatusBadgeProps) {
  const isReference = status === 'active_reference';
  const displayLabel = label || (isReference ? 'Active Reference Workflow' : 'Foundation Ready');

  const textClass = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${textClass} ${
        isReference
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
          : 'bg-amber-950/30 text-amber-300/90 border-amber-800/40'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isReference ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
        }`}
      />
      {displayLabel}
    </span>
  );
}

import React from 'react';

interface StatusBadgeProps {
  quantity: number;
  reorderLevel: number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ quantity, reorderLevel, className = '' }) => {
  if (quantity === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] whitespace-nowrap shrink-0 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
        OUT OF STOCK
      </span>
    );
  }

  if (quantity <= reorderLevel) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef7ea] text-[#b45309] border border-[#fed7aa] whitespace-nowrap shrink-0 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
        LOW STOCK
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#edf7f2] text-[#136348] border border-[#cde8dc] whitespace-nowrap shrink-0 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
      IN STOCK
    </span>
  );
};

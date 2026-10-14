import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const dimensions = {
    sm: { box: 'w-7 h-7 rounded-md', icon: 'w-4 h-4', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-8 h-8 rounded-lg', icon: 'w-4.5 h-4.5', text: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5', text: 'text-xl', sub: 'text-[11px]' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Stocked Icon Badge: 3-tier stacked inventory isometric layers */}
      <div
        className={`${dimensions.box} bg-[#0f5b43] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform hover:scale-105`}
      >
        <svg
          className={dimensions.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Top isometric plane */}
          <path d="m12 3 8 4.2-8 4.2-8-4.2L12 3z" fill="white" fillOpacity="0.22" />
          {/* Mid stacked shelf/level */}
          <path d="m4 11.2 8 4.2 8-4.2" />
          {/* Base stacked shelf/level */}
          <path d="m4 15.4 8 4.2 8-4.2" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${dimensions.text} font-bold tracking-tight text-[#17211d] leading-none`}>
            Stocked
          </span>
          <span className={`${dimensions.sub} font-semibold tracking-wider text-[#7a847d] uppercase mt-0.5`}>
            Inventory
          </span>
        </div>
      )}
    </div>
  );
};

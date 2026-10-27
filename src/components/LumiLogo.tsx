import React from 'react';

interface LumiLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LumiLogo: React.FC<LumiLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  color = '#1E1B18'
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-sm tracking-[0.2em]',
    md: 'text-base tracking-[0.25em]',
    lg: 'text-xl tracking-[0.3em]'
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Exact dual sparkle constellation mark matching LUMI design */}
      <svg
        className={iconSizes[size]}
        viewBox="0 0 100 100"
        fill="currentColor"
        style={{ color }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main top-left 4-point star */}
        <path d="M 42,6 Q 42,38 10,40 Q 42,42 42,74 Q 42,42 74,40 Q 42,38 42,6 Z" />
        {/* Connected bottom-right 4-point star */}
        <path d="M 66,48 Q 66,66 48,68 Q 66,70 66,88 Q 66,70 84,68 Q 66,66 66,48 Z" />
      </svg>

      {showText && (
        <span
          className={`font-sans font-bold text-[#1E1B18] uppercase ${textSizes[size]}`}
          style={{ letterSpacing: '0.22em' }}
        >
          LUMI
        </span>
      )}
    </div>
  );
};

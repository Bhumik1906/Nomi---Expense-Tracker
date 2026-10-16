import React from 'react';
import Link from 'next/link';

interface NomiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const NomiLogo: React.FC<NomiLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link
      href="/dashboard"
      className={`inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] rounded-lg transition-transform active:scale-95 ${className}`}
    >
      {/* Nomi Orbit Symbol: Connected nodes & circular balance flow */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-full bg-[#7C5CFC]/15 dark:bg-[#9A82FF]/20 group-hover:scale-110 transition-transform duration-300" />
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Orbital Ring */}
          <circle
            cx="16"
            cy="16"
            r="11"
            stroke="#7C5CFC"
            strokeWidth="2.2"
            strokeDasharray="4 2"
            className="dark:stroke-[#9A82FF] opacity-90 group-hover:rotate-45 transition-transform duration-700"
          />
          {/* Central Connected Nodes */}
          <circle cx="11" cy="16" r="3.2" fill="#7C5CFC" className="dark:fill-[#9A82FF]" />
          <circle cx="21" cy="16" r="3.2" fill="#20A77A" className="dark:fill-[#39B88A]" />
          <path
            d="M13.8 16H18.2"
            stroke="#7C5CFC"
            strokeWidth="2"
            strokeLinecap="round"
            className="dark:stroke-[#9A82FF]"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-poppins font-bold tracking-tight text-nomi-main ${textSizes[size]}`}
        >
          nomi<span className="text-[#7C5CFC] dark:text-[#9A82FF]">.</span>
        </span>
      )}
    </Link>
  );
};

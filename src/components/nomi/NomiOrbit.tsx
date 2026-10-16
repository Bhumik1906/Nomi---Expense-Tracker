'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NomiOrbitProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
}

export const NomiOrbit: React.FC<NomiOrbitProps> = ({
  className = '',
  size = 'md',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dimensions = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-72 h-72',
    hero: 'w-80 h-80 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px]',
  }[size];

  if (!mounted) return <div className={`${dimensions} ${className}`} />;

  return (
    <div className={`relative ${dimensions} flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* Background Soft Glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#7C5CFC]/20 via-[#EEE9FF]/30 to-transparent dark:from-[#9A82FF]/15 dark:via-[#29233F]/20 blur-2xl animate-pulse-subtle" />

      {/* Outer Orbital Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-[#E5E1EC] dark:border-[#2C2934] border-dashed"
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#7C5CFC] dark:bg-[#9A82FF] shadow-sm shadow-[#7C5CFC]/50" />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#20A77A] dark:bg-[#39B88A]" />
      </motion.div>

      {/* Inner Orbital Ring 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-6 rounded-full border border-[#7C5CFC]/30 dark:border-[#9A82FF]/30"
      >
        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#7C5CFC] dark:bg-[#9A82FF]" />
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E0525D] dark:bg-[#F06A73]" />
      </motion.div>

      {/* Core Node Connections */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-nomi-surface border border-nomi flex items-center justify-center shadow-xl shadow-[#7C5CFC]/5 backdrop-blur-md">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
        >
          {/* Tri-Node Money Flow */}
          <line x1="24" y1="14" x2="14" y2="32" stroke="#7C5CFC" strokeWidth="2" strokeDasharray="3 2" className="dark:stroke-[#9A82FF]" />
          <line x1="24" y1="14" x2="34" y2="32" stroke="#7C5CFC" strokeWidth="2" strokeDasharray="3 2" className="dark:stroke-[#9A82FF]" />
          <line x1="14" y1="32" x2="34" y2="32" stroke="#20A77A" strokeWidth="2" strokeDasharray="3 2" className="dark:stroke-[#39B88A]" />

          {/* Connected Person Nodes */}
          <circle cx="24" cy="14" r="4.5" fill="#7C5CFC" className="dark:fill-[#9A82FF]" />
          <circle cx="14" cy="32" r="4" fill="#20A77A" className="dark:fill-[#39B88A]" />
          <circle cx="34" cy="32" r="4" fill="#E0525D" className="dark:fill-[#F06A73]" />
        </svg>
      </div>
    </div>
  );
};

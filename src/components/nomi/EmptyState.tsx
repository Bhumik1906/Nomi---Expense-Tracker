'use client';

import React from 'react';
import { NomiOrbit } from './NomiOrbit';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-12 px-6 rounded-3xl bg-nomi-surface border border-nomi flex flex-col items-center justify-center text-center">
      <NomiOrbit size="sm" />
      <h3 className="font-poppins font-bold text-lg text-nomi-main mt-4">{title}</h3>
      <p className="text-xs text-nomi-secondary max-w-sm mt-1 mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white text-xs font-poppins font-semibold shadow-md shadow-[#7C5CFC]/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

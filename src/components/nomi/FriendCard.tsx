'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types/nomi';
import { useNomi } from '@/lib/store/nomiStore';
import { formatMoney } from '@/lib/finance/money';
import { CheckCircle2 } from 'lucide-react';
import { SettlementModal } from './SettlementModal';

/** Generates a deterministic color and initials for a user when they have no avatar */
function AvatarFallback({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    ['#EDE9FE', '#7C5CFC'],
    ['#E0F2FE', '#0284C7'],
    ['#FCE7F3', '#DB2777'],
    ['#D1FAE5', '#059669'],
    ['#FEF3C7', '#D97706'],
    ['#FEE2E2', '#DC2626'],
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;
  const [bg, text] = colors[colorIdx];

  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-11 h-11 text-xs';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-poppins font-bold ring-2 ring-[#7C5CFC]/20`}
      style={{ backgroundColor: bg, color: text }}
    >
      {initials}
    </div>
  );
}

export { AvatarFallback };

export const FriendCard: React.FC<{ friend: UserProfile }> = ({ friend }) => {
  const { getBalanceWithUser, currency, currentUser } = useNomi();
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

  // Balance between currentUser and friend (positive = friend owes currentUser, negative = currentUser owes friend)
  const balance = getBalanceWithUser(friend.id);
  const isPositive = balance > 0;
  const isZero = balance === 0;

  return (
    <>
      <div className="p-5 rounded-2xl bg-nomi-surface border border-nomi hover:border-[#7C5CFC]/30 shadow-sm transition-all flex items-center justify-between gap-4">
        <Link href={`/friends/${friend.id}`} className="flex items-center gap-3.5 min-w-0 group flex-1">
          {friend.avatar_url ? (
            <img
              src={friend.avatar_url}
              alt={friend.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-[#7C5CFC]/20 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="group-hover:scale-105 transition-transform">
              <AvatarFallback name={friend.name} size="md" />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-poppins font-bold text-sm text-nomi-main group-hover:text-nomi-primary transition-colors truncate">
              {friend.name}
            </h4>
            <p className="text-xs text-nomi-secondary truncate">{friend.email}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p
              className={`font-poppins font-bold text-sm ${
                isPositive
                  ? 'text-nomi-positive'
                  : isZero
                  ? 'text-nomi-secondary'
                  : 'text-nomi-negative'
              }`}
            >
              {isPositive
                ? `owes you ${formatMoney(balance, currency)}`
                : isZero
                ? 'settled up'
                : `you owe ${formatMoney(Math.abs(balance), currency)}`}
            </p>
          </div>

          {!isZero && (
            <button
              onClick={() => setIsSettleModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-nomi-primary-soft hover:bg-nomi-primary/20 text-nomi-primary text-xs font-poppins font-semibold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settle</span>
            </button>
          )}
        </div>
      </div>

      {isSettleModalOpen && (
        <SettlementModal
          isOpen={isSettleModalOpen}
          onClose={() => setIsSettleModalOpen(false)}
          defaultPayerId={balance < 0 ? currentUser.id : friend.id}
          defaultReceiverId={balance < 0 ? friend.id : currentUser.id}
          defaultAmountMinor={Math.abs(balance)}
        />
      )}
    </>
  );
};

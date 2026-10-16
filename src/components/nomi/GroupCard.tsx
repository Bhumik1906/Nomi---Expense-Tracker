'use client';

import React from 'react';
import Link from 'next/link';
import { Group } from '@/lib/types/nomi';
import { useNomi } from '@/lib/store/nomiStore';
import { formatMoney } from '@/lib/finance/money';
import { Users, ArrowRight, Palmtree, Home } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  palmtree: Palmtree,
  home: Home,
  users: Users,
};

export const GroupCard: React.FC<{ group: Group }> = ({ group }) => {
  const { expenses, currentUser, allUsers } = useNomi();

  const Icon = ICON_MAP[group.icon] || Users;

  // Filter expenses for this group
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const totalGroupExpensesAmount = groupExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Group balance from currentUser perspective
  let userNetInGroup = 0;
  groupExpenses.forEach((exp) => {
    if (exp.paidBy === currentUser.id) {
      const othersSplitSum = exp.splits
        .filter((s) => s.userId !== currentUser.id)
        .reduce((acc, s) => acc + s.amount, 0);
      userNetInGroup += othersSplitSum;
    } else {
      const mySplit = exp.splits.find((s) => s.userId === currentUser.id);
      if (mySplit) {
        userNetInGroup -= mySplit.amount;
      }
    }
  });

  const isPositive = userNetInGroup > 0;
  const isZero = userNetInGroup === 0;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group p-5 rounded-2xl bg-nomi-surface border border-nomi hover:border-[#7C5CFC]/40 shadow-sm transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-nomi-primary-soft text-nomi-primary group-hover:scale-105 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-base text-nomi-main group-hover:text-nomi-primary transition-colors">
                {group.name}
              </h3>
              <p className="text-xs text-nomi-secondary line-clamp-1 mt-0.5">
                {group.description || `${group.members.length} members`}
              </p>
            </div>
          </div>

          <div className="p-2 rounded-full text-nomi-secondary group-hover:text-nomi-primary group-hover:bg-nomi-primary-soft transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Member Avatars */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-nomi">
          <div className="flex -space-x-2 overflow-hidden">
            {group.members.slice(0, 4).map((m) => {
              const user = allUsers[m.userId];
              const name = user?.name || m.userProfile?.name || 'Member';
              const avatarUrl = user?.avatar_url;
              const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
              const colors = [['#EDE9FE','#7C5CFC'],['#E0F2FE','#0284C7'],['#FCE7F3','#DB2777'],['#D1FAE5','#059669'],['#FEF3C7','#D97706'],['#FEE2E2','#DC2626']];
              const [bg, txt] = colors[name.charCodeAt(0) % colors.length];
              return avatarUrl ? (
                <img
                  key={m.userId}
                  src={avatarUrl}
                  alt={name}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-nomi-surface object-cover"
                />
              ) : (
                <div
                  key={m.userId}
                  className="inline-flex h-7 w-7 rounded-full ring-2 ring-nomi-surface items-center justify-center font-bold text-[10px]"
                  style={{ backgroundColor: bg, color: txt }}
                >
                  {initials}
                </div>
              );
            })}
            {group.members.length > 4 && (
              <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-nomi-surface bg-nomi-primary-soft text-nomi-primary text-[10px] font-bold items-center justify-center">
                +{group.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-nomi-secondary font-medium">
            {group.members.length} participants
          </span>
        </div>
      </div>

      {/* Group Balance Footer */}
      <div className="mt-4 pt-3 border-t border-nomi/60 flex items-center justify-between text-xs">
        <span className="text-nomi-secondary">Total: {formatMoney(totalGroupExpensesAmount, group.currency)}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-nomi-secondary">Your balance:</span>
          <span
            className={`font-poppins font-bold text-sm ${
              isPositive
                ? 'text-nomi-positive'
                : isZero
                ? 'text-nomi-secondary'
                : 'text-nomi-negative'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatMoney(userNetInGroup, group.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
};

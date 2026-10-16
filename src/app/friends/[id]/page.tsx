'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/nomi/NavigationHeader';
import { MobileBottomNav } from '@/components/nomi/MobileBottomNav';
import { Footer } from '@/components/nomi/Footer';
import { ExpenseRow } from '@/components/nomi/ExpenseCard';
import { EmptyState } from '@/components/nomi/EmptyState';
import { SettlementModal } from '@/components/nomi/SettlementModal';
import { useNomi } from '@/lib/store/nomiStore';
import { formatMoney } from '@/lib/finance/money';
import { ArrowLeft, CheckCircle2, Plus } from 'lucide-react';
import { ExpenseModal } from '@/components/nomi/ExpenseModal';
import { AvatarFallback } from '@/components/nomi/FriendCard';

export default function FriendDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allUsers, currentUser, expenses, settlements, getBalanceWithUser, currency } = useNomi();

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const friend = allUsers[id];

  if (!friend) {
    return (
      <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main">
        <NavigationHeader />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="font-poppins font-bold text-xl">Friend not found</h2>
            <Link href="/friends" className="text-nomi-primary underline text-sm mt-2 block">
              Back to Friends
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter shared expenses involving currentUser and friend
  const sharedExpenses = expenses.filter(
    (e) =>
      (e.paidBy === currentUser.id && e.splits.some((s) => s.userId === friend.id)) ||
      (e.paidBy === friend.id && e.splits.some((s) => s.userId === currentUser.id))
  );

  // Filter settlements between currentUser and friend
  const sharedSettlements = settlements.filter(
    (s) =>
      (s.payerId === currentUser.id && s.receiverId === friend.id) ||
      (s.payerId === friend.id && s.receiverId === currentUser.id)
  );

  const balance = getBalanceWithUser(friend.id);
  const isPositive = balance > 0;
  const isZero = balance === 0;

  return (
    <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main pb-20 md:pb-0">
      <NavigationHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href="/friends"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-nomi-secondary hover:text-nomi-main transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Friends</span>
        </Link>

        {/* Friend Profile Banner */}
        <div className="p-6 rounded-3xl bg-nomi-surface border border-nomi shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {friend.avatar_url ? (
              <img
                src={friend.avatar_url}
                alt={friend.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[#7C5CFC]/20"
              />
            ) : (
              <AvatarFallback name={friend.name} size="lg" />
            )}
            <div>
              <h1 className="font-poppins font-bold text-2xl text-nomi-main">{friend.name}</h1>
              <p className="text-xs text-nomi-secondary mt-0.5">{friend.email}</p>
              <div className="mt-2 text-xs font-semibold">
                <span
                  className={
                    isPositive
                      ? 'text-nomi-positive'
                      : isZero
                      ? 'text-nomi-secondary'
                      : 'text-nomi-negative'
                  }
                >
                  {isPositive
                    ? `Owes you ${formatMoney(balance, currency)}`
                    : isZero
                    ? 'All settled up'
                    : `You owe ${formatMoney(Math.abs(balance), currency)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isZero && (
              <button
                onClick={() => setIsSettleModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#20A77A] text-white text-xs font-poppins font-semibold shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Settle Up</span>
              </button>
            )}

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#7C5CFC] text-white text-xs font-poppins font-semibold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Shared Expenses */}
        <div className="space-y-4">
          <h2 className="font-poppins font-bold text-lg text-nomi-main">Shared Expenses</h2>
          {sharedExpenses.length === 0 ? (
            <EmptyState
              title="No shared expenses yet"
              description={`Add an expense split with ${friend.name}.`}
              actionText="Add Expense"
              onAction={() => setIsExpenseModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {sharedExpenses.map((exp) => (
                <ExpenseRow key={exp.id} expense={exp} />
              ))}
            </div>
          )}
        </div>

        {/* Settlement History */}
        {sharedSettlements.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-nomi">
            <h2 className="font-poppins font-bold text-lg text-nomi-main">Payment History</h2>
            <div className="space-y-2">
              {sharedSettlements.map((s) => {
                const isUserPayer = s.payerId === currentUser.id;
                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-nomi-surface border border-nomi flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-nomi-positive-soft text-nomi-positive">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-nomi-main">
                          {isUserPayer ? `You paid ${friend.name}` : `${friend.name} paid you`}
                        </p>
                        <p className="text-[11px] text-nomi-secondary mt-0.5">
                          {new Date(s.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {s.notes ? ` • ${s.notes}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-poppins font-bold text-nomi-positive text-sm">
                      {formatMoney(s.amount, s.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {isSettleModalOpen && (
        <SettlementModal
          isOpen={isSettleModalOpen}
          onClose={() => setIsSettleModalOpen(false)}
          defaultPayerId={balance < 0 ? currentUser.id : friend.id}
          defaultReceiverId={balance < 0 ? friend.id : currentUser.id}
          defaultAmountMinor={Math.abs(balance)}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          defaultParticipantIds={[friend.id]}
        />
      )}

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

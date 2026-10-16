'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/nomi/NavigationHeader';
import { MobileBottomNav } from '@/components/nomi/MobileBottomNav';
import { Footer } from '@/components/nomi/Footer';
import { BalanceSummaryCard } from '@/components/nomi/BalanceCard';
import { DebtSimplificationCard } from '@/components/nomi/DebtSimplificationCard';
import { CategoryAnalyticsCard } from '@/components/nomi/CategoryAnalyticsCard';
import { exportExpensesToCSV } from '@/lib/export/exportCsv';
import { ExpenseRow } from '@/components/nomi/ExpenseCard';
import { GroupCard } from '@/components/nomi/GroupCard';
import { FriendCard } from '@/components/nomi/FriendCard';
import { EmptyState } from '@/components/nomi/EmptyState';
import { useNomi } from '@/lib/store/nomiStore';
import { ExpenseModal } from '@/components/nomi/ExpenseModal';
import { SettlementModal } from '@/components/nomi/SettlementModal';
import { AuthGuard } from '@/components/nomi/AuthGuard';
import { ExpenseCategory } from '@/lib/types/nomi';
import { Plus, ArrowRight, FolderKanban, Users, UserPlus, FolderPlus } from 'lucide-react';

const CATEGORIES: (ExpenseCategory | 'All')[] = [
  'All',
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Bills',
  'Transport',
  'Accommodation',
  'General',
];

export default function DashboardPage() {
  const {
    currentUser,
    expenses,
    groups,
    allUsers,
    currency,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useNomi();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [settleModalState, setSettleModalState] = useState<{
    isOpen: boolean;
    payerId?: string;
    receiverId?: string;
    amount?: number;
  }>({ isOpen: false });

  // Filter expenses based on search & category
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const friendsList = Object.values(allUsers).filter((u) => u.id !== currentUser.id);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main pb-20 md:pb-0">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-nomi-main">
              Welcome back, {currentUser.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-nomi-secondary mt-1">
              Here&apos;s what you owe and what friends owe you.
            </p>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white font-poppins font-semibold text-sm shadow-md shadow-[#7C5CFC]/25 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* 1. Net Balance Overview Cards */}
        <BalanceSummaryCard />

        {/* 2. Debt Simplification Recommendations */}
        <DebtSimplificationCard
          onSettleClick={(payerId, receiverId, amount) =>
            setSettleModalState({ isOpen: true, payerId, receiverId, amount })
          }
        />

        {/* 3. Category Spending Breakdown */}
        <CategoryAnalyticsCard />

        {/* Main Content Layout: Expenses (Left 2 cols) & Sidebar (Right 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Expenses Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-poppins font-bold text-lg text-nomi-main">Recent Expenses</h2>
                {expenses.length > 0 && (
                  <button
                    onClick={() => exportExpensesToCSV(expenses, allUsers, 'Nomi_Personal', currency)}
                    className="px-2.5 py-1 rounded-lg border border-nomi text-[11px] font-semibold text-nomi-secondary hover:text-nomi-main transition-colors"
                  >
                    Export CSV
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#7C5CFC] text-white dark:bg-[#9A82FF]'
                        : 'bg-nomi-surface border border-nomi text-nomi-secondary hover:text-nomi-main'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Expense List */}
            {filteredExpenses.length === 0 ? (
              <EmptyState
                title="No expenses yet"
                description="Your expenses will appear here once you add one."
                actionText="Add Expense"
                onAction={() => setIsExpenseModalOpen(true)}
              />
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((exp) => (
                  <ExpenseRow key={exp.id} expense={exp} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column: Groups & Friends */}
          <div className="space-y-6">
            {/* Active Groups */}
            <div className="p-5 rounded-3xl bg-nomi-surface border border-nomi shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-nomi-primary" />
                  <h3 className="font-poppins font-bold text-sm text-nomi-main">Your Groups</h3>
                </div>
                <Link
                  href="/groups"
                  className="text-xs font-semibold text-nomi-primary hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {groups.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-nomi rounded-2xl p-4">
                  <FolderKanban className="w-8 h-8 text-nomi-secondary mx-auto mb-2 opacity-50" />
                  <h4 className="font-poppins font-semibold text-xs text-nomi-main">No groups yet</h4>
                  <p className="text-[11px] text-nomi-secondary mt-0.5">
                    Create a group to start splitting expenses with friends.
                  </p>
                  <Link
                    href="/groups"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-nomi-primary-soft text-nomi-primary text-xs font-semibold"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Create group</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.slice(0, 3).map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </div>

            {/* Friends Quick View */}
            <div className="p-5 rounded-3xl bg-nomi-surface border border-nomi shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-nomi-primary" />
                  <h3 className="font-poppins font-bold text-sm text-nomi-main">Friends</h3>
                </div>
                <Link
                  href="/friends"
                  className="text-xs font-semibold text-nomi-primary hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {friendsList.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-nomi rounded-2xl p-4">
                  <Users className="w-8 h-8 text-nomi-secondary mx-auto mb-2 opacity-50" />
                  <h4 className="font-poppins font-semibold text-xs text-nomi-main">No friends yet</h4>
                  <p className="text-[11px] text-nomi-secondary mt-0.5">
                    Add friends to start sharing expenses.
                  </p>
                  <Link
                    href="/friends"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-nomi-primary-soft text-nomi-primary text-xs font-semibold"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add friend</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {friendsList.slice(0, 3).map((friend) => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <Footer />

      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
        />
      )}

      {settleModalState.isOpen && (
        <SettlementModal
          isOpen={settleModalState.isOpen}
          onClose={() => setSettleModalState({ isOpen: false })}
          defaultPayerId={settleModalState.payerId}
          defaultReceiverId={settleModalState.receiverId}
          defaultAmountMinor={settleModalState.amount}
        />
      )}
      </div>
    </AuthGuard>
  );
}

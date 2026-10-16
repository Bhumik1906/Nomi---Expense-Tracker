'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/nomi/NavigationHeader';
import { MobileBottomNav } from '@/components/nomi/MobileBottomNav';
import { Footer } from '@/components/nomi/Footer';
import { ExpenseRow } from '@/components/nomi/ExpenseCard';
import { EmptyState } from '@/components/nomi/EmptyState';
import { SettlementModal } from '@/components/nomi/SettlementModal';
import { ExpenseModal } from '@/components/nomi/ExpenseModal';
import { useNomi } from '@/lib/store/nomiStore';
import { formatMoney } from '@/lib/finance/money';
import { exportExpensesToCSV } from '@/lib/export/exportCsv';
import { calculateBalances } from '@/lib/finance/calculateBalances';
import { simplifyDebts } from '@/lib/finance/simplifyDebts';
import { ArrowLeft, Plus, CheckCircle2, Users, Sparkles, UserPlus } from 'lucide-react';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { groups, expenses, settlements, currentUser, allUsers, addGroupMember } = useNomi();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedNewMember, setSelectedNewMember] = useState('');

  const group = groups.find((g) => g.id === id);

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main">
        <NavigationHeader />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="font-poppins font-bold text-xl">Group not found</h2>
            <Link href="/groups" className="text-nomi-primary underline text-sm mt-2 block">
              Back to Groups
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Group-specific calculations
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const groupSettlements = settlements.filter((s) => s.groupId === group.id);

  const groupMemberUserIds = group.members.map((m) => m.userId);

  const finExpenses = groupExpenses.map((e) => ({
    id: e.id,
    paidBy: e.paidBy,
    amount: e.amount,
    splitType: e.splitType,
    splits: e.splits.map((s) => ({ userId: s.userId, amount: s.amount })),
  }));

  const finSettlements = groupSettlements.map((s) => ({
    id: s.id,
    payerId: s.payerId,
    receiverId: s.receiverId,
    amount: s.amount,
  }));

  const calc = calculateBalances(finExpenses, finSettlements, groupMemberUserIds);
  const groupUserBalance = calc.netBalanceForUser(currentUser.id);
  const groupSimplifiedDebts = simplifyDebts(calc.userBalances);

  const totalGroupSpending = groupExpenses.reduce((acc, e) => acc + e.amount, 0);

  const nonMembers = Object.values(allUsers).filter(
    (u) => !groupMemberUserIds.includes(u.id)
  );

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewMember) return;
    addGroupMember(group.id, selectedNewMember);
    setSelectedNewMember('');
    setIsAddMemberOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main pb-20 md:pb-0">
      <NavigationHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-nomi-secondary hover:text-nomi-main transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </Link>

        {/* Group Header Card */}
        <div className="p-6 rounded-3xl bg-nomi-surface border border-nomi shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-nomi-primary-soft text-nomi-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-2xl text-nomi-main">{group.name}</h1>
              <p className="text-xs text-nomi-secondary mt-0.5">
                {group.description || `${group.members.length} members`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportExpensesToCSV(groupExpenses, allUsers, group.name, group.currency)}
              className="px-3.5 py-2.5 rounded-xl border border-nomi text-xs font-poppins font-semibold text-nomi-secondary hover:text-nomi-main hover:bg-nomi-bg flex items-center gap-1.5 transition-colors"
              title="Export group expenses to CSV"
            >
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsSettleModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-nomi text-xs font-poppins font-semibold text-nomi-main hover:bg-nomi-bg flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-nomi-positive" />
              <span>Settle Up</span>
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white text-xs font-poppins font-semibold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-nomi-surface border border-nomi">
            <span className="text-xs text-nomi-secondary uppercase tracking-wider font-semibold">
              Your Net Balance in Group
            </span>
            <p
              className={`font-poppins font-bold text-2xl mt-2 ${
                groupUserBalance.netBalance > 0
                  ? 'text-nomi-positive'
                  : groupUserBalance.netBalance === 0
                  ? 'text-nomi-main'
                  : 'text-nomi-negative'
              }`}
            >
              {groupUserBalance.netBalance > 0 ? '+' : ''}
              {formatMoney(groupUserBalance.netBalance, group.currency)}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-nomi-surface border border-nomi">
            <span className="text-xs text-nomi-secondary uppercase tracking-wider font-semibold">
              Total Group Expenses
            </span>
            <p className="font-poppins font-bold text-2xl mt-2 text-nomi-main">
              {formatMoney(totalGroupSpending, group.currency)}
            </p>
          </div>
        </div>

        {/* Group Debt Simplification */}
        {groupSimplifiedDebts.length > 0 && (
          <div className="p-5 rounded-2xl bg-nomi-surface border border-nomi space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-nomi-primary" />
              <h3 className="font-poppins font-semibold text-sm text-nomi-main">
                Group Repayment Recommendations
              </h3>
            </div>
            <div className="space-y-2">
              {groupSimplifiedDebts.map((d, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-nomi-bg text-xs flex items-center justify-between"
                >
                  <span>
                    <strong className="text-nomi-main">
                      {d.payerId === currentUser.id ? 'You' : allUsers[d.payerId]?.name}
                    </strong>{' '}
                    pays{' '}
                    <strong className="text-nomi-main">
                      {d.receiverId === currentUser.id ? 'You' : allUsers[d.receiverId]?.name}
                    </strong>
                  </span>
                  <span className="font-poppins font-bold">{formatMoney(d.amount, group.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Bar */}
        <div className="p-5 rounded-2xl bg-nomi-surface border border-nomi space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-sm text-nomi-main">Group Members</h3>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="text-xs font-semibold text-nomi-primary hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.members.map((m) => {
              const user = allUsers[m.userId];
              const name = user?.name || m.userProfile?.name || 'Member';
              const avatarUrl = user?.avatar_url;
              const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
              const bgColors = ['#EDE9FE','#E0F2FE','#FCE7F3','#D1FAE5','#FEF3C7','#FEE2E2'];
              const txtColors = ['#7C5CFC','#0284C7','#DB2777','#059669','#D97706','#DC2626'];
              const idx = name.charCodeAt(0) % 6;
              return (
                <div
                  key={m.userId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-nomi-bg border border-nomi text-xs font-medium"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px]"
                      style={{ backgroundColor: bgColors[idx], color: txtColors[idx] }}
                    >
                      {initials}
                    </div>
                  )}
                  <span>{m.userId === currentUser.id ? 'You' : name}</span>
                  {m.role === 'admin' && (
                    <span className="text-[10px] text-nomi-primary font-bold">Admin</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Expenses List */}
        <div className="space-y-4">
          <h2 className="font-poppins font-bold text-lg text-nomi-main">Group Expenses</h2>
          {groupExpenses.length === 0 ? (
            <EmptyState
              title="No expenses in group yet"
              description="Add the first expense for this group."
              actionText="Add Expense"
              onAction={() => setIsExpenseModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {groupExpenses.map((exp) => (
                <ExpenseRow key={exp.id} expense={exp} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-nomi-surface border border-nomi rounded-3xl p-6 space-y-4">
            <h3 className="font-poppins font-bold text-base">Add Group Member</h3>
            <form onSubmit={handleAddMemberSubmit} className="space-y-3">
              <select
                value={selectedNewMember}
                onChange={(e) => setSelectedNewMember(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-nomi-bg border border-nomi"
                required
              >
                <option value="">Select person...</option>
                {nonMembers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#7C5CFC] text-white font-bold"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          defaultGroupId={group.id}
          defaultParticipantIds={group.members.map((m) => m.userId)}
        />
      )}

      {isSettleModalOpen && (
        <SettlementModal
          isOpen={isSettleModalOpen}
          onClose={() => setIsSettleModalOpen(false)}
        />
      )}

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

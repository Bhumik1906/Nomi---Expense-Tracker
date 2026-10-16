'use client';

import React, { useState } from 'react';
import { useNomi } from '@/lib/store/nomiStore';
import { Expense } from '@/lib/types/nomi';
import { formatMoney } from '@/lib/finance/money';
import {
  Utensils,
  Plane,
  ShoppingBag,
  Film,
  FileText,
  Bus,
  Building2,
  HelpCircle,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ExpenseModal } from './ExpenseModal';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Food: Utensils,
  Travel: Plane,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Bills: FileText,
  Transport: Bus,
  Accommodation: Building2,
  General: HelpCircle,
};

export const ExpenseRow: React.FC<{ expense: Expense }> = ({ expense }) => {
  const { currentUser, allUsers, deleteExpense } = useNomi();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const Icon = CATEGORY_ICONS[expense.category] || HelpCircle;

  const paidByUser = allUsers[expense.paidBy];
  const isPayer = expense.paidBy === currentUser.id;

  // Find current user's split share
  const mySplit = expense.splits.find((s) => s.userId === currentUser.id);

  // Balance impact calculation for currentUser
  let netImpact = 0;
  let impactText = 'Not involved';
  let isPositive = false;
  let isNegative = false;

  if (isPayer) {
    const othersShareSum = expense.splits
      .filter((s) => s.userId !== currentUser.id)
      .reduce((acc, s) => acc + s.amount, 0);

    netImpact = othersShareSum;
    impactText = netImpact > 0 ? `you lent ${formatMoney(netImpact, expense.currency)}` : 'you paid';
    isPositive = netImpact > 0;
  } else if (mySplit) {
    netImpact = mySplit.amount;
    impactText = `you owe ${formatMoney(netImpact, expense.currency)}`;
    isNegative = true;
  }

  return (
    <>
      <div className="group relative p-4 rounded-2xl bg-nomi-surface border border-nomi hover:border-[#7C5CFC]/30 shadow-sm transition-all flex items-center justify-between gap-4">
        {/* Left: Category Icon & Title Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-nomi-primary-soft text-nomi-primary shrink-0 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h4 className="font-poppins font-semibold text-sm text-nomi-main truncate">
              {expense.title}
            </h4>

            <div className="flex items-center gap-2 text-xs text-nomi-secondary mt-0.5">
              <span>{paidByUser ? (isPayer ? 'You paid' : `${paidByUser.name} paid`) : 'Paid'}</span>
              <span>•</span>
              <span className="font-medium text-nomi-main">
                {formatMoney(expense.amount, expense.currency)}
              </span>
              <span>•</span>
              <span>{expense.date}</span>
            </div>
          </div>
        </div>

        {/* Right: User's Balance Impact & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p
              className={`font-poppins font-bold text-xs sm:text-sm ${
                isPositive
                  ? 'text-nomi-positive'
                  : isNegative
                  ? 'text-nomi-negative'
                  : 'text-nomi-secondary'
              }`}
            >
              {impactText}
            </p>
            <span className="text-[11px] text-nomi-secondary uppercase tracking-wider capitalize">
              {expense.splitType} split
            </span>
          </div>

          {/* Action Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-nomi-secondary hover:text-nomi-main hover:bg-nomi-bg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onMouseLeave={() => setShowMenu(false)}
                className="absolute right-0 mt-1 w-36 bg-nomi-surface border border-nomi rounded-xl shadow-xl z-30 p-1 animate-in fade-in zoom-in-95"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-nomi-main hover:bg-nomi-bg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Expense</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-nomi-negative hover:bg-nomi-negative-soft transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-nomi-surface border border-nomi rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-nomi-negative-soft text-nomi-negative shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-poppins font-bold text-base text-nomi-main">Delete Expense?</h4>
                <p className="text-xs text-nomi-secondary mt-1">
                  <strong className="text-nomi-main">&ldquo;{expense.title}&rdquo;</strong> will be permanently removed
                  and balances will be recalculated. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-nomi">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-nomi text-xs font-semibold text-nomi-secondary hover:bg-nomi-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteExpense(expense.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-nomi-negative hover:bg-red-600 text-white text-xs font-poppins font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <ExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editExpenseId={expense.id}
        />
      )}
    </>
  );
};

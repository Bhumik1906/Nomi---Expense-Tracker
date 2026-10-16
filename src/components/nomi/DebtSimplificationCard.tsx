'use client';

import React from 'react';
import { useNomi } from '@/lib/store/nomiStore';
import { formatMoney } from '@/lib/finance/money';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const DebtSimplificationCard: React.FC<{ onSettleClick?: (payerId: string, receiverId: string, amount: number) => void }> = ({
  onSettleClick,
}) => {
  const { simplifiedDebts, allUsers, currency, currentUser } = useNomi();

  if (!simplifiedDebts.length) {
    return (
      <div className="p-5 rounded-2xl bg-nomi-surface border border-nomi flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-nomi-positive-soft text-nomi-positive shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-poppins font-semibold text-sm text-nomi-main">You&apos;re all settled up.</h4>
            <p className="text-xs text-nomi-secondary mt-0.5">Add an expense with friends to start tracking balances.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-nomi-surface border border-nomi shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7C5CFC] dark:text-[#9A82FF]" />
          <h3 className="font-poppins font-semibold text-sm text-nomi-main">
            Suggested Repayments
          </h3>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-nomi-primary-soft text-nomi-primary">
          {simplifiedDebts.length} {simplifiedDebts.length === 1 ? 'transaction' : 'transactions'}
        </span>
      </div>

      <div className="space-y-3">
        {simplifiedDebts.map((debt, index) => {
          const payer = allUsers[debt.payerId]?.name || 'Member';
          const receiver = allUsers[debt.receiverId]?.name || 'Member';
          const isUserPayer = debt.payerId === currentUser.id;
          const isUserReceiver = debt.receiverId === currentUser.id;

          return (
            <motion.div
              key={`${debt.payerId}-${debt.receiverId}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3.5 rounded-xl bg-nomi-bg border border-nomi flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 text-sm">
                <span
                  className={`font-semibold ${
                    isUserPayer ? 'text-nomi-negative font-bold' : 'text-nomi-main'
                  }`}
                >
                  {isUserPayer ? 'You' : payer}
                </span>

                <div className="flex items-center gap-1 text-nomi-secondary text-xs">
                  <span>pays</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

                <span
                  className={`font-semibold ${
                    isUserReceiver ? 'text-nomi-positive font-bold' : 'text-nomi-main'
                  }`}
                >
                  {isUserReceiver ? 'You' : receiver}
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-poppins font-bold text-sm text-nomi-main">
                  {formatMoney(debt.amount, currency)}
                </span>

                {(isUserPayer || isUserReceiver) && onSettleClick && (
                  <button
                    onClick={() => onSettleClick(debt.payerId, debt.receiverId, debt.amount)}
                    className="px-3 py-1.5 rounded-lg bg-nomi-primary-soft hover:bg-nomi-primary/20 text-nomi-primary text-xs font-semibold transition-colors"
                  >
                    Settle
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

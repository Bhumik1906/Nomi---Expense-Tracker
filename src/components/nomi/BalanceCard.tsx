'use client';

import React from 'react';
import { useNomi } from '@/lib/store/nomiStore';
import { formatMoney } from '@/lib/finance/money';
import { ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export const BalanceSummaryCard: React.FC = () => {
  const { netBalance, totalOwed, totalOwes, currency } = useNomi();

  const isNetPositive = netBalance > 0;
  const isNetZero = netBalance === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {/* Net Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-5 rounded-2xl bg-nomi-surface border border-nomi shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-nomi-secondary text-xs font-semibold uppercase tracking-wider">
          <span>Total Net Balance</span>
          <div className="p-2 rounded-xl bg-nomi-primary-soft text-nomi-primary">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p
            className={`font-poppins font-bold text-2xl sm:text-3xl tracking-tight ${
              isNetPositive
                ? 'text-nomi-positive'
                : isNetZero
                ? 'text-nomi-main'
                : 'text-nomi-negative'
            }`}
          >
            {isNetPositive ? '+' : ''}
            {formatMoney(netBalance, currency)}
          </p>
          <p className="text-xs text-nomi-secondary mt-1">
            {isNetPositive
              ? 'Overall, you are owed money'
              : isNetZero
              ? 'All settled up cleanly'
              : 'Overall, you owe money'}
          </p>
        </div>
      </motion.div>

      {/* You Owe Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="p-5 rounded-2xl bg-nomi-surface border border-nomi shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-nomi-secondary text-xs font-semibold uppercase tracking-wider">
          <span>You Owe</span>
          <div className="p-2 rounded-xl bg-nomi-negative-soft text-nomi-negative">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-poppins font-bold text-2xl sm:text-3xl tracking-tight text-nomi-negative">
            {formatMoney(totalOwes, currency)}
          </p>
          <p className="text-xs text-nomi-secondary mt-1">Total pending to friends</p>
        </div>
      </motion.div>

      {/* You Are Owed Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="p-5 rounded-2xl bg-nomi-surface border border-nomi shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-nomi-secondary text-xs font-semibold uppercase tracking-wider">
          <span>You Are Owed</span>
          <div className="p-2 rounded-xl bg-nomi-positive-soft text-nomi-positive">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-poppins font-bold text-2xl sm:text-3xl tracking-tight text-nomi-positive">
            {formatMoney(totalOwed, currency)}
          </p>
          <p className="text-xs text-nomi-secondary mt-1">Friends will pay you back</p>
        </div>
      </motion.div>
    </div>
  );
};

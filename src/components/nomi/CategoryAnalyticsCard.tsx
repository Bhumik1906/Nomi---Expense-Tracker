'use client';

import React from 'react';
import { useNomi } from '@/lib/store/nomiStore';
import { ExpenseCategory } from '@/lib/types/nomi';
import { formatMoney } from '@/lib/finance/money';
import {
  Utensils,
  Plane,
  ShoppingBag,
  Film,
  FileText,
  Car,
  Home,
  Tag,
  PieChart as PieChartIcon,
} from 'lucide-react';

const CATEGORY_COLORS: Record<ExpenseCategory, { bar: string; badge: string; text: string }> = {
  Food: { bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', text: 'text-amber-500' },
  Travel: { bar: 'bg-sky-500', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', text: 'text-sky-500' },
  Shopping: { bar: 'bg-pink-500', badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', text: 'text-pink-500' },
  Entertainment: { bar: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', text: 'text-purple-500' },
  Bills: { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-500' },
  Transport: { bar: 'bg-indigo-500', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-500' },
  Accommodation: { bar: 'bg-teal-500', badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', text: 'text-teal-500' },
  General: { bar: 'bg-slate-500', badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', text: 'text-slate-500' },
};

const CATEGORY_ICONS: Record<ExpenseCategory, React.ComponentType<{ className?: string }>> = {
  Food: Utensils,
  Travel: Plane,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Bills: FileText,
  Transport: Car,
  Accommodation: Home,
  General: Tag,
};

export function CategoryAnalyticsCard() {
  const { expenses, currency } = useNomi();

  // Aggregate category totals in minor units
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'General';
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Sorted list of categories by spent amount
  const sortedCategories = (Object.keys(categoryTotals) as ExpenseCategory[])
    .map((cat) => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: totalSpent > 0 ? (categoryTotals[cat] / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-nomi-surface border border-nomi shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#7C5CFC]/10 text-[#7C5CFC] dark:text-[#9A82FF]">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-base text-nomi-main">Spending Breakdown</h3>
            <p className="text-xs text-nomi-secondary">Total tracked across all expenses</p>
          </div>
        </div>

        <span className="font-poppins font-bold text-sm text-nomi-main">
          {formatMoney(totalSpent, currency)}
        </span>
      </div>

      {/* Multi-segment stacked progress bar */}
      <div className="h-3 w-full rounded-full bg-nomi-bg overflow-hidden flex">
        {sortedCategories.map(({ category, percentage }) => {
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;
          return (
            <div
              key={category}
              style={{ width: `${percentage}%` }}
              className={`h-full ${colors.bar} transition-all duration-500`}
              title={`${category}: ${percentage.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Category breakdown rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {sortedCategories.slice(0, 6).map(({ category, amount, percentage }) => {
          const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.General;
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;

          return (
            <div
              key={category}
              className="flex items-center justify-between p-3 rounded-2xl bg-nomi-bg/60 border border-nomi/60 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${colors.badge}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-nomi-main block">{category}</span>
                  <span className="text-[10px] text-nomi-secondary">{percentage.toFixed(1)}%</span>
                </div>
              </div>

              <span className="font-poppins font-bold text-nomi-main">
                {formatMoney(amount, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

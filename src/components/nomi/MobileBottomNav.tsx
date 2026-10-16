'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FolderKanban, Activity, Plus } from 'lucide-react';
import { ExpenseModal } from './ExpenseModal';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Friends', href: '/friends', icon: Users },
    { label: 'Groups', href: '/groups', icon: FolderKanban },
    { label: 'Activity', href: '/activity', icon: Activity },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-nomi-surface/90 backdrop-blur-lg border-t border-nomi px-4 py-2 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-nomi-primary font-bold' : 'text-nomi-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Elevated Center Add Button */}
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="-mt-6 w-12 h-12 rounded-full bg-[#7C5CFC] dark:bg-[#9A82FF] text-white flex items-center justify-center shadow-lg shadow-[#7C5CFC]/40 active:scale-95 transition-transform"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-nomi-primary font-bold' : 'text-nomi-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </>
  );
};

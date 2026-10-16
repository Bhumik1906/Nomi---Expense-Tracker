'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NomiLogo } from './NomiLogo';
import { useNomi } from '@/lib/store/nomiStore';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Activity,
  Settings,
  Plus,
  Search,
  Bell,
  Check,
} from 'lucide-react';
import { ExpenseModal } from './ExpenseModal';

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
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
  const [bg, text] = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === 'md' ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-poppins font-bold ring-2 ring-[#7C5CFC]/30 shrink-0`}
      style={{ backgroundColor: bg, color: text }}
      title={name}
    >
      {initials}
    </div>
  );
}

export const NavigationHeader: React.FC = () => {
  const pathname = usePathname();
  const {
    currentUser,
    notifications,
    markNotificationRead,
    searchQuery,
    setSearchQuery,
  } = useNomi();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Friends', href: '/friends', icon: Users },
    { label: 'Groups', href: '/groups', icon: FolderKanban },
    { label: 'Activity', href: '/activity', icon: Activity },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-nomi-surface/80 backdrop-blur-md border-b border-nomi transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <NomiLogo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-nomi-primary-soft text-nomi-primary font-semibold'
                        : 'text-nomi-secondary hover:text-nomi-main hover:bg-nomi-bg'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Search Input Bar */}
            <div className="relative">
              {showSearchInput ? (
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-nomi-secondary pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search expenses, groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onBlur={() => !searchQuery && setShowSearchInput(false)}
                    className="pl-9 pr-4 py-1.5 text-sm rounded-full bg-nomi-bg border border-nomi focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] w-48 sm:w-64 transition-all"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 rounded-full text-nomi-secondary hover:text-nomi-main hover:bg-nomi-bg transition-colors"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>



            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-nomi-secondary hover:text-nomi-main hover:bg-nomi-bg transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E0525D] ring-2 ring-white dark:ring-[#17151C]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-nomi-surface border border-nomi rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-nomi">
                    <h3 className="font-poppins font-semibold text-sm text-nomi-main">Notifications</h3>
                    <span className="text-xs text-nomi-secondary">{unreadCount} unread</span>
                  </div>

                  <div className="divide-y divide-nomi max-h-72 overflow-y-auto py-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-nomi-secondary text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`py-3 px-2 rounded-lg transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            !n.isRead ? 'bg-nomi-primary-soft/40' : 'hover:bg-nomi-bg'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-semibold text-nomi-main">{n.title}</p>
                            <p className="text-xs text-nomi-secondary mt-0.5">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationRead(n.id);
                              }}
                              className="text-nomi-primary p-1 hover:bg-nomi-primary-soft rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button: + Add Expense */}
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] dark:hover:bg-[#896DFD] text-white font-poppins font-semibold text-sm shadow-md shadow-[#7C5CFC]/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </button>

            {/* User Avatar — links to settings */}
            <Link href="/settings" title={`Signed in as ${currentUser.name}`}>
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#7C5CFC]/30 hover:ring-[#7C5CFC] transition-all"
                />
              ) : (
                <UserAvatar name={currentUser.name} size="sm" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </>
  );
};

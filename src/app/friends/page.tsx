'use client';

import React, { useState } from 'react';
import { NavigationHeader } from '@/components/nomi/NavigationHeader';
import { MobileBottomNav } from '@/components/nomi/MobileBottomNav';
import { Footer } from '@/components/nomi/Footer';
import { FriendCard } from '@/components/nomi/FriendCard';
import { EmptyState } from '@/components/nomi/EmptyState';
import { useNomi } from '@/lib/store/nomiStore';
import { AuthGuard } from '@/components/nomi/AuthGuard';
import { UserPlus, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FriendsPage() {
  const { allUsers, currentUser, addFriend } = useNomi();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const friends = Object.values(allUsers).filter((u) => u.id !== currentUser.id);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;
    addFriend(friendName.trim());
    setFriendName('');
    setIsAddModalOpen(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main pb-20 md:pb-0">
      <NavigationHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-nomi-main">Friends</h1>
            <p className="text-xs sm:text-sm text-nomi-secondary mt-1">
              Manage your friends and track non-group balances.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white font-poppins font-semibold text-sm shadow-md shadow-[#7C5CFC]/25 transition-all active:scale-95 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        </div>

        {/* Search */}
        {friends.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-nomi-secondary" />
            <input
              type="text"
              placeholder="Search friends by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-nomi-surface border border-nomi focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
            />
          </div>
        )}

        {/* Friends Grid */}
        {filteredFriends.length === 0 ? (
          <EmptyState
            title={searchFilter ? 'No friends match your search' : 'No friends yet'}
            description={
              searchFilter
                ? 'Try a different name.'
                : 'Add friends to start sharing expenses. You can also add people directly when creating an expense.'
            }
            actionText={searchFilter ? undefined : 'Add a Friend'}
            onAction={searchFilter ? undefined : () => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}
      </main>

      {/* Add Friend Modal — name only */}
      {isAddModalOpen && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-nomi-surface border border-nomi rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-poppins font-bold text-lg text-nomi-main">Add Friend</h3>
                  <p className="text-[11px] text-nomi-secondary mt-0.5">
                    Just their name is enough to get started.
                  </p>
                </div>
                <button
                  onClick={() => { setIsAddModalOpen(false); setFriendName(''); }}
                  className="p-2 rounded-full text-nomi-secondary hover:bg-nomi-bg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFriend} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                    Friend&apos;s Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya, Alex"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                    autoFocus
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setFriendName(''); }}
                    className="px-4 py-2 rounded-xl border border-nomi text-xs font-semibold text-nomi-secondary hover:bg-nomi-bg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7C5CFC] text-white text-xs font-poppins font-semibold shadow-md"
                  >
                    Add Friend
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      <MobileBottomNav />
      <Footer />
      </div>
    </AuthGuard>
  );
}

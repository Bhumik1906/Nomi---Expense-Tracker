'use client';

import React, { useState } from 'react';
import { NavigationHeader } from '@/components/nomi/NavigationHeader';
import { MobileBottomNav } from '@/components/nomi/MobileBottomNav';
import { Footer } from '@/components/nomi/Footer';
import { GroupCard } from '@/components/nomi/GroupCard';
import { EmptyState } from '@/components/nomi/EmptyState';
import { useNomi } from '@/lib/store/nomiStore';
import { AuthGuard } from '@/components/nomi/AuthGuard';
import { FolderPlus, X, Check, Users, Home, Palmtree } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GroupsPage() {
  const { groups, createGroup, allUsers, currentUser } = useNomi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('users');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const friendList = Object.values(allUsers).filter((u) => u.id !== currentUser.id);

  const toggleMember = (uId: string) => {
    if (selectedMembers.includes(uId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== uId));
    } else {
      setSelectedMembers([...selectedMembers, uId]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    createGroup({
      name: groupName.trim(),
      description: description.trim(),
      icon: selectedIcon,
      memberUserIds: selectedMembers,
    });

    setGroupName('');
    setDescription('');
    setSelectedMembers([]);
    setIsModalOpen(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main pb-20 md:pb-0">
      <NavigationHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-nomi-main">Groups</h1>
            <p className="text-xs sm:text-sm text-nomi-secondary mt-1">
              Organize shared expenses with roommates, trips, and friends.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7C5CFC] hover:bg-[#6B49F7] dark:bg-[#9A82FF] text-white font-poppins font-semibold text-sm shadow-md shadow-[#7C5CFC]/25 transition-all active:scale-95 self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <EmptyState
            title="Start your first group"
            description="Create a group to track shared apartment, vacation, or trip expenses."
            actionText="Create Group"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {isModalOpen && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-nomi-surface border border-nomi rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-nomi pb-3">
                <h3 className="font-poppins font-bold text-lg text-nomi-main">Create New Group</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-nomi-secondary hover:bg-nomi-bg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                    Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Goa Vacation, Apartment 402"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of the group..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                  />
                </div>

                {/* Group Icon Selector */}
                <div>
                  <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                    Group Icon
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { id: 'users', label: 'Friends', icon: Users },
                      { id: 'home', label: 'Home', icon: Home },
                      { id: 'palmtree', label: 'Trip', icon: Palmtree },
                    ].map(({ id, label, icon: IconComponent }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedIcon(id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          selectedIcon === id
                            ? 'border-[#7C5CFC] bg-nomi-primary-soft text-nomi-primary font-bold'
                            : 'border-nomi bg-nomi-bg text-nomi-secondary hover:text-nomi-main'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Members Selector */}
                <div>
                  <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-2">
                    Add Members ({selectedMembers.length + 1} including you)
                  </label>

                  {friendList.length === 0 ? (
                    <div className="py-4 text-center border border-dashed border-nomi rounded-xl">
                      <p className="text-xs text-nomi-secondary">
                        No friends yet.{' '}
                        <span className="text-nomi-primary font-semibold">Add friends first</span>{' '}
                        to include them in groups.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {friendList.map((friend) => {
                        const isChecked = selectedMembers.includes(friend.id);
                        const initials = friend.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
                        const colors = [['#EDE9FE','#7C5CFC'],['#E0F2FE','#0284C7'],['#FCE7F3','#DB2777'],['#D1FAE5','#059669'],['#FEF3C7','#D97706'],['#FEE2E2','#DC2626']];
                        const [bg, txt] = colors[friend.name.charCodeAt(0) % colors.length];
                        return (
                          <div
                            key={friend.id}
                            onClick={() => toggleMember(friend.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-sm transition-all cursor-pointer ${
                              isChecked
                                ? 'border-[#7C5CFC]/40 bg-nomi-primary-soft/30'
                                : 'border-nomi bg-nomi-bg opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {friend.avatar_url ? (
                                <img
                                  src={friend.avatar_url}
                                  alt={friend.name}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]"
                                  style={{ backgroundColor: bg, color: txt }}
                                >
                                  {initials}
                                </div>
                              )}
                              <span className="font-medium text-nomi-main">{friend.name}</span>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isChecked
                                  ? 'bg-[#7C5CFC] border-[#7C5CFC] text-white'
                                  : 'border-nomi bg-nomi-surface'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-nomi flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-nomi text-xs font-semibold text-nomi-secondary hover:bg-nomi-bg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7C5CFC] text-white text-xs font-poppins font-semibold shadow-md"
                  >
                    Create Group
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

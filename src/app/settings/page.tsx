'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/nomi/NavigationHeader';
import { MobileBottomNav } from '@/components/nomi/MobileBottomNav';
import { Footer } from '@/components/nomi/Footer';
import { useNomi } from '@/lib/store/nomiStore';
import { AuthGuard } from '@/components/nomi/AuthGuard';
import { Currency, CURRENCIES } from '@/lib/finance/types';
import { Globe, User, LogOut, Check } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, updateUserProfile, currency, setCurrency, logoutUser } = useNomi();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync form when currentUser changes (e.g. after save)
  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
  }, [currentUser.name, currentUser.email]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main pb-20 md:pb-0">
      <NavigationHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-nomi-main">Settings</h1>
          <p className="text-xs sm:text-sm text-nomi-secondary mt-1">
            Manage your Nomi profile, preferred currency, theme, and security.
          </p>
        </div>

        {/* Profile Settings */}
        <div className="p-6 rounded-3xl bg-nomi-surface border border-nomi shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-nomi">
            <User className="w-5 h-5 text-nomi-primary" />
            <h2 className="font-poppins font-bold text-base text-nomi-main">Profile Details</h2>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-nomi-positive-soft text-nomi-positive text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#7C5CFC] text-white text-xs font-poppins font-semibold shadow-md active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Currency Preference */}
        <div className="p-6 rounded-3xl bg-nomi-surface border border-nomi shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-nomi">
            <Globe className="w-5 h-5 text-nomi-primary" />
            <h2 className="font-poppins font-bold text-base text-nomi-main">Preferred Currency</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(CURRENCIES).map((curr) => {
              const isSelected = currency === curr.code;
              return (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code as Currency)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                    isSelected
                      ? 'border-[#7C5CFC] bg-nomi-primary-soft text-nomi-primary font-bold shadow-sm'
                      : 'border-nomi bg-nomi-bg text-nomi-secondary hover:text-nomi-main'
                  }`}
                >
                  <span className="font-poppins text-lg">{curr.symbol}</span>
                  <div>
                    <p className="text-xs font-bold">{curr.code}</p>
                    <p className="text-[10px] opacity-80 truncate">{curr.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>



        {/* Logout */}
        <div className="p-6 rounded-3xl bg-nomi-surface border border-nomi shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-poppins font-bold text-sm text-nomi-main">Sign Out</h3>
            <p className="text-xs text-nomi-secondary">Log out of your current Nomi session.</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-nomi-negative-soft text-nomi-negative text-xs font-poppins font-semibold hover:bg-nomi-negative/20 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </main>

      <MobileBottomNav />
      <Footer />
      </div>
    </AuthGuard>
  );
}

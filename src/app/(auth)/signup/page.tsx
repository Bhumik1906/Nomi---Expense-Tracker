'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NomiLogo } from '@/components/nomi/NomiLogo';
import { NomiOrbit } from '@/components/nomi/NomiOrbit';
import { useNomi } from '@/lib/store/nomiStore';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { UserProfile } from '@/lib/types/nomi';

export default function SignupPage() {
  const router = useRouter();
  const { loginUser } = useNomi();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const userId = `u-${email.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}`;

    const newUser: UserProfile = {
      id: userId,
      name: name.trim(),
      email: email.trim(),
      avatar_url: null,
      preferred_currency: 'INR',
      theme: 'system',
      created_at: new Date().toISOString(),
    };

    loginUser(newUser, {
      groups: [],
      expenses: [],
      settlements: [],
      activityLogs: [],
      notifications: [],
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nomi-bg p-4 relative overflow-hidden">
      {/* Background Nomi Orbit */}
      <div className="absolute opacity-30 pointer-events-none scale-125">
        <NomiOrbit size="lg" />
      </div>

      <div className="w-full max-w-md bg-nomi-surface/90 backdrop-blur-xl border border-nomi rounded-3xl shadow-2xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <NomiLogo size="lg" />
          <h1 className="font-poppins font-bold text-2xl text-nomi-main pt-2">Create your account</h1>
          <p className="text-xs text-nomi-secondary">Money between friends, without the awkwardness.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-nomi-negative-soft text-nomi-negative text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-nomi-secondary" />
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-nomi-secondary" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nomi-secondary uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-nomi-secondary" />
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-nomi-bg border border-nomi text-sm text-nomi-main focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#7C5CFC] hover:bg-[#6B49F7] text-white font-poppins font-bold text-sm shadow-lg shadow-[#7C5CFC]/25 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-nomi-secondary pt-2">
          <span>Already have an account? </span>
          <Link href="/login" className="text-nomi-primary font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

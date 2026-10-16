import React from 'react';
import Link from 'next/link';
import { NomiLogo } from './NomiLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-nomi-surface border-t border-nomi py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <NomiLogo size="sm" />
          <span className="text-xs text-nomi-secondary border-l border-nomi pl-3">
            Money between friends, without the awkwardness.
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-nomi-secondary">
          <Link href="/dashboard" className="hover:text-nomi-main transition-colors">
            Dashboard
          </Link>
          <Link href="/friends" className="hover:text-nomi-main transition-colors">
            Friends
          </Link>
          <Link href="/groups" className="hover:text-nomi-main transition-colors">
            Groups
          </Link>
          <Link href="/settings" className="hover:text-nomi-main transition-colors">
            Settings
          </Link>
        </div>

        {/* Copyright & User Name as strictly mandated */}
        <div className="text-xs text-nomi-secondary flex items-center gap-2">
          <span>© {new Date().getFullYear()} nomi.</span>
          <span>•</span>
          <span>Bhumik</span>
        </div>
      </div>
    </footer>
  );
};

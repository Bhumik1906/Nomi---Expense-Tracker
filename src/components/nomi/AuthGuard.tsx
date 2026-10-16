'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNomi } from '@/lib/store/nomiStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoaded } = useNomi();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoaded, isAuthenticated, router]);

  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nomi-bg text-nomi-main">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7C5CFC] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

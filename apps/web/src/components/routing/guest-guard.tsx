'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AuthSkeletonLoader } from '@/components/common/AuthSkeletonLoader';
import { BrandLoader } from '@/components/common/BrandLoader';
import { paths } from '@/constants/paths';
import { useAuth } from '@/hooks/use-auth';

export function GuestGuard({ children }: Readonly<{ children: ReactNode }>) {
  const { hasBootstrapped, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (hasBootstrapped && isAuthenticated) {
      const requested = searchParams.get('returnTo');
      router.replace(requested?.startsWith('/') ? requested : paths.home);
    }
  }, [hasBootstrapped, isAuthenticated, router, searchParams]);

  // Brand loader while the bootstrap is in flight — the app does not yet know
  // which layout it is about to render. Afterwards, the auth skeleton (not the
  // app-shell one): this guard only ever wraps signed-out routes, so showing the
  // authenticated sidebar+feed here rendered a logged-in app the visitor does
  // not have. Matches `(auth)/loading.tsx`.
  if (!hasBootstrapped) return <BrandLoader fullScreen />;
  if (isAuthenticated) return <AuthSkeletonLoader />;
  return children;
}

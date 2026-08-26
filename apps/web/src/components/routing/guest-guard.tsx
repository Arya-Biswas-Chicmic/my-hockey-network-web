'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';
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

  if (!hasBootstrapped || isAuthenticated) return <FullAppSkeletonLoader />;
  return children;
}

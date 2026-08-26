'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';
import { paths } from '@/constants/paths';
import { useAuth } from '@/hooks/use-auth';

export function AuthenticatedGuard({ children }: Readonly<{ children: ReactNode }>) {
  const { hasBootstrapped, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hasBootstrapped && !isAuthenticated) {
      const returnTo = encodeURIComponent(pathname);
      router.replace(`${paths.auth.onboarding}?returnTo=${returnTo}`);
    }
  }, [hasBootstrapped, isAuthenticated, pathname, router]);

  if (!hasBootstrapped || !isAuthenticated) return <FullAppSkeletonLoader />;
  return children;
}

'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { BrandLoader } from '@/components/common/BrandLoader';
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

  // Two distinct waits, two distinct placeholders. Before the bootstrap
  // resolves the app does not yet know whether this visitor is signed in, so no
  // route-shaped skeleton would be honest — show the brand loader. Once it is
  // known they are authenticated (mid-redirect, or rendering), the app shell is
  // what loads next, so shimmer that.
  if (!hasBootstrapped) return <BrandLoader fullScreen />;
  if (!isAuthenticated) return <FullAppSkeletonLoader />;
  return children;
}

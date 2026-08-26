'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isMinorPlayerUser } from '@my-hockey-network/domain';

import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';
import { paths } from '@/constants/paths';
import { useAuth } from '@/hooks/use-auth';

export function MinorPlayerGuard({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth();
  const router = useRouter();
  const isMinorPlayer = isMinorPlayerUser(user);

  useEffect(() => {
    if (user && !isMinorPlayer) router.replace(paths.profile);
  }, [isMinorPlayer, router, user]);

  if (!isMinorPlayer) return <FullAppSkeletonLoader />;
  return children;
}

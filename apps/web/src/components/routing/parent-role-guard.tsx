'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isParentUser } from '@my-hockey-network/domain';

import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';
import { paths } from '@/constants/paths';
import { useAuth } from '@/hooks/use-auth';

export function ParentRoleGuard({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth();
  const router = useRouter();
  const isParent = isParentUser(user);

  useEffect(() => {
    if (user && !isParent) router.replace(paths.home);
  }, [isParent, router, user]);

  if (!isParent) return <FullAppSkeletonLoader />;
  return children;
}

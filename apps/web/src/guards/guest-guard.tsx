import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';
import { paths } from '@/constants/paths';

export function GuestGuard({ children }: Readonly<{ children?: ReactNode }>) {
  const { isAuthenticated, isLoading, hasBootstrapped, user } = useAuth();

  if (isLoading || !hasBootstrapped) {
    return <FullAppSkeletonLoader />;
  }
  const hasCompletedOnboarding = Boolean(user?.onboardingCompletedAt);

  if (isAuthenticated && hasCompletedOnboarding) {
    return <Navigate replace to={paths.home} />;
  }
  return children ? <>{children}</> : <Outlet />;
}

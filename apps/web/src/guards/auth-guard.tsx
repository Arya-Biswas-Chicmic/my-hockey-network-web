import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';
import { paths } from '@/constants/paths';

export function AuthGuard({ children }: Readonly<{ children?: ReactNode }>) {
  const { isAuthenticated, isLoading, hasBootstrapped, user } = useAuth();
  const location = useLocation();

  if (isLoading || !hasBootstrapped) {
    return <FullAppSkeletonLoader />;
  }
  if (!isAuthenticated || !user) {
    return <Navigate replace to={paths.auth.onboarding} state={{ next: location.pathname }} />;
  }
  const hasCompletedOnboarding = Boolean(user.onboardingCompletedAt);

  if (!hasCompletedOnboarding && !location.pathname.startsWith('/guardian') && !location.pathname.startsWith('/sent')) {
    return <Navigate replace to={paths.auth.onboarding} />;
  }

  return children ? <>{children}</> : <Outlet />;
}

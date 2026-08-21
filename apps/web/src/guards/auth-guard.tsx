import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Spinner } from '../components/common/Spinner';
import { paths } from '../constants/paths';

export function AuthGuard({ children }: Readonly<{ children?: ReactNode }>) {
  const { isAuthenticated, isLoading, hasBootstrapped, user } = useAuth();
  const location = useLocation();

  if (isLoading || !hasBootstrapped) {
    return <div className="route-loader"><Spinner size="lg" color="#0B66C2" /></div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate replace to={paths.auth.onboarding} state={{ next: location.pathname }} />;
  }
  if (!user.onboardingCompletedAt && !location.pathname.startsWith('/guardian') && !location.pathname.startsWith('/sent')) {
    return <Navigate replace to={paths.auth.onboarding} />;
  }
  return children ? <>{children}</> : <Outlet />;
}

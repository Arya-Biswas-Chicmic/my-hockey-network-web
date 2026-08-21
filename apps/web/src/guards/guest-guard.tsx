import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Spinner } from '../components/common/Spinner';
import { paths } from '../constants/paths';

export function GuestGuard({ children }: Readonly<{ children?: ReactNode }>) {
  const { isAuthenticated, isLoading, hasBootstrapped, user } = useAuth();

  if (isLoading || !hasBootstrapped) {
    return <div className="route-loader"><Spinner size="lg" color="#0B66C2" /></div>;
  }
  if (isAuthenticated && user?.onboardingCompletedAt) {
    return <Navigate replace to={paths.home} />;
  }
  return children ? <>{children}</> : <Outlet />;
}

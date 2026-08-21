import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAnyRole } from '@my-hockey-network/domain';
import type { UserRole } from '@my-hockey-network/contracts';
import { useAuth } from '../hooks/use-auth';
import { Spinner } from '../components/common/Spinner';
import { paths } from '../constants/paths';

export interface RoleGuardProps {
  children?: ReactNode;
  allowedRoles: readonly (UserRole | string)[];
}

export function RoleGuard({
  children,
  allowedRoles,
}: Readonly<RoleGuardProps>) {
  const { user, isLoading, hasBootstrapped } = useAuth();

  if (isLoading || !hasBootstrapped) {
    return <div className="route-loader"><Spinner size="lg" color="#0B66C2" /></div>;
  }
  if (!hasAnyRole(user, allowedRoles)) {
    return <Navigate replace to={paths.home} />;
  }
  return children ? <>{children}</> : <Outlet />;
}

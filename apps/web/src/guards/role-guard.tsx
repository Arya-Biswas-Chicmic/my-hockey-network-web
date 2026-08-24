import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAnyRole } from '@my-hockey-network/domain';
import type { UserRole } from '@my-hockey-network/contracts';
import { useAuth } from '../hooks/use-auth';
import { FullAppSkeletonLoader } from '../components/common/FullAppSkeletonLoader';
import { paths } from '../constants/paths';

export interface RoleGuardProps {
  children?: ReactNode;
  allowedRoles: readonly (UserRole | string)[];
}

export function RoleGuard({
  children,
  allowedRoles,
}: Readonly<RoleGuardProps>) {
  const { user, isLoading, hasBootstrapped, showToast } = useAuth();

  if (isLoading || !hasBootstrapped) {
    return <FullAppSkeletonLoader />;
  }
  if (!hasAnyRole(user, allowedRoles)) {
    showToast('Supervision is only available for Parent / Guardian accounts.', 'info');
    return <Navigate replace to={paths.home} />;
  }
  return children ? <>{children}</> : <Outlet />;
}

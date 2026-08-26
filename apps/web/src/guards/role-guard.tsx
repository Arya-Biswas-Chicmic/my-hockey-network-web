import { useEffect, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAnyRole } from '@my-hockey-network/domain';
import type { UserRole } from '@my-hockey-network/contracts';
import { ERROR_MESSAGES } from '@my-hockey-network/constants';
import { useAuth } from '@/hooks/use-auth';
import { FullAppSkeletonLoader } from '@/components/common/FullAppSkeletonLoader';
import { paths } from '@/constants/paths';
import { showToast } from '@/utils/toast';

export interface RoleGuardProps {
  children?: ReactNode;
  allowedRoles: readonly (UserRole | string)[];
}

export function RoleGuard({
  children,
  allowedRoles,
}: Readonly<RoleGuardProps>) {
  const { user, isLoading, hasBootstrapped } = useAuth();
  const isReady = !isLoading && hasBootstrapped;
  const isDenied = isReady && !hasAnyRole(user, allowedRoles);

  useEffect(() => {
    if (isDenied) showToast({ message: ERROR_MESSAGES.PARENT_ONLY_SUPERVISION, type: 'info' });
  }, [isDenied]);

  if (!isReady) {
    return <FullAppSkeletonLoader />;
  }
  if (isDenied) {
    return <Navigate replace to={paths.home} />;
  }

  return children ? <>{children}</> : <Outlet />;
}

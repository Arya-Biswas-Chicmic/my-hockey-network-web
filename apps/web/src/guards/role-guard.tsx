import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { UserRole } from '../enums/role';
import { AppRoute } from '../enums/routes';
import { Spinner } from '../components/common/Spinner';

export interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[] | string[];
  redirectTo?: AppRoute;
  deniedToastMessage?: string;
  onAccessDenied?: (message: string, redirectRoute: AppRoute) => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = AppRoute.HOME,
  deniedToastMessage = 'Supervision access is available only to parent accounts.',
  onAccessDenied,
}) => {
  const { user, isLoading } = useAuth();

  const userRole = (
    user?.primaryRole ||
    (user as any)?.profile?.type ||
    (user as any)?.profile?.primaryRole ||
    'PLAYER'
  ).toUpperCase();

  const isAuthorized = allowedRoles.some(
    (role) => role.toUpperCase() === userRole
  );

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      if (onAccessDenied) {
        onAccessDenied(deniedToastMessage, redirectTo);
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mhn:toast', {
            detail: { message: deniedToastMessage, type: 'error' },
          })
        );
      }
    }
  }, [isLoading, isAuthorized, deniedToastMessage, redirectTo, onAccessDenied]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" color="#0B66C2" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

import React from 'react';
import { RoleGuard, RoleGuardProps } from '../guards/role-guard';
import { UserRole } from '../enums/role';

export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[] | string[],
  options?: Omit<RoleGuardProps, 'children' | 'allowedRoles'>
): React.FC<P> {
  return function WithRoleGuardWrapper(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} {...options}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

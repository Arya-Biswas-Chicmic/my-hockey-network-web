import { UserRoleEnum, type AuthMeResponse, type UserRole } from '@my-hockey-network/contracts';

export * from './permissions/feedPermissions';

export function getPrimaryRole(user: AuthMeResponse | null): string | null {
  return user?.primaryRole ?? user?.profile?.type ?? null;
}

export function hasAnyRole(user: AuthMeResponse | null, allowedRoles: readonly (UserRole | string)[]): boolean {
  if (!user) return false;
  const assignedRoles = new Set([
    getPrimaryRole(user)?.toUpperCase(),
    ...(user.roleAssignments ?? []).map(({ role }) => role.toUpperCase()),
  ].filter((role): role is string => Boolean(role)));

  return allowedRoles.some((allowed) => assignedRoles.has(allowed.toUpperCase()));
}

export function isParentUser(user: AuthMeResponse | null): boolean {
  return hasAnyRole(user, [UserRoleEnum.PARENT]);
}

export function isMinorPlayerUser(user: AuthMeResponse | null): boolean {
  return Boolean(user?.profile?.isMinor) && hasAnyRole(user, [UserRoleEnum.PLAYER]);
}

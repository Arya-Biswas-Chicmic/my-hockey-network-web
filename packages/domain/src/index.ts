import type { AuthMeResponse, UserRole } from '@my-hockey-network/contracts';

export * from './permissions/feedPermissions';

export function getPrimaryRole(user: AuthMeResponse | null): string | null {
  return user?.primaryRole ?? user?.profile?.type ?? null;
}

export function hasAnyRole(user: AuthMeResponse | null, allowedRoles: readonly (UserRole | string)[]): boolean {
  const role = getPrimaryRole(user)?.toUpperCase();
  return role !== null && allowedRoles.some((allowed) => allowed.toUpperCase() === role);
}

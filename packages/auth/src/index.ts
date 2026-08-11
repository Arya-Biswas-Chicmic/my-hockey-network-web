import type { UserProfile } from '@my-hockey-network/types';

export const hasRole = (user: UserProfile | null, role: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

export const createAuthSession = (token: string, user?: UserProfile) => {
  return {
    isAuthenticated: true,
    token,
    user: user || null,
    loginTimestamp: Date.now(),
  };
};

export const clearAuthSession = () => {
  return {
    isAuthenticated: false,
    token: null,
    user: null,
    loginTimestamp: null,
  };
};

import { getAuthSession, getUserProfile } from '@my-hockey-network/core';

/**
 * Single source of truth for session token inspection.
 */
export function hasActiveToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = getAuthSession();
    const profile = getUserProfile();
    const token = localStorage.getItem('mhn_access_token') || localStorage.getItem('accessToken');
    return !!(session || profile || token);
  } catch {
    return false;
  }
}

export function isAuthenticated(): boolean {
  return hasActiveToken();
}

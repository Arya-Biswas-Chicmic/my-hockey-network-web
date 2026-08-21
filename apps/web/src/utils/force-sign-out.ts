import { clearAuthSession } from '@my-hockey-network/core';

export function forceSignOut(redirectPath: string = '/onboarding'): void {
  clearAuthSession();
  if (typeof window !== 'undefined') {
    window.location.href = redirectPath;
  }
}

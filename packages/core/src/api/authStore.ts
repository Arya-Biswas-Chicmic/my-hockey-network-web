import type { OtpVerifyResponse, AuthMeResponse } from './types';

const AUTH_STORAGE_KEY = 'mhn_auth_session';
const USER_PROFILE_KEY = 'mhn_user_profile';

/**
 * Save auth session data (tokens, CSRF, delivery info) into local storage & cookies
 */
export function saveAuthSession(sessionData: OtpVerifyResponse): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Set CSRF cookie if present (Web auth)
    if (sessionData.csrfToken && typeof document !== 'undefined') {
      document.cookie = `mhn_csrf=${sessionData.csrfToken}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('mhn_csrf_token', sessionData.csrfToken);
    }

    if (sessionData.accessToken) {
      localStorage.setItem('mhn_access_token', sessionData.accessToken);
    }

    // 2. Persist in storage (Works in Web localStorage or Mobile storage bridge)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (err) {
    console.warn('Failed to save auth session to storage:', err);
  }
}

/**
 * Get stored auth session
 */
export function getAuthSession(): OtpVerifyResponse | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Save current user profile details
 */
export function saveUserProfile(userProfile: AuthMeResponse): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
  } catch (err) {
    console.warn('Failed to save user profile to storage:', err);
  }
}

/**
 * Get stored user profile
 */
export function getUserProfile(): AuthMeResponse | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Clear all auth session data on logout (Complete Token & Storage Sweep)
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem('mhn_access_token');
    localStorage.removeItem('mhn_refresh_token');
    localStorage.removeItem('mhn_csrf_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.clear();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'mhn_csrf=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  } catch (err) {
    console.warn('Failed to clear auth session:', err);
  }
}

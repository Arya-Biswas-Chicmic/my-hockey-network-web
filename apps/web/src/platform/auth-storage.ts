import type { AuthStorageAdapter } from '@my-hockey-network/api-client';
import type { OtpVerifyResponse } from '@my-hockey-network/contracts';

let csrfToken: string | null = null;
let accessToken: string | null = null;
let refreshToken: string | null = null;

/** Web authentication uses cookies primarily, keeping in-memory credentials and persisting CSRF tokens across page reloads. */
export const webAuthStorage: AuthStorageAdapter = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  getCsrfToken: () => {
    if (typeof window !== 'undefined') {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:XSRF-TOKEN|csrfToken|_csrf|csrf|csrf_token)=([^;]+)/i);
      if (cookieMatch) {
        const val = decodeURIComponent(cookieMatch[1]);
        csrfToken = val;
        return val;
      }
    }
    if (csrfToken) return csrfToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mhn_csrf_token');
    }
    return null;
  },
  saveSession: (session: OtpVerifyResponse) => {
    if (session.csrfToken) {
      csrfToken = session.csrfToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mhn_csrf_token', session.csrfToken);
      }
    }
    if (session.accessToken) accessToken = session.accessToken;
    if (session.refreshToken) refreshToken = session.refreshToken;
  },
  clearSession: () => {
    csrfToken = null;
    accessToken = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mhn_csrf_token');
    }
  },
};

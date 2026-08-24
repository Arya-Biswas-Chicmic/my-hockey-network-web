import type { AuthStorageAdapter } from '@my-hockey-network/api-client';
import type { OtpVerifyResponse } from '@my-hockey-network/contracts';

let csrfToken: string | null = null;
let accessToken: string | null = null;
let refreshToken: string | null = null;

/** Web authentication uses cookies primarily, keeping in-memory credentials and browser storage across page reloads. */
export const webAuthStorage: AuthStorageAdapter = {
  getAccessToken: () => {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
      const fromSession = sessionStorage.getItem('mhn_at_session');
      if (fromSession) {
        accessToken = fromSession;
        return fromSession;
      }
      const fromLocal = localStorage.getItem('mhn_at_local');
      if (fromLocal) {
        accessToken = fromLocal;
        return fromLocal;
      }
      const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:mhn_at|accessToken|access_token|token|jwt)=([^;]+)/i);
      if (cookieMatch) return decodeURIComponent(cookieMatch[1]);
    }
    return null;
  },
  getRefreshToken: () => refreshToken,
  getCsrfToken: () => {
    if (typeof window !== 'undefined') {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:mhn_csrf|XSRF-TOKEN|csrfToken|_csrf|csrf|csrf_token)=([^;]+)/i);
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
    const sessionObj = session as any;
    const csrfVal = session.csrfToken || sessionObj.mhn_csrf || sessionObj.csrf;
    if (csrfVal) {
      csrfToken = csrfVal;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mhn_csrf_token', csrfVal);
      }
    }
    const tokenVal = session.accessToken || sessionObj.token || sessionObj.jwt || sessionObj.access_token || sessionObj.mhn_at;
    if (tokenVal) {
      accessToken = tokenVal;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mhn_at_session', tokenVal);
        localStorage.setItem('mhn_at_local', tokenVal);
      }
    }
    const refreshVal = session.refreshToken || sessionObj.refresh_token || sessionObj.refreshToken;
    if (refreshVal) {
      refreshToken = refreshVal;
    }
  },
  clearSession: () => {
    csrfToken = null;
    accessToken = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mhn_csrf_token');
      sessionStorage.removeItem('mhn_at_session');
      localStorage.removeItem('mhn_at_local');
    }
  },
};

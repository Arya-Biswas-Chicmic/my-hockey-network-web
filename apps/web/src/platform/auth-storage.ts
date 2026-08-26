import type { AuthStorageAdapter } from '@my-hockey-network/api-client';
import type { OtpVerifyResponse } from '@my-hockey-network/contracts';

let csrfToken: string | null = null;

/** Web authentication uses backend httpOnly cookies. Only the non-secret CSRF value is held in memory. */
export const webAuthStorage: AuthStorageAdapter = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  getCsrfToken: () => csrfToken,
  saveSession: (session: OtpVerifyResponse) => {
    const sessionObj = session as OtpVerifyResponse & { mhn_csrf?: string; csrf?: string };
    const csrfVal = session.csrfToken || sessionObj.mhn_csrf || sessionObj.csrf;
    csrfToken = csrfVal || null;
  },
  clearSession: () => {
    csrfToken = null;
  },
};

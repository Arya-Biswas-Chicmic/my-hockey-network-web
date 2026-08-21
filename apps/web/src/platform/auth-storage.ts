import type { AuthStorageAdapter } from '@my-hockey-network/api-client';
import type { OtpVerifyResponse } from '@my-hockey-network/contracts';

let csrfToken: string | null = null;

/** Web authentication is cookie-based; browser-readable bearer tokens are never persisted. */
export const webAuthStorage: AuthStorageAdapter = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  getCsrfToken: () => csrfToken,
  saveSession: (session: OtpVerifyResponse) => {
    csrfToken = session.csrfToken ?? null;
  },
  clearSession: () => {
    csrfToken = null;
  },
};

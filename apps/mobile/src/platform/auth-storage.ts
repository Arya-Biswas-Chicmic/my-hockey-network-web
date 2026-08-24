import * as SecureStore from 'expo-secure-store';
import type { AuthStorageAdapter } from '@my-hockey-network/api-client';
import type { OtpVerifyResponse } from '@my-hockey-network/contracts';

const ACCESS_TOKEN_KEY = 'mhn.accessToken';
const REFRESH_TOKEN_KEY = 'mhn.refreshToken';
const CSRF_TOKEN_KEY = 'mhn.csrfToken';

async function saveOrDelete(key: string, value?: string): Promise<void> {
  if (value) await SecureStore.setItemAsync(key, value);
  else await SecureStore.deleteItemAsync(key);
}

export const mobileAuthStorage: AuthStorageAdapter = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  getCsrfToken: () => SecureStore.getItemAsync(CSRF_TOKEN_KEY),
  saveSession: async (session: Partial<OtpVerifyResponse>) => {
    await Promise.all([
      saveOrDelete(ACCESS_TOKEN_KEY, session.accessToken),
      saveOrDelete(REFRESH_TOKEN_KEY, session.refreshToken),
      saveOrDelete(CSRF_TOKEN_KEY, session.csrfToken),
    ]);
  },
  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(CSRF_TOKEN_KEY),
    ]);
  },
};

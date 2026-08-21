import { createApiClient } from '@my-hockey-network/api-client';
import { configureApiClient } from '@my-hockey-network/core';
import { mobileAuthStorage } from './auth-storage';
import { mobileEnvironment } from './environment';

export const mobileApiClient = createApiClient({
  baseUrl: mobileEnvironment.apiBaseUrl,
  clientType: 'mobile',
  authStorage: mobileAuthStorage,
  onUnauthorized: () => mobileAuthStorage.clearSession(),
});

export function configureMobilePlatform(): void {
  configureApiClient(mobileApiClient);
}

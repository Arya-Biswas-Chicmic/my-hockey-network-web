import { createApiClient } from '@my-hockey-network/api-client';
import { configureApiClient } from '@my-hockey-network/core';
import { webAuthStorage } from './auth-storage';
import { webEnvironment } from './environment';

export const webApiClient = createApiClient({
  baseUrl: webEnvironment.apiBaseUrl,
  clientType: 'web',
  credentials: 'include',
  authStorage: webAuthStorage,
  onUnauthorized: () => {
    window.dispatchEvent(new CustomEvent('mhn:unauthorized'));
  },
});

export function configureWebPlatform(): void {
  configureApiClient(webApiClient, webAuthStorage);
}

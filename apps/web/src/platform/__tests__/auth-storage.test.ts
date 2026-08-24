import { describe, expect, it } from 'vitest';
import { webAuthStorage } from '../auth-storage';

describe('webAuthStorage', () => {
  it('manages csrfToken and in-memory tokens safely', () => {
    webAuthStorage.clearSession();
    expect(webAuthStorage.getAccessToken()).toBeNull();
    expect(webAuthStorage.getRefreshToken()).toBeNull();
    expect(webAuthStorage.getCsrfToken()).toBeNull();

    webAuthStorage.saveSession({
      isNewUser: false,
      onboardingCompleted: true,
      tokenDelivery: 'web',
      csrfToken: 'csrf-123',
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      expiresInSeconds: 900,
    });

    expect(webAuthStorage.getCsrfToken()).toBe('csrf-123');
    expect(webAuthStorage.getAccessToken()).toBe('access-123');
    expect(webAuthStorage.getRefreshToken()).toBe('refresh-123');

    webAuthStorage.clearSession();
    expect(webAuthStorage.getAccessToken()).toBeNull();
    expect(webAuthStorage.getRefreshToken()).toBeNull();
    expect(webAuthStorage.getCsrfToken()).toBeNull();
  });
});

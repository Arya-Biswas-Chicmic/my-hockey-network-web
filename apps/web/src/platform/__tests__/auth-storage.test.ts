import { describe, expect, it } from 'vitest';
import { webAuthStorage } from '@/platform/auth-storage';

describe('webAuthStorage', () => {
  it('keeps only CSRF state in memory and ignores bearer credentials', () => {
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
    expect(webAuthStorage.getAccessToken()).toBeNull();
    expect(webAuthStorage.getRefreshToken()).toBeNull();

    webAuthStorage.clearSession();
    expect(webAuthStorage.getAccessToken()).toBeNull();
    expect(webAuthStorage.getRefreshToken()).toBeNull();
    expect(webAuthStorage.getCsrfToken()).toBeNull();
  });
});

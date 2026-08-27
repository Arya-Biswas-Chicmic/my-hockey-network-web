import { describe, expect, it, vi } from 'vitest';
import type { ApiClient, AuthStorageAdapter } from '@my-hockey-network/api-client';
import { API_ENDPOINTS, type AuthMeResponse, type OtpVerifyResponse } from '@my-hockey-network/contracts';
import { clearAuthSession, createAuthService, createAuthSession, hasRole } from '../index';

const session: OtpVerifyResponse = {
  isNewUser: false,
  onboardingCompleted: true,
  tokenDelivery: 'mobile',
  accessToken: 'access',
  refreshToken: 'refresh',
  expiresInSeconds: 3600,
};

function createMocks() {
  const request = vi.fn();
  const storage: AuthStorageAdapter = {
    getAccessToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    getCsrfToken: vi.fn(() => null),
    saveSession: vi.fn(),
    clearSession: vi.fn(),
  };
  return { request, storage, service: createAuthService({ request } as ApiClient, storage) };
}

describe('shared auth service', () => {
  it('maps OTP, onboarding, current-user, and guardian use cases to API contracts', async () => {
    const { request, service } = createMocks();
    request
      .mockResolvedValueOnce({ expiresInSeconds: 60 })
      .mockResolvedValueOnce({ profileId: 'profile-1' })
      .mockResolvedValueOnce({ id: 'user-1' })
      .mockResolvedValueOnce({ id: 'guardian-1' });

    await service.requestOtp({ channel: 'EMAIL', destination: 'p@example.com', intent: 'SIGNIN' });
    await service.submitOnboarding({ roles: ['PLAYER'], displayName: 'Player' });
    await service.getMe();
    await service.sendGuardianRequest('parent@example.com');

    expect(request).toHaveBeenNthCalledWith(1, API_ENDPOINTS.AUTH.OTP_REQUEST, expect.objectContaining({ method: 'POST' }));
    expect(request).toHaveBeenNthCalledWith(2, API_ENDPOINTS.AUTH.ONBOARDING, expect.objectContaining({ method: 'POST' }));
    expect(request).toHaveBeenNthCalledWith(3, API_ENDPOINTS.AUTH.ME);
    expect(request).toHaveBeenNthCalledWith(4, API_ENDPOINTS.RELATIONSHIPS.GUARDIAN_REQUESTS, expect.objectContaining({ method: 'POST' }));
  });

  it('requests a mobile-only password reset by email', async () => {
    const { request, service } = createMocks();
    request.mockResolvedValueOnce({ message: 'Check your inbox.' });

    await expect(service.forgotPassword({ email: 'p@example.com' })).resolves.toEqual({
      message: 'Check your inbox.',
    });

    expect(request).toHaveBeenCalledWith(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'p@example.com' }) }),
    );
  });

  it('persists a verified session through the injected platform storage', async () => {
    const { request, storage, service } = createMocks();
    request.mockResolvedValue(session);
    await expect(
      service.verifyOtp({ channel: 'EMAIL', destination: 'p@example.com', code: '123456', intent: 'SIGNIN' }),
    ).resolves.toEqual(session);
    expect(storage.saveSession).toHaveBeenCalledWith(session);
  });

  it('clears platform storage after successful and failed logout requests', async () => {
    const success = createMocks();
    success.request.mockResolvedValue(undefined);
    await success.service.logout();
    expect(success.storage.clearSession).toHaveBeenCalledOnce();

    const failure = createMocks();
    failure.request.mockRejectedValue(new Error('offline'));
    await expect(failure.service.logout()).rejects.toThrow('offline');
    expect(failure.storage.clearSession).toHaveBeenCalledOnce();
  });

  it('keeps compatibility helpers credential-free', () => {
    expect(hasRole({ roles: ['parent'] }, 'parent')).toBe(true);
    expect(hasRole(null, 'parent')).toBe(false);
    expect(createAuthSession('ignored')).toMatchObject({ isAuthenticated: true, user: null });
    expect(createAuthSession('ignored', { id: 'u1' }).user).toEqual({ id: 'u1' });
    expect(createAuthSession('ignored')).not.toHaveProperty('token');
    expect(clearAuthSession()).toEqual({ isAuthenticated: false, user: null, loginTimestamp: null });
  });
});

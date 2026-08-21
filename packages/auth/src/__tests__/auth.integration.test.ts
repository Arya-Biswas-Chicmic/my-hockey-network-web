import { describe, expect, it, vi } from 'vitest';
import { createApiClient, type AuthStorageAdapter } from '@my-hockey-network/api-client';
import type { AuthMeResponse, OtpVerifyResponse } from '@my-hockey-network/contracts';
import { createAuthService } from '../index';

const envelope = (data: unknown) =>
  new Response(JSON.stringify({ success: true, statusCode: 200, message: 'ok', data }), { status: 200 });

describe('OTP onboarding integration', () => {
  it('runs shared auth use cases through the real API client and platform adapter', async () => {
    let accessToken: string | null = null;
    const saveSession = vi.fn((session: OtpVerifyResponse) => {
      accessToken = session.accessToken ?? null;
    });
    const storage: AuthStorageAdapter = {
      getAccessToken: () => accessToken,
      getRefreshToken: () => null,
      getCsrfToken: () => null,
      saveSession,
      clearSession: vi.fn(() => {
        accessToken = null;
      }),
    };
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const path = new URL(String(input)).pathname;
      if (path.endsWith('/auth/otp/request')) return envelope({ expiresInSeconds: 60 });
      if (path.endsWith('/auth/otp/verify')) {
        return envelope({
          isNewUser: true,
          onboardingCompleted: false,
          tokenDelivery: 'mobile',
          accessToken: 'verified-access',
          refreshToken: 'verified-refresh',
          expiresInSeconds: 3600,
        });
      }
      if (path.endsWith('/auth/onboarding')) {
        return envelope({ profileId: 'profile-1', roles: ['PLAYER'], primaryRole: 'PLAYER', isMinor: false });
      }
      if (path.endsWith('/auth/me')) {
        return envelope({ id: 'user-1', email: 'player@example.com', primaryRole: 'PLAYER' } as AuthMeResponse);
      }
      return new Response('Not found', { status: 404 });
    });
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'mobile',
      authStorage: storage,
      fetchImpl,
    });
    const auth = createAuthService(client, storage);

    await auth.requestOtp({ channel: 'EMAIL', destination: 'player@example.com', intent: 'SIGNUP' });
    await auth.verifyOtp({
      channel: 'EMAIL',
      destination: 'player@example.com',
      code: '123456',
      intent: 'SIGNUP',
    });
    await auth.submitOnboarding({ roles: ['PLAYER'], displayName: 'Player' });
    const user = await auth.getMe();

    expect(user.id).toBe('user-1');
    expect(saveSession).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'verified-access' }));
    const authMeCall = fetchImpl.mock.calls.find(([input]) => String(input).endsWith('/auth/me'));
    expect((authMeCall?.[1]?.headers as Headers).get('Authorization')).toBe('Bearer verified-access');
  });
});

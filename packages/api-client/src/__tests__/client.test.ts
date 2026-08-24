import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient, type AuthStorageAdapter } from '../index';

function storage(): AuthStorageAdapter {
  return {
    getAccessToken: () => 'access-token',
    getRefreshToken: () => 'refresh-token',
    getCsrfToken: () => 'csrf-token',
    saveSession: vi.fn(),
    clearSession: vi.fn(),
  };
}

describe('platform-neutral API client', () => {
  it('does not log credentials or request bodies', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, statusCode: 200, message: 'ok', data: { ok: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'mobile',
      authStorage: storage(),
      fetchImpl,
    });

    await client.request('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ code: '123456' }),
    });

    expect(log).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledOnce();
    log.mockRestore();
  });

  it('treats an unauthenticated auth bootstrap as a silent result', async () => {
    const onUnauthorized = vi.fn();
    const authStorage = storage();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, statusCode: 401, message: 'Unauthorized', data: null }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, statusCode: 401, message: 'Unauthorized', data: null }), { status: 401 }));
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl,
      onUnauthorized,
    });

    await expect(client.request('/auth/me')).rejects.toMatchObject({ statusCode: 401 });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('serializes refresh, saves the new session, and retries concurrent requests', async () => {
    const authStorage = storage();
    let protectedCalls = 0;
    let refreshCalls = 0;
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        await Promise.resolve();
        return new Response(
          JSON.stringify({
            success: true,
            statusCode: 200,
            message: 'ok',
            data: {
              isNewUser: false,
              onboardingCompleted: true,
              tokenDelivery: 'mobile',
              accessToken: 'new-access',
              expiresInSeconds: 3600,
            },
          }),
          { status: 200 },
        );
      }
      protectedCalls += 1;
      const isFirstAttempt = protectedCalls <= 2;
      return new Response(
        JSON.stringify({
          success: !isFirstAttempt,
          statusCode: isFirstAttempt ? 401 : 200,
          message: isFirstAttempt ? 'Unauthorized' : 'ok',
          data: isFirstAttempt ? null : { ok: true },
        }),
        { status: isFirstAttempt ? 401 : 200 },
      );
    });
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'mobile',
      authStorage,
      fetchImpl,
    });

    await expect(Promise.all([client.request('/feed'), client.request('/profile')])).resolves.toEqual([
      { ok: true },
      { ok: true },
    ]);
    expect(refreshCalls).toBe(1);
    expect(authStorage.saveSession).toHaveBeenCalledOnce();
  });

  it('clears storage and announces a revoked authenticated request', async () => {
    const authStorage = storage();
    const onUnauthorized = vi.fn();
    const unauthorized = () =>
      new Response(JSON.stringify({ success: false, statusCode: 401, message: 'Revoked', data: null }), {
        status: 401,
      });
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => unauthorized()),
      onUnauthorized,
    });

    await expect(client.request('/feed')).rejects.toMatchObject({ statusCode: 401, message: 'Revoked' });
    expect(authStorage.clearSession).toHaveBeenCalledOnce();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('normalizes network, parsing, and API envelope failures', async () => {
    const authStorage = storage();
    const networkClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => {
        throw new Error('offline');
      }),
    });
    await expect(networkClient.request('/feed')).rejects.toMatchObject({ statusCode: 500, message: 'offline' });

    const unknownNetworkClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => Promise.reject('offline')),
    });
    await expect(unknownNetworkClient.request('/feed')).rejects.toMatchObject({ message: 'Network request failed' });

    const parseClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => new Response('not-json', { status: 502, statusText: 'Bad Gateway' })),
    });
    await expect(parseClient.request('/feed')).rejects.toMatchObject({ statusCode: 502 });

    const errorClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () =>
        new Response(JSON.stringify({ success: false, statusCode: 422, message: 'Invalid', data: { key: 'INVALID' } }), {
          status: 422,
        }),
      ),
    });
    await expect(errorClient.request('https://other.example.test/input')).rejects.toMatchObject({
      statusCode: 422,
      key: 'INVALID',
    });
  });

  it('sets defaults without replacing caller-provided security headers', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, statusCode: 200, message: 'ok', data: true }), { status: 200 }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage: storage(),
      credentials: 'include',
      fetchImpl,
    });
    await client.request('settings', {
      method: 'PATCH',
      headers: { Authorization: 'Custom token', 'X-CSRF-Token': 'Custom csrf' },
    });
    const [, init] = fetchImpl.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Custom token');
    expect(headers.get('X-CSRF-Token')).toBe('Custom csrf');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe('{}');
    expect(init?.credentials).toBe('include');
  });

  it('supports passing sessionAdapter as storage adapter and throws if missing', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, statusCode: 200, message: 'ok', data: true }), { status: 200 }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      sessionAdapter: storage(),
      fetchImpl,
    });
    await expect(client.request('/test')).resolves.toBe(true);

    expect(() =>
      createApiClient({
        baseUrl: 'https://api.example.test/v1',
        clientType: 'web',
      } as any),
    ).toThrow('createApiClient requires an authStorage or sessionAdapter.');
  });

  it('builds ApiError keys from structured and plain failures', () => {
    expect(new ApiError(400, 'Bad', { key: 123 }).key).toBe('123');
    expect(new ApiError(400, 'Bad').key).toBe('Bad');
  });
});

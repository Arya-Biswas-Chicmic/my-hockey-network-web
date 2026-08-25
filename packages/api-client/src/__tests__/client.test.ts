import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient, extractMessageFromEnvelope, type AuthStorageAdapter } from '../index';

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

    const ngrokClient = createApiClient({
      baseUrl: 'https://reposeful-kareen-controllingly.ngrok-free.dev/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => new Response('<html><body>ERR_NGROK_3200: Endpoint offline</body></html>', { status: 502 })),
    });
    await expect(ngrokClient.request('/auth/otp/request')).rejects.toMatchObject({
      statusCode: 502,
      message: 'Backend endpoint is offline or unreachable (ERR_NGROK_3200). Please check your backend connection.',
    });

    const htmlGatewayClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => new Response('<html><head><title>502 Bad Gateway</title></head></html>', { status: 502 })),
    });
    await expect(htmlGatewayClient.request('/feed')).rejects.toMatchObject({
      statusCode: 502,
      message: 'Backend error (502): 502 Bad Gateway',
    });

    const arrayErrorClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () =>
        new Response(JSON.stringify({ success: false, statusCode: 400, message: ['email must be an email', 'code required'] }), {
          status: 400,
        }),
      ),
    });
    await expect(arrayErrorClient.request('/auth/otp/request')).rejects.toMatchObject({
      statusCode: 400,
      message: 'email must be an email, code required',
    });

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

  it('extracts messages from various envelope shapes', () => {
    expect(extractMessageFromEnvelope(null)).toBeNull();
    expect(extractMessageFromEnvelope({})).toBeNull();
    expect(extractMessageFromEnvelope({ message: ['a', 'b'] })).toBe('a, b');
    expect(extractMessageFromEnvelope({ message: '  ' })).toBeNull();
    expect(extractMessageFromEnvelope({ error: 'Simple error' })).toBe('Simple error');
    expect(extractMessageFromEnvelope({ error: { message: 'Nested error' } })).toBe('Nested error');
    expect(extractMessageFromEnvelope({ data: { message: 'Data message' } })).toBe('Data message');
    expect(extractMessageFromEnvelope({ data: { message: ['data1', 'data2'] } })).toBe('data1, data2');
    expect(extractMessageFromEnvelope({ detail: 'Detail message' })).toBe('Detail message');
    expect(extractMessageFromEnvelope({ details: 'Details message' })).toBe('Details message');
  });

  it('handles HTML without title, failed fetch network errors, and plain text responses', async () => {
    const authStorage = storage();
    const fetchFailClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => {
        throw new Error('Failed to fetch');
      }),
    });
    await expect(fetchFailClient.request('/feed')).rejects.toMatchObject({
      message: 'Unable to connect to backend server. Please check your network or server URL.',
    });

    const htmlNoTitleClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => new Response('<html><body>No title here</body></html>', { status: 503, statusText: 'Service Unavailable' })),
    });
    await expect(htmlNoTitleClient.request('/feed')).rejects.toMatchObject({
      statusCode: 503,
      message: 'Backend service unavailable (503 Service Unavailable).',
    });

    const plainTextClient = createApiClient({
      baseUrl: 'https://api.example.test/v1',
      clientType: 'web',
      authStorage,
      fetchImpl: vi.fn(async () => new Response('Plain text error response', { status: 400 })),
    });
    await expect(plainTextClient.request('/feed')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Plain text error response',
    });
  });

  it('normalizes base URLs with trailing slashes during requests and token refresh', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, statusCode: 200, message: 'ok', data: { ok: true } }), { status: 200 }),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test/v1/',
      clientType: 'web',
      authStorage: storage(),
      fetchImpl,
    });

    await client.request('/feed');
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.example.test/v1/feed');
  });
});

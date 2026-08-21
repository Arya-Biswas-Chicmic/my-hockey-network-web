import type { ApiEnvelope, OtpVerifyResponse } from '@my-hockey-network/contracts';

export type ClientType = 'web' | 'mobile';

export interface AuthStorageAdapter {
  getAccessToken(): Promise<string | null> | string | null;
  getRefreshToken(): Promise<string | null> | string | null;
  getCsrfToken(): Promise<string | null> | string | null;
  saveSession(session: OtpVerifyResponse): Promise<void> | void;
  clearSession(): Promise<void> | void;
}

export interface ApiClientOptions {
  baseUrl: string;
  clientType: ClientType;
  authStorage: AuthStorageAdapter;
  credentials?: RequestCredentials;
  fetchImpl?: typeof fetch;
  onUnauthorized?: () => Promise<void> | void;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly data?: unknown;
  readonly key?: string;

  constructor(statusCode: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.key =
      typeof data === 'object' && data !== null && 'key' in data
        ? String((data as { key: unknown }).key)
        : message;
  }
}

export interface ApiClient {
  request<T>(path: string, options?: RequestInit): Promise<T>;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  let refreshPromise: Promise<boolean> | null = null;

  const buildHeaders = async (input?: HeadersInit): Promise<Headers> => {
    const headers = new Headers(input);
    headers.set('Accept-Language', 'en');
    headers.set('X-Client-Type', options.clientType);
    headers.set('ngrok-skip-browser-warning', 'true');

    const [accessToken, csrfToken] = await Promise.all([
      options.authStorage.getAccessToken(),
      options.authStorage.getCsrfToken(),
    ]);
    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    if (csrfToken && !headers.has('X-CSRF-Token')) {
      headers.set('X-CSRF-Token', csrfToken);
    }
    return headers;
  };

  const refresh = async (): Promise<boolean> => {
    const refreshToken = await options.authStorage.getRefreshToken();
    const headers = await buildHeaders({ 'Content-Type': 'application/json' });
    if (refreshToken) headers.set('X-Refresh-Token', refreshToken);

    try {
      const response = await fetchImpl(`${options.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers,
        body: '{}',
        credentials: options.credentials,
      });
      if (!response.ok) return false;
      const envelope = (await response.json()) as ApiEnvelope<OtpVerifyResponse>;
      if (!envelope.success || !envelope.data) return false;
      await options.authStorage.saveSession(envelope.data);
      return true;
    } catch {
      return false;
    }
  };

  const request = async <T>(path: string, requestOptions: RequestInit = {}, isRetry = false): Promise<T> => {
    const method = (requestOptions.method ?? 'GET').toUpperCase();
    const headers = await buildHeaders(requestOptions.headers);
    let body = requestOptions.body;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      if (body == null) body = '{}';
    }

    const url = path.startsWith('http')
      ? path
      : `${options.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    let response: Response;
    try {
      response = await fetchImpl(url, {
        ...requestOptions,
        method,
        headers,
        body,
        credentials: options.credentials,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network request failed';
      throw new ApiError(500, message);
    }

    let envelope: ApiEnvelope<T>;
    try {
      envelope = (await response.json()) as ApiEnvelope<T>;
    } catch {
      throw new ApiError(response.status, `Failed to parse response: ${response.statusText}`);
    }

    const canRefresh =
      response.status === 401 &&
      !isRetry &&
      !path.includes('/auth/refresh') &&
      !path.includes('/auth/logout');

    if (canRefresh) {
      refreshPromise ??= refresh().finally(() => {
        refreshPromise = null;
      });
      if (await refreshPromise) return request<T>(path, requestOptions, true);
      await options.authStorage.clearSession();
      if (!path.includes('/auth/me')) await options.onUnauthorized?.();
    }

    if (!response.ok || !envelope.success) {
      throw new ApiError(
        envelope.statusCode || response.status,
        envelope.message || 'API request failed',
        envelope.data,
      );
    }
    return envelope.data;
  };

  return { request: (path, requestOptions) => request(path, requestOptions) };
}

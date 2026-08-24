import { API_ENDPOINTS, type ApiEnvelope, type OtpVerifyResponse } from '@my-hockey-network/contracts';

export type ClientType = 'web' | 'mobile';

export interface AuthStorageAdapter {
  getAccessToken(): Promise<string | null> | string | null;
  getRefreshToken(): Promise<string | null> | string | null;
  getCsrfToken(): Promise<string | null> | string | null;
  saveSession(session: Partial<OtpVerifyResponse>): Promise<void> | void;
  clearSession(): Promise<void> | void;
}

export interface ApiClientOptions {
  baseUrl: string;
  clientType: ClientType;
  authStorage?: AuthStorageAdapter;
  sessionAdapter?: AuthStorageAdapter;
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

export function formatCurlCommand(url: string, method: string, headers: Headers, body?: BodyInit | null): string {
  const lines: string[] = [`curl -X ${method} "${url}"`];
  headers.forEach((value, key) => {
    lines.push(`  -H "${key}: ${value}"`);
  });
  if (body != null) {
    const bodyStr = typeof body === 'string' ? body : String(body);
    if (bodyStr && bodyStr !== '{}') {
      lines.push(`  -d '${bodyStr}'`);
    }
  }
  return lines.join(' \\\n');
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const storage = options.sessionAdapter ?? options.authStorage;
  if (!storage) {
    throw new Error('createApiClient requires an authStorage or sessionAdapter.');
  }
  let refreshPromise: Promise<boolean> | null = null;

    const buildHeaders = async (input?: HeadersInit): Promise<Headers> => {
    const headers = new Headers(input);
    headers.set('Accept', 'application/json');
    headers.set('Accept-Language', 'en');
    headers.set('X-Client-Type', options.clientType);
    headers.set('ngrok-skip-browser-warning', 'true');
    headers.set('Bypass-Tunnel-Reminder', 'true');
    headers.set('localtunnel-skip-warning', 'true');

    const [accessToken, csrfToken] = await Promise.all([
      storage.getAccessToken(),
      storage.getCsrfToken(),
    ]);
    if (accessToken) {
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${accessToken}`);
      if (!headers.has('mhn_at')) headers.set('mhn_at', accessToken);
    }
    if (csrfToken) {
      if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', csrfToken);
      if (!headers.has('X-XSRF-Token')) headers.set('X-XSRF-Token', csrfToken);
      if (!headers.has('csrf-token')) headers.set('csrf-token', csrfToken);
      if (!headers.has('mhn_csrf')) headers.set('mhn_csrf', csrfToken);
    }
    return headers;
  };

  const buildUrl = (targetPath: string): string => {
    if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
      return targetPath;
    }
    const cleanBase = options.baseUrl.replace(/\/+$/, '');
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    return `${cleanBase}${cleanPath}`;
  };

  const refresh = async (): Promise<boolean> => {
    const refreshToken = await storage.getRefreshToken();
    const headers = await buildHeaders({ 'Content-Type': 'application/json' });
    if (refreshToken) headers.set('X-Refresh-Token', refreshToken);

    try {
      const response = await fetchImpl(buildUrl(API_ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers,
        body: '{}',
        credentials: options.credentials,
      });
      if (!response.ok) return false;
      const envelope = (await response.json()) as ApiEnvelope<OtpVerifyResponse>;
      if (!envelope.success || !envelope.data) return false;
      await storage.saveSession(envelope.data);
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

    const url = buildUrl(path);

    if (typeof console !== 'undefined' && typeof console.info === 'function') {
      console.info(`📡 [API Call] ${method} ${url}\n${formatCurlCommand(url, method, headers, body)}`);
    }

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

    const serverCsrf =
      response.headers.get('x-csrf-token') ||
      response.headers.get('csrf-token') ||
      response.headers.get('x-xsrf-token');
    if (serverCsrf) {
      void storage.saveSession({ csrfToken: decodeURIComponent(serverCsrf) });
    }

    const serverAccessToken =
      response.headers.get('mhn_at') ||
      response.headers.get('x-access-token') ||
      response.headers.get('authorization');
    if (serverAccessToken) {
      const cleanToken = serverAccessToken.replace(/^Bearer\s+/i, '');
      void storage.saveSession({ accessToken: cleanToken });
    }

    let envelope: ApiEnvelope<T>;
    try {
      envelope = (await response.json()) as ApiEnvelope<T>;
      if (envelope?.data && typeof envelope.data === 'object') {
        const dataObj = envelope.data as any;
        if ('csrfToken' in dataObj && dataObj.csrfToken) {
          void storage.saveSession({ csrfToken: String(dataObj.csrfToken) });
        }
        const bodyToken = dataObj.accessToken || dataObj.token || dataObj.mhn_at || dataObj.jwt || dataObj.access_token;
        if (bodyToken) {
          void storage.saveSession({ accessToken: String(bodyToken) });
        }
      }
    } catch {
      throw new ApiError(response.status, `Failed to parse response: ${response.statusText}`);
    }

    const isCsrfError = response.status === 403 && envelope?.message?.toLowerCase().includes('csrf');
    const canRefresh =
      (response.status === 401 || isCsrfError) &&
      !isRetry &&
      !path.includes(API_ENDPOINTS.AUTH.REFRESH) &&
      !path.includes(API_ENDPOINTS.AUTH.LOGOUT);

    if (canRefresh) {
      refreshPromise ??= refresh().finally(() => {
        refreshPromise = null;
      });
      if (await refreshPromise) return request<T>(path, requestOptions, true);
      if (!isCsrfError) {
        await storage.clearSession();
        if (!path.includes(API_ENDPOINTS.AUTH.ME)) await options.onUnauthorized?.();
      }
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

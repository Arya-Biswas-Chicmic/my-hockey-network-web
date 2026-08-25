import { API_ENDPOINTS, HttpHeader, type ApiEnvelope, type OtpVerifyResponse } from '@my-hockey-network/contracts';

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

export function extractMessageFromEnvelope(envelope: any): string | null {
  if (!envelope) return null;
  if (Array.isArray(envelope.message)) {
    return envelope.message.join(', ');
  }
  if (typeof envelope.message === 'string' && envelope.message.trim()) {
    return envelope.message;
  }
  if (typeof envelope.error === 'string' && envelope.error.trim()) {
    return envelope.error;
  }
  if (envelope.error && typeof envelope.error === 'object' && typeof envelope.error.message === 'string') {
    return envelope.error.message;
  }
  if (envelope.data && typeof envelope.data === 'object') {
    if (typeof envelope.data.message === 'string' && envelope.data.message.trim()) {
      return envelope.data.message;
    }
    if (Array.isArray(envelope.data.message)) {
      return envelope.data.message.join(', ');
    }
  }
  if (typeof envelope.detail === 'string' && envelope.detail.trim()) {
    return envelope.detail;
  }
  if (typeof envelope.details === 'string' && envelope.details.trim()) {
    return envelope.details;
  }
  return null;
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
    headers.set(HttpHeader.ACCEPT, 'application/json');
    headers.set(HttpHeader.ACCEPT_LANGUAGE, 'en');
    headers.set(HttpHeader.X_CLIENT_TYPE, options.clientType);
    headers.set(HttpHeader.NGROK_SKIP_BROWSER_WARNING, 'true');
    headers.set(HttpHeader.BYPASS_TUNNEL_REMINDER, 'true');
    headers.set(HttpHeader.LOCALTUNNEL_SKIP_WARNING, 'true');

    const [accessToken, csrfToken] = await Promise.all([
      storage.getAccessToken(),
      storage.getCsrfToken(),
    ]);
    if (accessToken) {
      if (!headers.has(HttpHeader.AUTHORIZATION)) headers.set(HttpHeader.AUTHORIZATION, `Bearer ${accessToken}`);
      if (!headers.has(HttpHeader.MHN_AT)) headers.set(HttpHeader.MHN_AT, accessToken);
    }
    if (csrfToken) {
      if (!headers.has(HttpHeader.X_CSRF_TOKEN)) headers.set(HttpHeader.X_CSRF_TOKEN, csrfToken);
      if (!headers.has(HttpHeader.X_XSRF_TOKEN)) headers.set(HttpHeader.X_XSRF_TOKEN, csrfToken);
      if (!headers.has(HttpHeader.CSRF_TOKEN)) headers.set(HttpHeader.CSRF_TOKEN, csrfToken);
      if (!headers.has(HttpHeader.MHN_CSRF)) headers.set(HttpHeader.MHN_CSRF, csrfToken);
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
    const headers = await buildHeaders({ [HttpHeader.CONTENT_TYPE]: 'application/json' });
    if (refreshToken) headers.set(HttpHeader.X_REFRESH_TOKEN, refreshToken);

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
      if (!headers.has(HttpHeader.CONTENT_TYPE)) headers.set(HttpHeader.CONTENT_TYPE, 'application/json');
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
      let message = error instanceof Error ? error.message : 'Network request failed';
      if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror')) {
        message = 'Unable to connect to backend server. Please check your network or server URL.';
      }
      throw new ApiError(500, message);
    }

    const serverCsrf =
      response.headers.get(HttpHeader.X_CSRF_TOKEN.toLowerCase()) ||
      response.headers.get(HttpHeader.CSRF_TOKEN) ||
      response.headers.get(HttpHeader.X_XSRF_TOKEN.toLowerCase());
    if (serverCsrf) {
      void storage.saveSession({ csrfToken: decodeURIComponent(serverCsrf) });
    }

    const serverAccessToken =
      response.headers.get(HttpHeader.MHN_AT) ||
      response.headers.get(HttpHeader.X_ACCESS_TOKEN) ||
      response.headers.get(HttpHeader.AUTHORIZATION.toLowerCase());
    if (serverAccessToken) {
      const cleanToken = serverAccessToken.replace(/^Bearer\s+/i, '');
      void storage.saveSession({ accessToken: cleanToken });
    }

    let rawText = '';
    try {
      rawText = await response.clone().text();
    } catch {
      // Ignore text clone failure
    }

    let envelope: ApiEnvelope<T> | undefined;
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
      let extractedMessage = '';
      if (rawText.includes('ERR_NGROK_') || rawText.toLowerCase().includes('ngrok') || rawText.toLowerCase().includes('tunnel')) {
        const ngrokMatch = rawText.match(/ERR_NGROK_\d+/);
        const codeStr = ngrokMatch ? ` (${ngrokMatch[0]})` : '';
        extractedMessage = `Backend endpoint is offline or unreachable${codeStr}. Please check your backend connection.`;
      } else if (rawText.includes('<html') || rawText.includes('<!DOCTYPE') || rawText.includes('<body')) {
        const titleMatch = rawText.match(/<title[^>]*>([^<]+)<\/title>/i) || rawText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        const pageTitle = titleMatch ? titleMatch[1].trim() : '';
        if (pageTitle) {
          extractedMessage = `Backend error (${response.status}): ${pageTitle}`;
        } else {
          extractedMessage = `Backend service unavailable (${response.status} ${response.statusText || 'Server Error'}).`;
        }
      } else if (rawText.trim()) {
        extractedMessage = rawText.trim();
      }

      if (!extractedMessage) {
        extractedMessage = response.statusText
          ? `API request failed with status ${response.status}: ${response.statusText}`
          : `API request failed with status code ${response.status}`;
      }
      throw new ApiError(response.status, extractedMessage);
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

    if (!response.ok || envelope.success === false) {
      const extractedMessage = extractMessageFromEnvelope(envelope) || response.statusText || 'API request failed';
      throw new ApiError(
        envelope.statusCode || response.status,
        extractedMessage,
        envelope.data,
      );
    }
    return envelope.data;
  };

  return { request: (path, requestOptions) => request(path, requestOptions) };
}

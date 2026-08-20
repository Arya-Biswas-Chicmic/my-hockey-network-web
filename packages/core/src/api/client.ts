/**
 * Shared Core API Client for My Hockey Network (Web & Mobile)
 */

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  statusCode: number;
  key?: string;
  data?: any;

  constructor(statusCode: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    if (typeof data === 'object' && data !== null && data.key) {
      this.key = data.key;
    } else {
      this.key = message;
    }
  }
}

// Fallback Live Backend URL
const DEFAULT_BACKEND_URL = 'https://reposeful-kareen-controllingly.ngrok-free.dev/v1';

export function getApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) {
    return (import.meta as any).env.VITE_API_BASE_URL;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.VITE_API_BASE_URL) {
    return (globalThis as any).process.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.origin.includes('netlify.app')) {
    return '/v1';
  }
  return DEFAULT_BACKEND_URL;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Single shared in-flight refresh promise for serialized refresh
let sharedRefreshPromise: Promise<boolean> | null = null;

async function executeRefresh(clientType: 'web' | 'mobile' = 'web'): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Type': clientType,
      'ngrok-skip-browser-warning': 'true',
    };

    let refreshToken: string | null = null;
    if (typeof localStorage !== 'undefined') {
      refreshToken = localStorage.getItem('mhn_refresh_token') || localStorage.getItem('refreshToken');
      if (!refreshToken) {
        const rawSession = localStorage.getItem('mhn_auth_session');
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          refreshToken = parsed.refreshToken || parsed.data?.refreshToken || null;
        }
      }
    }

    if (refreshToken) {
      headers['X-Refresh-Token'] = refreshToken;
    }

    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      credentials: 'include',
    });

    if (!res.ok) return false;
    const data: ApiResponse = await res.json();

    if (data.success && data.data) {
      if (typeof localStorage !== 'undefined') {
        const newAccessToken = (data.data as any).accessToken;
        const newRefreshToken = (data.data as any).refreshToken;
        if (newAccessToken) {
          localStorage.setItem('mhn_access_token', newAccessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('mhn_refresh_token', newRefreshToken);
        }
      }
    }

    return data.success;
  } catch (err) {
    return false;
  }
}

const NGROK_BACKEND_BASE_URL = 'https://reposeful-kareen-controllingly.ngrok-free.dev/v1';

// Helper to log equivalent cURL command string to console
function logCurlCommand(url: string, method: string, headers: Record<string, string>, body?: any) {
  let curlUrl = url;
  if (curlUrl.startsWith('/v1')) {
    curlUrl = `${NGROK_BACKEND_BASE_URL}${curlUrl.slice(3)}`;
  } else if (curlUrl.includes('localhost:') && curlUrl.includes('/v1')) {
    curlUrl = curlUrl.replace(/http:\/\/localhost:[0-9]+\/v1/, NGROK_BACKEND_BASE_URL);
  }

  const curlParts = [`curl -X ${method} "${curlUrl}"`];

  if (typeof document !== 'undefined' && document.cookie) {
    curlParts.push(`  -H "Cookie: ${document.cookie}"`);
  }

  for (const [k, v] of Object.entries(headers)) {
    curlParts.push(`  -H "${k}: ${v}"`);
  }

  if (body) {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    curlParts.push(`  -d '${bodyStr}'`);
  }

  const curlCommand = curlParts.join(' \\\n');
  console.log(`%c 🌐 [API Call] ${method} ${curlUrl}`, 'color: #0091FF; font-weight: bold; font-size: 13px;');
  console.log(`%c${curlCommand}`, 'color: #10B981; font-family: monospace; font-size: 12px;');
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  clientType: 'web' | 'mobile' = 'web',
  isRetry = false
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'X-Client-Type': clientType,
    'Accept-Language': 'en',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true',
    'localtunnel-skip-warning': 'true',
    ...(options.headers as Record<string, string> || {}),
  };

  // For POST, PUT, PATCH: Ensure Content-Type is application/json and body defaults to JSON {}
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.body === undefined || options.body === null) {
      options.body = JSON.stringify({});
    }
  } else if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach CSRF token header for Web
  let csrfToken = getCookie('mhn_csrf');
  try {
    if (!csrfToken && typeof localStorage !== 'undefined') {
      csrfToken = localStorage.getItem('mhn_csrf_token');
      if (!csrfToken) {
        const rawSession = localStorage.getItem('mhn_auth_session');
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          csrfToken = parsed.csrfToken || parsed.data?.csrfToken || null;
        }
      }
    }
  } catch (e) {}

  if (csrfToken && !headers['X-CSRF-Token']) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  // Only attach Authorization: Bearer if token is a valid JWT (starts with 'ey')
  let accessToken: string | null = null;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mhn_access_token') || localStorage.getItem('accessToken');
      if (stored && stored.startsWith('ey')) {
        accessToken = stored;
      } else {
        const rawSession = localStorage.getItem('mhn_auth_session');
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed.accessToken && typeof parsed.accessToken === 'string' && parsed.accessToken.startsWith('ey')) {
            accessToken = parsed.accessToken;
          }
        }
      }
    }
  } catch (e) {}

  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  logCurlCommand(url, method, headers, options.body);

  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (netErr: any) {
    throw new ApiError(500, netErr.message || 'Network request failed');
  }

  let resEnvelope: ApiResponse<T>;
  try {
    resEnvelope = await response.json();
  } catch (err) {
    throw new ApiError(response.status, `Failed to parse response: ${response.statusText}`);
  }

  if (response.status === 401 && !isRetry && !path.includes('/auth/refresh') && !path.includes('/auth/logout')) {
    if (!sharedRefreshPromise) {
      sharedRefreshPromise = executeRefresh(clientType).finally(() => {
        sharedRefreshPromise = null;
      });
    }

    const refreshedSuccessfully = await sharedRefreshPromise;
    if (refreshedSuccessfully) {
      return apiFetch<T>(path, options, clientType, true);
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mhn:unauthorized', { detail: { path, message: resEnvelope.message || 'Unauthorized' } }));
      }
      throw new ApiError(401, 'TOKEN_REVOKED', resEnvelope.data);
    }
  }

  if (!response.ok || !resEnvelope.success) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mhn:unauthorized', { detail: { path, message: resEnvelope.message || 'Unauthorized' } }));
    }
    throw new ApiError(
      resEnvelope.statusCode || response.status,
      resEnvelope.message || 'API request failed',
      resEnvelope.data
    );
  }

  return resEnvelope.data;
}

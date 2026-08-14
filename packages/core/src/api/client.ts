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
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': clientType,
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'include',
    });

    if (!res.ok) return false;
    const data: ApiResponse = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

// Helper to log equivalent cURL command string to console
function logCurlCommand(url: string, method: string, headers: Record<string, string>, body?: any) {
  const curlParts = [`curl -X ${method} "${url}"`];

  for (const [k, v] of Object.entries(headers)) {
    curlParts.push(`  -H "${k}: ${v}"`);
  }

  if (body) {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    curlParts.push(`  -d '${bodyStr}'`);
  }

  const curlCommand = curlParts.join(' \\\n');
  console.log(`%c 🌐 [API Call] ${method} ${url}`, 'color: #0091FF; font-weight: bold; font-size: 13px;');
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
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && clientType === 'web') {
    const csrfToken = getCookie('mhn_csrf');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
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
      throw new ApiError(401, 'TOKEN_REVOKED', resEnvelope.data);
    }
  }

  if (!response.ok || !resEnvelope.success) {
    throw new ApiError(
      resEnvelope.statusCode || response.status,
      resEnvelope.message || 'API request failed',
      resEnvelope.data
    );
  }

  return resEnvelope.data;
}

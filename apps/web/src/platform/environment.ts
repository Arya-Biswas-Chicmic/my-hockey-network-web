const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() || '/v1').replace(/\/+$/, '');

export const webEnvironment = {
  apiBaseUrl,
} as const;

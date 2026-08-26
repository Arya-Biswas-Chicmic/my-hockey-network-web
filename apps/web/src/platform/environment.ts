const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');

if (!apiBaseUrl) {
  throw new Error(
    'Missing VITE_API_BASE_URL. Copy apps/web/.env.example to apps/web/.env.local and set the API URL.',
  );
}

export const webEnvironment = {
  apiBaseUrl,
} as const;

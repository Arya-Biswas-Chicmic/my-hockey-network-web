const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(
  /\/+$/,
  '',
);

if (!apiBaseUrl) {
  throw new Error(
    'Missing EXPO_PUBLIC_API_BASE_URL. Copy apps/mobile/.env.example to apps/mobile/.env and set the API URL.',
  );
}

export const mobileEnvironment = {
  apiBaseUrl,
} as const;

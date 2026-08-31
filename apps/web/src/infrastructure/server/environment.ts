import 'server-only';

export function getServerEnvironment() {
  const apiBaseUrl =
    process.env.API_BASE_URL?.trim().replace(/\/+$/, '') ||
    'https://my-hockey-api.projectlabs.in/v1';

  return {
    apiBaseUrl,
  } as const;
}


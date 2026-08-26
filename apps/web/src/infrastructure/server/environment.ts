import 'server-only';

export function getServerEnvironment() {
  const apiBaseUrl = process.env.API_BASE_URL?.trim().replace(/\/+$/, '');

  if (!apiBaseUrl) {
    throw new Error('Missing API_BASE_URL. Set it in apps/web/.env.local or the deployment environment.');
  }

  return {
    apiBaseUrl,
  } as const;
}

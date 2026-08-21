import type { ApiClient, ClientType } from '@my-hockey-network/api-client';
export { ApiError } from '@my-hockey-network/api-client';
export type { ApiEnvelope as ApiResponse } from '@my-hockey-network/contracts';

let configuredClient: ApiClient | null = null;

/** Configure once in the platform entry point before rendering the app. */
export function configureApiClient(client: ApiClient): void {
  configuredClient = client;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _clientType: ClientType = 'web',
): Promise<T> {
  if (!configuredClient) {
    throw new Error('API client is not configured. Configure the web or mobile platform adapter first.');
  }
  return configuredClient.request<T>(path, options);
}

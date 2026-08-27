import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@my-hockey-network/api-client';

// Mirrors the web app's TanStack Query client config (query/query-client.ts)
// so both platforms retry/cache on the same rules.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.statusCode < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

export const globalQueryClient = createQueryClient();

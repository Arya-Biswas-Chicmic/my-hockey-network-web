import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@my-hockey-network/api-client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
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

export function invalidateQueryPrefix(client: QueryClient, prefix: string) {
  return client.invalidateQueries({
    predicate: (query) => String(query.queryKey[0] ?? '').startsWith(prefix),
  });
}

export { QueryClient } from '@tanstack/react-query';

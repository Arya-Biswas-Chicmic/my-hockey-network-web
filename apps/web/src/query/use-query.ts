import { useCallback, useMemo } from 'react';
import { useQuery as useTanStackQuery, useQueryClient } from '@tanstack/react-query';

export interface QueryOptions {
  staleTime?: number;
  forceRefetch?: boolean;
  enabled?: boolean;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: (options?: { forceRefetch?: boolean }) => Promise<T | null>;
  setData: (updater: T | ((old: T | null) => T)) => void;
}

/** Existing call-signature facade backed entirely by TanStack Query. */
export function useQuery<T>(
  key: string | null | undefined,
  fetcher: (() => Promise<T>) | null | undefined,
  options?: QueryOptions,
): UseQueryResult<T> {
  const queryClient = useQueryClient();
  const enabled = (options?.enabled ?? true) && Boolean(key) && Boolean(fetcher);
  const queryKey = useMemo(() => [key ?? 'disabled-query'] as const, [key]);
  const query = useTanStackQuery({
    queryKey,
    queryFn: async () => {
      if (!fetcher) throw new Error('Query fetcher is not configured.');
      return fetcher();
    },
    enabled,
    staleTime: options?.staleTime,
    refetchOnMount: options?.forceRefetch ? 'always' : undefined,
  });

  const refetch = useCallback(async () => {
    if (!enabled) return null;
    const result = await query.refetch();
    return result.data ?? null;
  }, [enabled, query.refetch]);

  const setData = useCallback(
    (updater: T | ((old: T | null) => T)) => {
      queryClient.setQueryData<T>(queryKey, (old) =>
        typeof updater === 'function'
          ? (updater as (value: T | null) => T)(old ?? null)
          : updater,
      );
    },
    [queryClient, queryKey],
  );

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch,
    setData,
  };
}

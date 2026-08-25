import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from './query-context';
import type { QueryOptions } from './query-client';

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  refetch: (options?: { forceRefetch?: boolean }) => Promise<T | null>;
  setData: (updater: T | ((old: T | null) => T)) => void;
}

export function useQuery<T>(
  key: string | null | undefined,
  fetcher: (() => Promise<T>) | null | undefined,
  options?: QueryOptions & { enabled?: boolean }
): UseQueryResult<T> {
  const queryClient = useQueryClient();
  const optionEnabled = options?.enabled;
  const enabled = (optionEnabled ?? true) && Boolean(key) && Boolean(fetcher);
  const staleTime = options?.staleTime;
  const optionForceRefetch = options?.forceRefetch;

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const [data, setDataState] = useState<T | null>(() => (key ? queryClient.getQueryData<T>(key) : null));
  const [isLoading, setIsLoading] = useState<boolean>(() => enabled && data === null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const executeFetch = useCallback(
    async (forceRefetch = false): Promise<T | null> => {
      const currentFetcher = fetcherRef.current;
      if (!key || !currentFetcher || !enabled) return null;

      setIsFetching(true);
      if (queryClient.getQueryData<T>(key) === null) {
        setIsLoading(true);
      }

      try {
        const result = await queryClient.fetchQuery<T>(key, currentFetcher, {
          staleTime,
          forceRefetch: forceRefetch || optionForceRefetch,
        });
        setDataState(result);
        setError(null);
        return result;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [key, enabled, staleTime, optionForceRefetch, queryClient]
  );

  useEffect(() => {
    if (!key || !enabled) {
      setIsLoading(false);
      return;
    }

    // Read current cache data
    const cachedData = queryClient.getQueryData<T>(key);
    if (cachedData !== null) {
      setDataState(cachedData);
    }

    // Subscribe to query client updates for this key
    const unsubscribe = queryClient.subscribe(key, () => {
      const updated = queryClient.getQueryData<T>(key);
      setDataState(updated);
    });

    // Execute query (deduplicated automatically by QueryClient)
    void executeFetch();

    return () => {
      unsubscribe();
    };
  }, [key, enabled, executeFetch, queryClient]);

  const refetch = useCallback(
    async (refetchOpts?: { forceRefetch?: boolean }) => {
      return executeFetch(refetchOpts?.forceRefetch ?? true);
    },
    [executeFetch]
  );

  const setData = useCallback(
    (updater: T | ((old: T | null) => T)) => {
      if (key) {
        queryClient.setQueryData(key, updater);
      }
    },
    [key, queryClient]
  );

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    setData,
  };
}

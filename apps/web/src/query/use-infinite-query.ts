import { useCallback, useMemo } from 'react';
import { useInfiniteQuery as useTanStackInfiniteQuery } from '@tanstack/react-query';

export interface InfinitePage<T> {
  items: T[];
  nextCursor?: string | null;
}

export interface InfiniteQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

export interface UseInfiniteListQueryResult<T> {
  items: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: unknown;
  fetchNextPage: () => void;
  refetch: () => Promise<unknown>;
}

/**
 * First infinite-scroll hook in the app — same thin-facade-over-TanStack-Query
 * convention as `use-query.ts`, just backed by `useInfiniteQuery` instead of
 * `useQuery`. Modeled on the cursor shape `getFeed`/`getUserPosts` already
 * return (`{ items, nextCursor }`), which nothing in the app actually paged
 * through yet — every list screen (Home feed included) just showed the
 * first page. `fetchPage(cursor)` should call the same API function passing
 * `cursor` through; pass `undefined` for the first page.
 */
export function useInfiniteListQuery<T>(
  key: string | null | undefined,
  fetchPage: ((cursor: string | undefined) => Promise<InfinitePage<T>>) | null | undefined,
  options?: InfiniteQueryOptions,
): UseInfiniteListQueryResult<T> {
  const enabled = (options?.enabled ?? true) && Boolean(key) && Boolean(fetchPage);
  const queryKey = useMemo(() => [key ?? 'disabled-infinite-query'] as const, [key]);

  const query = useTanStackInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (!fetchPage) throw new Error('Infinite query fetcher is not configured.');
      return fetchPage(pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: InfinitePage<T>) => lastPage.nextCursor || undefined,
    enabled,
    staleTime: options?.staleTime,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const fetchNextPage = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage]);

  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    error: query.error,
    fetchNextPage,
    refetch: query.refetch,
  };
}

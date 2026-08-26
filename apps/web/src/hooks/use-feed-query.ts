'use client';

import { useQuery } from '@tanstack/react-query';
import { getFeed, type GetFeedParams, type FeedResponse } from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';

/**
 * Declarative feed read — the "query" half of the feed/post hook layer
 * (see `use-post-mutations.ts` for the mutation half and
 * docs/COMPONENT_CATALOG.md for the full hierarchy this belongs to).
 *
 * `screens/home-page.tsx` still owns its feed fetch imperatively via
 * `globalQueryClient.fetchQuery` (not this hook directly) inside a
 * hand-written async function tightly coupled to that screen's raw-item
 * → `FeedPostProps` mapping and its own optimistic post-update local
 * state — replacing that with a fully declarative `useQuery` would mean
 * rebuilding the search/sort/silent-refresh/error-shape behavior on top
 * of query state with no live backend in this environment to verify the
 * swap against. It shares this hook's exact cache identity via
 * `feedQueryKey`, so both stay interoperable: creating a post
 * invalidates `QueryKeys.FEED_POSTS`-prefixed entries either call site
 * produced, and any screen adopting this hook directly reads the same
 * cache the imperative fetch already populated.
 */
export function feedQueryKey(params: Pick<GetFeedParams, 'sortBy' | 'query' | 'limit'>) {
  return [QueryKeys.FEED_POSTS, params.sortBy, params.query, params.limit];
}

export function useFeedQuery(params: GetFeedParams, options?: { enabled?: boolean }) {
  return useQuery<FeedResponse>({
    queryKey: feedQueryKey(params),
    queryFn: () => getFeed(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryKeys } from '@my-hockey-network/contracts';

import { createQueryClient } from '@/query/query-client';
import { QueryProvider } from '@/query/query-context';
import { useFeedQuery, feedQueryKey } from '@/hooks/use-feed-query';

const { getFeed } = vi.hoisted(() => ({ getFeed: vi.fn() }));

vi.mock('@my-hockey-network/core', () => ({ getFeed }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('feedQueryKey', () => {
  it('builds a key prefixed with QueryKeys.FEED_POSTS so it matches prefix invalidation', () => {
    expect(feedQueryKey({ sortBy: 'RECENT', query: undefined, limit: 20 })).toEqual([
      QueryKeys.FEED_POSTS,
      'RECENT',
      undefined,
      20,
    ]);
  });

  it('varies by sort/query/limit so distinct feed views cache independently', () => {
    const a = feedQueryKey({ sortBy: 'RECENT', query: undefined, limit: 20 });
    const b = feedQueryKey({ sortBy: 'POPULAR', query: undefined, limit: 20 });
    expect(a).not.toEqual(b);
  });
});

describe('useFeedQuery', () => {
  it('fetches the feed with the given params and exposes the response as data', async () => {
    getFeed.mockResolvedValue({ items: [{ id: 'p1', body: 'hi', audience: 'PUBLIC', createdAt: '2026-01-01' }] });
    const client = createQueryClient();
    const { result } = renderHook(() => useFeedQuery({ sortBy: 'RECENT', limit: 20 }), {
      wrapper: ({ children }) => <QueryProvider client={client}>{children}</QueryProvider>,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getFeed).toHaveBeenCalledWith({ sortBy: 'RECENT', limit: 20 });
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('shares its cache entry with a manually keyed fetchQuery call using feedQueryKey', async () => {
    getFeed.mockResolvedValue({ items: [] });
    const client = createQueryClient();
    const params = { sortBy: 'RECENT' as const, query: undefined, limit: 20 };

    await client.fetchQuery({ queryKey: feedQueryKey(params), queryFn: () => getFeed(params) });
    expect(getFeed).toHaveBeenCalledOnce();

    const { result } = renderHook(() => useFeedQuery(params), {
      wrapper: ({ children }) => <QueryProvider client={client}>{children}</QueryProvider>,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Still fresh from the manual fetchQuery above — no second network call.
    expect(getFeed).toHaveBeenCalledOnce();
  });

  it('does not fetch while disabled', async () => {
    getFeed.mockResolvedValue({ items: [] });
    const client = createQueryClient();
    renderHook(() => useFeedQuery({ sortBy: 'RECENT', limit: 20 }, { enabled: false }), {
      wrapper: ({ children }) => <QueryProvider client={client}>{children}</QueryProvider>,
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(getFeed).not.toHaveBeenCalled();
  });
});

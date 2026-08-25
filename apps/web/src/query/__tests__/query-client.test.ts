import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '../query-client';

describe('QueryClient Data Fetching Architecture', () => {
  it('deduplicates simultaneous in-flight network requests for the same query key', async () => {
    const client = new QueryClient();
    const fetcher = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { id: 1, name: 'Test User' };
    });

    // Three simultaneous calls for the same key
    const p1 = client.fetchQuery('user:1', fetcher);
    const p2 = client.fetchQuery('user:1', fetcher);
    const p3 = client.fetchQuery('user:1', fetcher);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    expect(r1).toEqual({ id: 1, name: 'Test User' });
    expect(r2).toEqual({ id: 1, name: 'Test User' });
    expect(r3).toEqual({ id: 1, name: 'Test User' });

    // ONLY 1 network request should go over the wire
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('serves valid cached data instantly without firing network requests during staleTime window', async () => {
    const client = new QueryClient();
    const fetcher = vi.fn(async () => 'fresh-data');

    // First fetch populates cache
    const initial = await client.fetchQuery('query:cache', fetcher, { staleTime: 60000 });
    expect(initial).toBe('fresh-data');
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second fetch within staleTime window
    const cached = await client.fetchQuery('query:cache', fetcher, { staleTime: 60000 });
    expect(cached).toBe('fresh-data');

    // Fetcher should NOT have been called a second time
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('allows single-flight cache invalidation via invalidateQueries', async () => {
    const client = new QueryClient();
    const listener = vi.fn();
    client.subscribe('query:invalidate', listener);

    client.setQueryData('query:invalidate', { count: 10 });
    expect(client.getQueryData('query:invalidate')).toEqual({ count: 10 });

    client.invalidateQueries('query:invalidate');
    expect(client.getQueryData('query:invalidate')).toBeNull();
    expect(listener).toHaveBeenCalled();
  });
});

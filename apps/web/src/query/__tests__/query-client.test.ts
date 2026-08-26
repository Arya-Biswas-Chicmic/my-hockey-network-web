import { describe, expect, it, vi } from 'vitest';
import { createQueryClient, invalidateQueryPrefix } from '@/query/query-client';

describe('TanStack Query configuration', () => {
  it('deduplicates simultaneous requests for the same query key', async () => {
    const client = createQueryClient();
    const fetcher = vi.fn(async () => ({ id: 1, name: 'Test User' }));
    const options = { queryKey: ['user', 1], queryFn: fetcher, staleTime: 60_000 };

    const results = await Promise.all([
      client.fetchQuery(options),
      client.fetchQuery(options),
      client.fetchQuery(options),
    ]);

    expect(results).toEqual([
      { id: 1, name: 'Test User' },
      { id: 1, name: 'Test User' },
      { id: 1, name: 'Test User' },
    ]);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('serves fresh cached data without another request', async () => {
    const client = createQueryClient();
    const fetcher = vi.fn(async () => 'fresh-data');
    const options = { queryKey: ['query:cache'], queryFn: fetcher, staleTime: 60_000 };

    await expect(client.fetchQuery(options)).resolves.toBe('fresh-data');
    await expect(client.fetchQuery(options)).resolves.toBe('fresh-data');
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('invalidates all compatible prefixed keys', async () => {
    const client = createQueryClient();
    client.setQueryData(['feed:recent'], { count: 10 });
    client.setQueryData(['feed:popular'], { count: 20 });
    client.setQueryData(['profile'], { id: 1 });

    await invalidateQueryPrefix(client, 'feed');

    expect(client.getQueryState(['feed:recent'])?.isInvalidated).toBe(true);
    expect(client.getQueryState(['feed:popular'])?.isInvalidated).toBe(true);
    expect(client.getQueryState(['profile'])?.isInvalidated).toBe(false);
  });
});

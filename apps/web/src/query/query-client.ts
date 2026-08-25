export interface QueryCacheEntry<T = any> {
  data: T | null;
  timestamp: number;
  error: any;
}

export interface QueryOptions {
  staleTime?: number; // milliseconds data remains fresh (default: 5 mins = 300,000ms)
  forceRefetch?: boolean;
}

export class QueryClient {
  private cache = new Map<string, QueryCacheEntry>();
  private inflight = new Map<string, Promise<any>>();
  private subscribers = new Map<string, Set<() => void>>();
  private defaultStaleTime = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch data with automatic in-flight request deduplication and stale-time caching.
   * If a matching request is already in-flight, returns the active promise (1 network call).
   */
  async fetchQuery<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: QueryOptions
  ): Promise<T> {
    const staleTime = options?.staleTime ?? this.defaultStaleTime;
    const forceRefetch = options?.forceRefetch ?? false;

    if (!forceRefetch) {
      // 1. In-flight request deduplication: return active fetch promise
      if (this.inflight.has(key)) {
        return this.inflight.get(key) as Promise<T>;
      }

      // 2. Cache check: return valid cached data if within staleTime window
      const cached = this.cache.get(key);
      if (cached && cached.data !== null && Date.now() - cached.timestamp < staleTime) {
        return cached.data as T;
      }
    }

    // 3. Initiate single-flight network request
    const promise = (async () => {
      try {
        const data = await fetcher();
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          error: null,
        });
        this.notify(key);
        return data;
      } catch (error) {
        this.cache.set(key, {
          data: this.cache.get(key)?.data ?? null,
          timestamp: Date.now(),
          error,
        });
        this.notify(key);
        throw error;
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Read raw cached data for a query key.
   */
  getQueryData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    return (cached?.data as T) ?? null;
  }

  /**
   * Directly update cached data for a query key and notify subscribers.
   */
  setQueryData<T>(key: string, updater: T | ((old: T | null) => T)): void {
    const oldData = this.getQueryData<T>(key);
    const newData = typeof updater === 'function' ? (updater as any)(oldData) : updater;

    this.cache.set(key, {
      data: newData,
      timestamp: Date.now(),
      error: null,
    });
    this.notify(key);
  }

  /**
   * Invalidate query cache for a key (or matching regex) and notify subscribers.
   */
  invalidateQueries(keyPattern: string | RegExp): void {
    const keysToInvalidate: string[] = [];

    this.cache.forEach((_, key) => {
      if (typeof keyPattern === 'string') {
        if (key === keyPattern || key.startsWith(keyPattern)) {
          keysToInvalidate.push(key);
        }
      } else if (keyPattern.test(key)) {
        keysToInvalidate.push(key);
      }
    });

    keysToInvalidate.forEach((k) => {
      this.cache.delete(k);
      this.notify(k);
    });
  }

  /**
   * Subscribe to cache updates for a specific query key.
   */
  subscribe(key: string, listener: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    const set = this.subscribers.get(key)!;
    set.add(listener);

    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  /**
   * Notify all listener callbacks for a given query key.
   */
  private notify(key: string): void {
    const set = this.subscribers.get(key);
    if (set) {
      set.forEach((listener) => listener());
    }
  }

  /**
   * Clear all cache data and inflight promises.
   */
  clearCache(): void {
    this.cache.clear();
    this.inflight.clear();
    this.subscribers.clear();
  }
}

// Global Singleton QueryClient Instance
export const globalQueryClient = new QueryClient();

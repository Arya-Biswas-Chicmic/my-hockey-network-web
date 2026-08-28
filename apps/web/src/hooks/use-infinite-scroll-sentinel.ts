import { useEffect, useRef } from 'react';

export interface UseInfiniteScrollSentinelOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  /** Root margin so the fetch starts a little before the sentinel is
   * actually on-screen, matching how most feed UIs feel "instant." */
  rootMargin?: string;
}

function findScrollableAncestor(node: HTMLElement): HTMLElement | Window {
  let current = node.parentElement;
  while (current) {
    const style = getComputedStyle(current);
    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

/**
 * Returns a ref to drop on a sentinel element at the bottom of a list —
 * scrolling it into view calls `onLoadMore()`. Pairs with
 * `useInfiniteListQuery` (`query/use-infinite-query.ts`); kept as a
 * separate hook rather than baked into that one since not every infinite
 * list uses on-scroll fetching (a couple of profile tabs use it as a
 * simple "show more" trigger for now).
 *
 * Two independent triggers, not just one: an `IntersectionObserver` (the
 * primary mechanism) plus a plain `scroll` listener on the nearest
 * scrollable ancestor as a fallback — feedback 2026-08-29: "home page
 * scroll feed is not working... why working in the profile feed and not
 * home feed" using this exact same hook. Both call the same guarded
 * `maybeLoadMore`, so whichever fires first wins and the other is a no-op;
 * this trades a little redundancy for not depending on IntersectionObserver
 * alone triggering correctly in every layout/browser this hook ends up in.
 */
export function useInfiniteScrollSentinel({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = '200px',
}: UseInfiniteScrollSentinelOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return undefined;

    const maybeLoadMore = () => {
      if (hasNextPage && !isFetchingNextPage) onLoadMore();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) maybeLoadMore();
      },
      { rootMargin },
    );
    observer.observe(node);

    const scrollTarget = findScrollableAncestor(node);
    const handleScroll = () => {
      // Cheap synchronous check, not rAF-throttled — scroll fires often but
      // this is a handful of getBoundingClientRect reads, and correctness
      // (never missing the one moment the sentinel crosses the threshold)
      // matters more here than shaving a rare extra layout read.
      const rect = node.getBoundingClientRect();
      const viewportHeight = scrollTarget === window
        ? window.innerHeight
        : (scrollTarget as HTMLElement).getBoundingClientRect().bottom;
      if (rect.top <= viewportHeight + 200) maybeLoadMore();
    };
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rootMargin]);

  return sentinelRef;
}

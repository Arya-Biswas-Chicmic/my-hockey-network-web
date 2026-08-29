import { getFeed } from '@my-hockey-network/core';
import { mapFeedPosts } from '@/components/features/home/map-feed-posts';
import { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FetchFeedPageParams } from '@/types/feed.types';
import type { InfinitePage } from '@/query/use-infinite-query';

export class FeedService {
  /**
   * Cursor-paginated feed page for `useInfiniteListQuery` (see `useHomeFeed`
   * — feedback 2026-08-28: "home page feed scroll is not working", i.e.
   * nothing ever loaded past the first page). Mirrors `getUserPosts`'s
   * `ProfilePostsTab` wiring. Errors propagate (not swallowed here), so the
   * presentation layer can keep the failure visible while rendering its
   * explicitly requested preview records; fixtures never enter this service
   * or the TanStack cache.
   */
  static async fetchFeedPage({
    profileId,
    query,
    sortBy = 'RECENT',
    cursor,
    limit = 10,
  }: FetchFeedPageParams): Promise<InfinitePage<FeedPostProps>> {
    const normalizedQuery = query && query.trim().length >= 2 ? query.trim() : undefined;
    const res = await getFeed({ query: normalizedQuery, sortBy, cursor, limit });
    return {
      items: mapFeedPosts(res.items, { profileId }),
      nextCursor: res.nextCursor,
    };
  }
}

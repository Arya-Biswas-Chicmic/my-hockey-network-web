import { getFeed } from '@my-hockey-network/core';
import { globalQueryClient } from '@/query';
import { feedQueryKey } from '@/hooks/use-feed-query';
import { mapFeedPosts } from '@/components/features/home/map-feed-posts';
import { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FetchFeedParams, FetchFeedPageParams } from '@/types/feed.types';
import type { InfinitePage } from '@/query/use-infinite-query';

/** Demo fallback when the real feed has genuinely no posts on its first
 * page — see `useHomeFeed`, which is the only place this is applied (only
 * once, only when a resolved first page is empty), not this module. */
export const FIGMA_MOCK_POSTS: FeedPostProps[] = [
  {
    id: 'figma-post-1',
    authorName: 'KC Blueknocks',
    authorAvatar: '/KCBluenocks.webp',
    authorRole: 'Official Team',
    authorTime: '1d',
    content: "First tournament of the season! Let's go!",
    postImage: '/playHockey.webp',
    images: ['/playHockey.webp', '/classic.webp', '/event1.webp'],
    likesCount: 13,
    commentsCount: 2,
    repostCount: 1,
    isFollowing: false,
    isSelf: false,
  },
  {
    id: 'figma-post-2',
    authorName: 'San Jose Sharks',
    authorAvatar: '/event1.webp',
    authorRole: 'created an event · Group',
    authorTime: '1d',
    content: '',
    postImage: '/classic.webp',
    eventDateTag: 'WED, 26 AUG AT 10:00 IST',
    likesCount: 0,
    commentsCount: 0,
    repostCount: 0,
    isFollowing: false,
    isSelf: false,
  },
];

export class FeedService {
  static async fetchFeed({
    profileId,
    query,
    sortBy = 'RECENT',
    limit = 20,
  }: FetchFeedParams): Promise<FeedPostProps[]> {
    const normalizedQuery = query && query.trim().length >= 2 ? query.trim() : undefined;

    try {
      const feedResValue = await globalQueryClient.fetchQuery({
        queryKey: feedQueryKey({ sortBy, query: normalizedQuery, limit }),
        queryFn: () => getFeed({ query: normalizedQuery, sortBy, limit }),
        staleTime: 5 * 60 * 1000,
      });

      const itemsList = feedResValue.items;

      if (itemsList && itemsList.length > 0) {
        const mapped = mapFeedPosts(itemsList, {
          profileId,
        });
        return [...FIGMA_MOCK_POSTS, ...mapped];
      }
    } catch {
      // Fallback to Figma mock posts if API call fails or returns empty
    }

    return FIGMA_MOCK_POSTS;
  }

  /**
   * Cursor-paginated feed page for `useInfiniteListQuery` (see `useHomeFeed`
   * — feedback 2026-08-28: "home page feed scroll is not working", i.e.
   * nothing ever loaded past the first page). Mirrors `getUserPosts`'s
   * `ProfilePostsTab` wiring. Errors propagate (not swallowed here) so
   * `useHomeFeed` can surface the existing `ServerDown` state instead of
   * silently returning demo posts on a real transport/server failure —
   * matches docs/DEMO_DATA_POLICY.md: "A failed request remains an error;
   * fallback is for absent/empty display data, not for concealing
   * transport or server failures."
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


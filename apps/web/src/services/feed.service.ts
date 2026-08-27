import { getFeed } from '@my-hockey-network/core';
import { globalQueryClient } from '@/query';
import { feedQueryKey } from '@/hooks/use-feed-query';
import { mapFeedPosts } from '@/components/features/home/map-feed-posts';
import { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FetchFeedParams } from '@/types/feed.types';

const FIGMA_MOCK_POSTS: FeedPostProps[] = [
  {
    id: 'figma-post-1',
    authorName: 'KC Blueknocks',
    authorAvatar: '/KCBluenocks.png',
    authorRole: 'Official Team',
    authorTime: '1d',
    content: "First tournament of the season! Let's go!",
    postImage: '/playHockey.png',
    images: ['/playHockey.png', '/classic.png', '/event1.png'],
    likesCount: 13,
    commentsCount: 2,
    repostCount: 1,
    isFollowing: false,
    isSelf: false,
  },
  {
    id: 'figma-post-2',
    authorName: 'San Jose Sharks',
    authorAvatar: '/event1.png',
    authorRole: 'created an event · Group',
    authorTime: '1d',
    content: '',
    postImage: '/classic.png',
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
}


import { getFeed } from '@my-hockey-network/core';
import { globalQueryClient } from '@/query';
import { feedQueryKey } from '@/hooks/use-feed-query';
import { mapFeedPosts } from '@/components/features/home/map-feed-posts';
import { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FetchFeedParams } from '@/types/feed.types';

export class FeedService {
  static async fetchFeed({
    profileId,
    query,
    sortBy = 'RECENT',
    limit = 20,
  }: FetchFeedParams): Promise<FeedPostProps[]> {
    const normalizedQuery = query && query.trim().length >= 2 ? query.trim() : undefined;

    const feedResValue = await globalQueryClient.fetchQuery({
      queryKey: feedQueryKey({ sortBy, query: normalizedQuery, limit }),
      queryFn: () => getFeed({ query: normalizedQuery, sortBy, limit }),
      staleTime: 5 * 60 * 1000,
    });

    const itemsList = feedResValue.items;

    if (itemsList && itemsList.length > 0) {
      return mapFeedPosts(itemsList, {
        profileId,
      });
    }

    return [];
  }
}

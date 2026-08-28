import { useEffect, useMemo, useState } from 'react';
import { QueryKeys } from '@my-hockey-network/contracts';
import { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FeedService, FIGMA_MOCK_POSTS } from '@/services/feed.service';
import { useInfiniteListQuery } from '@/query/use-infinite-query';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorStatus, extractErrorMessage } from '@/utils/toast';
import { HomeFeedTab } from '@/types/home.types';
import { SEARCH_DEBOUNCE_MS } from '@/constants/home.constants';

export interface FeedErrorState {
  isServerError: boolean;
  message?: string;
  statusCode?: number;
}

/**
 * Home feed: cursor-paginated via `useInfiniteListQuery` (feedback
 * 2026-08-28: "home page feed scroll is not working" — the feed only ever
 * showed its first page; `Feed`'s sentinel now calls `fetchNextPage` the
 * same way `ProfilePostsTab` already does for `getUserPosts`).
 */
export function useHomeFeed() {
  const { user, loadAuthMe } = useAuth();
  const [activeFeedTab, setActiveFeedTab] = useState<HomeFeedTab>(HomeFeedTab.FOR_YOU);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const [sortBy, setSortBy] = useState<'RECENT' | 'POPULAR' | 'TRENDING'>('RECENT');

  // Resolve the signed-in profile once before the first feed fetch — mirrors
  // the previous ref-guarded effect, just without owning the fetch itself.
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        try {
          await loadAuthMe();
        } catch (err: unknown) {
          console.warn('Home Feed auth resolve error:', extractErrorMessage(err));
        }
      }
      if (!cancelled) setIsAuthResolved(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const profileId = user?.profile?.id || user?.id;

  const queryKey = useMemo(
    () => [QueryKeys.FEED_POSTS, profileId ?? 'anon', debouncedSearchQuery, sortBy].join(':'),
    [profileId, debouncedSearchQuery, sortBy],
  );

  const feedQuery = useInfiniteListQuery<FeedPostProps>(
    isAuthResolved ? queryKey : null,
    isAuthResolved
      ? (cursor) =>
          FeedService.fetchFeedPage({
            profileId,
            query: debouncedSearchQuery,
            sortBy,
            cursor,
            limit: 10,
          })
      : null,
    { staleTime: 5 * 60 * 1000 },
  );

  const feedError: FeedErrorState | null = feedQuery.error
    ? {
        isServerError: true,
        statusCode: getApiErrorStatus(feedQuery.error) || 502,
        message: extractErrorMessage(
          feedQuery.error,
          'Something went wrong while connecting to the server. Please try again.',
        ),
      }
    : null;

  // Demo fallback only once the first page has genuinely resolved empty —
  // never while still loading (that flashed demo content before real posts
  // arrived, per this session's Profile Posts review finding) and never on
  // a real fetch error (that's `feedError`'s job, not a fallback's).
  const feedPosts =
    !feedQuery.isLoading && !feedError && feedQuery.items.length === 0
      ? FIGMA_MOCK_POSTS
      : feedQuery.items;

  const handleFollowChange = (targetAuthorKey: string, targetFollowingState: boolean) => {
    // Cache-level optimistic update isn't wired for the infinite query yet;
    // FeedPostCard already reflects the new follow state locally via its
    // own mutation state, so this is a no-op placeholder kept for prop
    // compatibility with existing call sites.
    void targetAuthorKey;
    void targetFollowingState;
  };

  const handlePostDeleteSuccess = (_deletedId: string) => {
    void _deletedId;
    void feedQuery.refetch();
  };

  const handlePostUpdateSuccess = (_updatedId: string, _newContent: string) => {
    void _updatedId;
    void _newContent;
    void feedQuery.refetch();
  };

  const handleRepostComplete = () => {
    void feedQuery.refetch();
  };

  const refreshFeed = async () => {
    await feedQuery.refetch();
  };

  return {
    activeFeedTab,
    setActiveFeedTab,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    sortBy,
    setSortBy,
    isPageLoading: !isAuthResolved || (feedQuery.isLoading && feedQuery.items.length === 0),
    isFeedRefreshing: feedQuery.isLoading,
    feedPosts,
    feedError,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    onLoadMore: feedQuery.fetchNextPage,
    handleFollowChange,
    handlePostDeleteSuccess,
    handlePostUpdateSuccess,
    handleRepostComplete,
    refreshFeed,
  };
}

import { useEffect, useMemo, useState } from 'react';
import { QueryKeys } from '@my-hockey-network/contracts';
import { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FeedService } from '@/services/feed.service';
import { getHomeFeedDemoPosts } from '@/demo-data/home';
import { useInfiniteListQuery } from '@/query/use-infinite-query';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/hooks/use-auth';
import { canViewFeed } from '@my-hockey-network/domain';
import { getApiErrorStatus, extractErrorMessage } from '@/utils/toast';
import { HomeFeedTab } from '@/types/home.types';
import { SEARCH_DEBOUNCE_MS } from '@/constants/home.constants';
import { resolveMediaUrl } from '@/utils/mediaUtils';

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
  const { user, loadAuthMe, supervisionPermissions } = useAuth();
  const [activeFeedTab, setActiveFeedTab] = useState<HomeFeedTab>(HomeFeedTab.FOR_YOU);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const [sortBy, setSortBy] = useState<'RECENT' | 'POPULAR' | 'TRENDING'>('RECENT');

  // Resolve the signed-in profile once before the first feed fetch — mirrors
  // the previous ref-guarded effect, just without owning the fetch itself.
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

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

  // A guardian who disables VIEW_FEED expects the child not to read the feed,
  // so the request is never made rather than fetched and then hidden — post
  // content should not reach a browser that is not allowed to show it.
  const mayViewFeed = useMemo(
    () => canViewFeed(user, (supervisionPermissions as Record<string, boolean | string> | null) ?? null),
    [user, supervisionPermissions],
  );
  const shouldFetchFeed = isAuthResolved && mayViewFeed;

  const feedQuery = useInfiniteListQuery<FeedPostProps>(
    shouldFetchFeed ? queryKey : null,
    shouldFetchFeed
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

  useEffect(() => {
    if (isAuthResolved && !feedQuery.isLoading) {
      setHasInitialLoaded(true);
    }
  }, [isAuthResolved, feedQuery.isLoading]);

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

  // Demo/local posts are intentional filler, not an empty-state fallback —
  // product direction 2026-08-29: "demo posts were added purposely to show
  // how the feed page will look... after getting feed from APIs we will
  // append the local feed." So real API posts always come first (never
  // shown while still loading — `Feed`'s own `isLoading` branch renders the
  // skeleton instead of `feedPosts` for that), and the local set is always
  // appended after them, whether the real page came back empty, partial, or
  // full. Do not gate this on `feedQuery.items.length` again — a prior pass
  // in this session did that by mistake, treating it as a demo-data-policy
  // violation when it's actually the intended feed composition.
  const viewer = useMemo(
    () => ({
      name: user?.profile?.displayName || undefined,
      avatar: user?.profile?.avatarUrl ? resolveMediaUrl(user.profile.avatarUrl) : undefined,
      role: user?.profile?.roleTag || user?.primaryRole || undefined,
    }),
    [user],
  );

  const demoPosts = useMemo(() => {
    const normalizedSearch = debouncedSearchQuery.trim().toLowerCase();
    const posts = getHomeFeedDemoPosts(activeFeedTab, viewer);
    if (!normalizedSearch) return posts;
    return posts.filter((post) =>
      `${post.authorName} ${post.authorRole ?? ''} ${post.content}`.toLowerCase().includes(normalizedSearch),
    );
  }, [activeFeedTab, debouncedSearchQuery, viewer]);

  // API data remains authoritative and stays first; the local set is always
  // appended after it in this presentation model only (never written into
  // the TanStack cache, so it never gets treated as real, paginated data).
  const feedPosts = useMemo(
    () => activeFeedTab === HomeFeedTab.FOR_YOU
      ? [...feedQuery.items, ...demoPosts]
      : [...demoPosts],
    [activeFeedTab, demoPosts, feedQuery.items],
  );

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
    isPageLoading: !hasInitialLoaded,
    isFeedRefreshing: feedQuery.isLoading,
    feedPosts,
    feedError: activeFeedTab === HomeFeedTab.FOR_YOU ? feedError : null,
    hasNextPage: activeFeedTab === HomeFeedTab.FOR_YOU && feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    onLoadMore: feedQuery.fetchNextPage,
    handleFollowChange,
    handlePostDeleteSuccess,
    handlePostUpdateSuccess,
    handleRepostComplete,
    refreshFeed,
  };
}

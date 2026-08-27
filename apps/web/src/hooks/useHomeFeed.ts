import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FeedService } from '@/services/feed.service';
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

export function useHomeFeed() {
  const { user, loadAuthMe } = useAuth();
  const [activeFeedTab, setActiveFeedTab] = useState<HomeFeedTab>(HomeFeedTab.FOR_YOU);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const [sortBy, setSortBy] = useState<'RECENT' | 'POPULAR' | 'TRENDING'>('RECENT');
  
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isFeedRefreshing, setIsFeedRefreshing] = useState<boolean>(false);
  const [feedPosts, setFeedPosts] = useState<FeedPostProps[]>([]);
  const [feedError, setFeedError] = useState<FeedErrorState | null>(null);

  const hasLoadedFeedRef = useRef<boolean>(false);

  const fetchFeedPosts = useCallback(
    async (
      currentProfileId?: string,
      queryTerm?: string,
      sortTerm: 'RECENT' | 'POPULAR' | 'TRENDING' = 'RECENT',
      silent: boolean = false
    ) => {
      if (!silent) {
        setIsFeedRefreshing(true);
      }
      try {
        const q = queryTerm !== undefined ? queryTerm : searchQuery;
        const s = sortTerm !== undefined ? sortTerm : sortBy;
        const targetProfileId = currentProfileId || user?.profile?.id || user?.id;

        const posts = await FeedService.fetchFeed({
          profileId: targetProfileId,
          query: q,
          sortBy: s,
        });

        setFeedPosts(posts);
        setFeedError(null);
      } catch (err: unknown) {
        if (!silent) {
          setFeedPosts([]);
          setFeedError({
            isServerError: true,
            statusCode: getApiErrorStatus(err) || 502,
            message: extractErrorMessage(
              err,
              'Something went wrong while connecting to the server. Please try again.'
            ),
          });
        }
      } finally {
        if (!silent) {
          setIsFeedRefreshing(false);
        }
      }
    },
    [searchQuery, sortBy, user]
  );

  useEffect(() => {
    if (hasLoadedFeedRef.current) return;
    hasLoadedFeedRef.current = true;

    async function loadInitialData() {
      setIsPageLoading(true);
      try {
        let currentUser = user;
        if (!currentUser) {
          currentUser = await loadAuthMe();
        }
        const profileId = currentUser?.profile?.id || currentUser?.id;
        await fetchFeedPosts(profileId, searchQuery, sortBy);
      } catch (err: unknown) {
        console.warn('Home Feed initial load error:', extractErrorMessage(err));
      } finally {
        setIsPageLoading(false);
      }
    }

    loadInitialData();
  }, [user, loadAuthMe, fetchFeedPosts, searchQuery, sortBy]);

  useEffect(() => {
    if (!hasLoadedFeedRef.current) return;
    const profileId = user?.profile?.id || user?.id;
    fetchFeedPosts(profileId, debouncedSearchQuery, sortBy);
  }, [debouncedSearchQuery, sortBy, user, fetchFeedPosts]);

  const handleFollowChange = useCallback((targetAuthorKey: string, targetFollowingState: boolean) => {
    setFeedPosts((prevPosts) =>
      prevPosts.map((post) => {
        if ((post.authorId && post.authorId === targetAuthorKey) || post.authorName === targetAuthorKey) {
          return { ...post, isFollowing: targetFollowingState };
        }
        return post;
      })
    );
  }, []);

  const handlePostDeleteSuccess = useCallback(
    (deletedId: string) => {
      setFeedPosts((prev) => prev.filter((p) => p.id !== deletedId));
      const profileId = user?.profile?.id || user?.id;
      fetchFeedPosts(profileId, searchQuery, sortBy, true);
    },
    [user, searchQuery, sortBy, fetchFeedPosts]
  );

  const handlePostUpdateSuccess = useCallback((updatedId: string, newContent: string) => {
    setFeedPosts((prevPosts) =>
      prevPosts.map((item) => (item.id === updatedId ? { ...item, content: newContent } : item))
    );
  }, []);

  const handleRepostComplete = useCallback(() => {
    const profileId = user?.profile?.id || user?.id;
    fetchFeedPosts(profileId, searchQuery, sortBy, true);
  }, [user, searchQuery, sortBy, fetchFeedPosts]);

  const refreshFeed = useCallback(async () => {
    const profileId = user?.profile?.id || user?.id;
    await fetchFeedPosts(profileId, searchQuery, sortBy);
  }, [user, searchQuery, sortBy, fetchFeedPosts]);

  return {
    activeFeedTab,
    setActiveFeedTab,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    sortBy,
    setSortBy,
    isPageLoading,
    isFeedRefreshing,
    feedPosts,
    feedError,
    handleFollowChange,
    handlePostDeleteSuccess,
    handlePostUpdateSuccess,
    handleRepostComplete,
    refreshFeed,
  };
}

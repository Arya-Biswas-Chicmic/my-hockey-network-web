import { Input } from '@/components/common/FormControls';
import React, { useState, useEffect, useRef } from 'react';
import { isEmailValid } from '@my-hockey-network/validation';
import { Button, PendingBanner, NoDataFound, ServerDown } from '@/components/common';
import { Sidebar } from '@/components/common/Sidebar';
import { FeedPostCard, FeedPostProps } from '@/components/features/home/FeedPostCard';
import { WhoToFollowWidget } from '@/components/features/home/WhoToFollowWidget';
import { UpcomingEventsWidget } from '@/components/features/home/UpcomingEventsWidget';
import { InviteGrowWidget } from '@/components/features/home/InviteGrowWidget';
import { CreatePostModal } from '@/components/features/home/CreatePostModal';
import { HomeSkeletonLoader, FeedPostSkeleton } from '@/components/features/home/HomeSkeletonLoader';
import { getFeed } from '@my-hockey-network/core';
import { Search } from 'lucide-react';
import { QueryKeys, NavTabEnum, PostAudienceEnum } from '@my-hockey-network/contracts';
import { useAuth } from '@/hooks/use-auth';
import { globalQueryClient, invalidateQueryPrefix } from '@/query';
import { useCreatePostMutation } from '@/hooks/use-post-mutations';
import { feedQueryKey } from '@/hooks/use-feed-query';

import { resolveMediaUrl } from '@/utils/mediaUtils';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { extractErrorMessage, getApiErrorStatus, showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HELPER_MESSAGES } from '@my-hockey-network/constants';
import { mapFeedPosts } from '@/components/features/home/map-feed-posts';


interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

interface PostPrivacySettings {
  audience: string;
  shareWith?: string;
  dontShareWith?: string;
  locationTag?: string;
}

export const HomePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { user, loadAuthMe } = useAuth();
  const { permissions, requirePermission } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState<NavTabEnum | string>(NavTabEnum.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const createPostMutation = useCreatePostMutation();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [feedPosts, setFeedPosts] = useState<FeedPostProps[]>([]);
  const [sortBy, setSortBy] = useState<'RECENT' | 'POPULAR' | 'TRENDING'>('RECENT');
  const [feedError, setFeedError] = useState<{ isServerError: boolean; message?: string; statusCode?: number } | null>(null);
  const [isFeedRefreshing, setIsFeedRefreshing] = useState<boolean>(false);
  // "Network"/"Groups" have no backend filter yet (no connections-only or
  // group-post feed endpoint) — real per-project policy is an honest empty
  // state over fabricating a filtered result, not silently no-op-ing the tab.
  const [feedScope, setFeedScope] = useState<'FOR_YOU' | 'NETWORK' | 'GROUPS'>('FOR_YOU');

  const currentUserName = user?.profile?.displayName || 'Player';
  const currentUserAvatar = resolveMediaUrl(user?.profile?.avatarUrl, '/userPlaceholder.png');

  const fetchFeedPosts = async (
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
      const normalizedQuery = q && q.trim().length >= 2 ? q.trim() : undefined;
      const limit = 20;

      const feedResValue = await globalQueryClient.fetchQuery({
        queryKey: feedQueryKey({ sortBy: s, query: normalizedQuery, limit }),
        queryFn: () => getFeed({ query: normalizedQuery, sortBy: s, limit }),
        staleTime: 5 * 60 * 1000,
      });

      const itemsList = feedResValue.items;

      if (itemsList && itemsList.length > 0) {
        const mappedPosts = mapFeedPosts(itemsList, {
          profileId: currentProfileId || user?.profile?.id || user?.id,
          userId: user?.id,
        });

        setFeedPosts(mappedPosts);
      } else {
        setFeedPosts([]);
      }
      setFeedError(null);
    } catch (err: unknown) {
      if (!silent) {
        setFeedPosts([]);
        setFeedError({
          isServerError: true,
          statusCode: getApiErrorStatus(err) || 502,
          message: extractErrorMessage(err, 'Something went wrong while connecting to the server. Please try again.'),
        });
      }
    } finally {
      if (!silent) {
        setIsFeedRefreshing(false);
      }
    }
  };

  const handleFollowChange = (targetAuthorKey: string, targetFollowingState: boolean) => {
    setFeedPosts((prevPosts) =>
      prevPosts.map((post) => {
        if ((post.authorId && post.authorId === targetAuthorKey) || post.authorName === targetAuthorKey) {
          return { ...post, isFollowing: targetFollowingState };
        }
        return post;
      })
    );
  };

  const hasLoadedFeedRef = useRef<boolean>(false);

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
        console.warn('HomePage data fetch notice:', extractErrorMessage(err));
      } finally {
        setIsPageLoading(false);
      }
    }

    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (!hasLoadedFeedRef.current) return;
    const profileId = user?.profile?.id || user?.id;
    fetchFeedPosts(profileId, debouncedSearchQuery, sortBy);
  }, [debouncedSearchQuery, sortBy]);

  const filteredPosts = feedPosts;

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePost = async (content: string, postImage?: string, privacySettings?: PostPrivacySettings, imageFile?: File) => {
    if (!requirePermission()) return;
    let audienceEnum: PostAudienceEnum = PostAudienceEnum.PUBLIC;
    if (privacySettings?.audience === 'Connections') {
      audienceEnum = PostAudienceEnum.CONNECTIONS;
    } else if (privacySettings?.audience === 'Groups') {
      audienceEnum = PostAudienceEnum.GROUP;
    } else if (privacySettings?.audience === 'Custom') {
      audienceEnum = PostAudienceEnum.PRIVATE;
    }

    const parseEmails = (input?: string): string[] | undefined => {
      if (!input || !input.trim()) return undefined;
      const emails = input
        .split(/[, \n;]+/)
        .map((e) => e.trim())
        .filter((e) => isEmailValid(e));
      return emails.length > 0 ? emails : undefined;
    };

    try {
      const dto = {
        body: content,
        audience: audienceEnum,
        placeName: privacySettings?.locationTag || undefined,
        shareWithEmails: parseEmails(privacySettings?.shareWith),
        hideFromEmails: parseEmails(privacySettings?.dontShareWith),
      };

      const res = await createPostMutation.mutateAsync({ dto, imageFile });

      // ALWAYS destroy feed cache and immediately call GET /v1/feed?limit=20&sortBy=RECENT
      globalQueryClient.removeQueries({ queryKey: [QueryKeys.FEED_POSTS] });
      await invalidateQueryPrefix(globalQueryClient, QueryKeys.FEED_POSTS);
      setSortBy('RECENT');
      const activeProfId = user?.profile?.id || user?.id;
      await fetchFeedPosts(activeProfId, undefined, 'RECENT');

      const isPendingApproval = Boolean(
        res?.message === 'POST_PENDING_APPROVAL' ||
        res?.pendingGuardianApproval ||
        res?.data?.pendingGuardianApproval ||
        res?.data?.post?.isDraft
      );

      if (isPendingApproval) {
        showInfoToast(HELPER_MESSAGES.GUARDIAN_APPROVAL_SUBMITTED);
      } else {
        showSuccessToast(SUCCESS_MESSAGES.POST_CREATED);
      }
      setIsCreatePostOpen(false);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '');
      if (getApiErrorStatus(err) === 403 && (message.includes('GUARDIAN_DISABLED') || message.includes('guardian'))) {
        showErrorToast(err, ERROR_MESSAGES.GUARDIAN_DISABLED_THIS_ACTION);
      } else {
        showErrorToast(err, ERROR_MESSAGES.FAILED_CREATE_POST);
      }
    }
  };

  const handleOpenCreatePost = () => {
    if (requirePermission('CREATE_POST')) {
      setIsCreatePostOpen(true);
    }
  };

  if (isPageLoading) {
    return (
      <div className="mhn-app-shell">
        <Sidebar
          activeTab={activeNavTab}
          onTabChange={handleTabChange}
          onLogout={onLogout}
          onCreatePostClick={handleOpenCreatePost}
        />
        <div className="mhn-app-content">
          <HomeSkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="mhn-app-shell">
      <Sidebar
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        onCreatePostClick={handleOpenCreatePost}
      />

      <div className="mhn-app-content mhn-home-page-root min-h-dvh lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
        {!permissions.allowed && permissions.message && (
          <PendingBanner
            message={permissions.message}
            actionText={permissions.ctaText || 'Complete Profile'}
            onActionClick={() => {
              if (permissions.ctaAction === 'COMPLETE_PROFILE') {
                if (onNavigate) onNavigate('profile');
              } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
                if (onNavigate) onNavigate('supervision');
              } else if (permissions.ctaAction === 'LOGIN') {
                if (onNavigate) onNavigate('login');
              }
            }}
          />
        )}

        <main className="mhn-home-main-layout lg:my-0 lg:min-h-0 lg:flex-1 lg:py-6">
          <section className="mhn-layout-col-center lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
            <div className="mhn-feed-scope-tabs">
              {([
                { key: 'FOR_YOU', label: 'For You' },
                { key: 'NETWORK', label: 'Network' },
                { key: 'GROUPS', label: 'Groups' },
              ] as const).map((scope) => (
                <Button
                  key={scope.key}
                  onClick={() => setFeedScope(scope.key)}
                  className={`mhn-feed-scope-tab ${feedScope === scope.key ? 'mhn-feed-scope-tab-active' : ''}`}
                >
                  {scope.label}
                </Button>
              ))}
            </div>

            {feedScope !== 'FOR_YOU' ? (
              <NoDataFound
                title={feedScope === 'NETWORK' ? 'Network feed coming soon' : 'Groups feed coming soon'}
                description={
                  feedScope === 'NETWORK'
                    ? "A feed of just your connections' posts isn't available yet."
                    : "A feed of your groups' posts isn't available yet."
                }
              />
            ) : (
              <>
                {isFeedRefreshing ? (
                  <div className="mhn-col-flex-gap-16">
                    <FeedPostSkeleton />
                  </div>
                ) : feedError?.isServerError ? (
                  <ServerDown
                    title="We’re having trouble loading your feed"
                    description={feedError.message || "Something went wrong while connecting to the server. Please try again."}
                    statusCode={feedError.statusCode || 502}
                    onRetry={() => fetchFeedPosts(user?.profile?.id || user?.id)}
                  />
                ) : filteredPosts.length === 0 ? (
                  <NoDataFound
                    title="No Posts Found"
                    description={searchQuery ? `No posts match your search "${searchQuery}".` : "There are no posts in your feed right now. Be the first to share an update with your network!"}
                    actionLabel="Create Post"
                    onAction={handleOpenCreatePost}
                  />
                ) : (
                  <div className="mhn-feed-posts-stack">
                    {filteredPosts.map((post) => (
                      <FeedPostCard
                        key={post.id}
                        {...post}
                        onNavigate={onNavigate}
                        onFollowChange={handleFollowChange}
                        onDeleteSuccess={(deletedId) => {
                          setFeedPosts((prev) => prev.filter((p) => p.id !== deletedId));
                          const profileId = user?.profile?.id || user?.id;
                          fetchFeedPosts(profileId, searchQuery, sortBy, true);
                        }}

                        onUpdateSuccess={(updatedId, newContent) => {
                          setFeedPosts((previousPosts) => previousPosts.map((item) =>
                            item.id === updatedId ? { ...item, content: newContent } : item
                          ));
                          void invalidateQueryPrefix(globalQueryClient, QueryKeys.FEED_POSTS);
                        }}

                        onRepostComplete={() => {
                          const profileId = user?.profile?.id || user?.id;
                          fetchFeedPosts(profileId, searchQuery, sortBy, true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="mhn-layout-col-right lg:h-full lg:overflow-hidden">
            {/* Figma puts the search bar in the right column, above "Who to
                follow" (figma.com/design/cqlBXHZtqPkKcLRmR6a1B8, node
                1398:3904) — not above the feed tabs in the center column. */}
            <div className="mhn-feed-search-wrapper mhn-feed-search-wrapper-standalone">
              <Search className="mhn-feed-search-icon" size={16} aria-hidden="true" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="mhn-feed-search-input"
              />
            </div>

            <WhoToFollowWidget onViewAll={() => handleTabChange('network')} />

            <UpcomingEventsWidget
              onViewAll={() => handleTabChange('events')}
              onEventClick={() => handleTabChange('event-detail')}
            />

            <InviteGrowWidget
              onInviteClick={() => showInfoToast('Member invitations are not available yet.')}
              illustrationUrl="/player.png"
            />
          </aside>
        </main>

        {isCreatePostOpen && (
          <CreatePostModal
            isOpen={isCreatePostOpen}
            onClose={() => setIsCreatePostOpen(false)}
            onSubmit={handleCreatePost}
            isLoading={createPostMutation.isPending}
            userName={currentUserName}
            userAvatar={currentUserAvatar}
          />
        )}
      </div>
    </div>
  );
};

import { Input, Select, Dropdown } from '../components/common/FormControls';
import React, { useState, useEffect, useRef } from 'react';
import { maskEmail, isEmailValid } from '@my-hockey-network/validation';
import { Header, PendingBanner, NoDataFound, ServerDown } from '../components/common';
import { ProfileSummaryCard } from '../components/features/home/ProfileSummaryCard';
import { FeedPostCard, FeedPostProps } from '../components/features/home/FeedPostCard';
import { MatchesWidget } from '../components/features/home/MatchesWidget';
import { UpcomingEventsWidget } from '../components/features/home/UpcomingEventsWidget';
import { InviteGrowWidget } from '../components/features/home/InviteGrowWidget';
import { CreatePostModal } from '../components/features/home/CreatePostModal';
import { EmptyState } from '../components/features/network/EmptyState';
import { HomeSkeletonLoader, FeedPostSkeleton } from '../components/features/home/HomeSkeletonLoader';
import { AuthMeResponse, createPost, getFeed, uploadMediaFile, completeMediaUpload } from '@my-hockey-network/core';
import { QueryKeys, NavTabEnum, PostAudienceEnum } from '@my-hockey-network/contracts';
import { useAuth } from '../hooks/use-auth';
import { globalQueryClient } from '../query';

import { resolveCoverUrl } from '../utils/mediaUtils';
import { useFeedPermissions } from '../hooks/use-feed-permissions';
import { useDebounce } from '../hooks/use-debounce';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HELPER_MESSAGES } from '@my-hockey-network/constants';


interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const HomePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { user, loadAuthMe } = useAuth();
  const { permissions, requirePermission } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState<NavTabEnum | string>(NavTabEnum.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [userSession] = useState<AuthMeResponse | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [feedPosts, setFeedPosts] = useState<FeedPostProps[]>([]);
  const [sortBy, setSortBy] = useState<'RECENT' | 'POPULAR' | 'TRENDING'>('RECENT');
  const [feedError, setFeedError] = useState<{ isServerError: boolean; message?: string; statusCode?: number } | null>(null);
  const [isFeedRefreshing, setIsFeedRefreshing] = useState<boolean>(false);

  const currentUserName = user?.profile?.displayName || userSession?.profile?.displayName || (userSession as any)?.displayName || 'Player';
  const currentUserAvatar = user?.profile?.avatarUrl || userSession?.profile?.avatarUrl || (userSession as any)?.avatarUrl || '/userPlaceholder.png';

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
      const cacheKey = `${QueryKeys.FEED_POSTS}:${s}:${q || ''}`;

      const feedResValue = await globalQueryClient.fetchQuery(
        cacheKey,
        () =>
          getFeed({
            query: q && q.trim().length >= 2 ? q.trim() : undefined,
            sortBy: s,
            limit: 20,
          }),
        { staleTime: 5 * 60 * 1000 }
      );

      const feedData = (feedResValue as any)?.data || feedResValue;
      const itemsList = feedData?.items || (Array.isArray(feedData) ? feedData : []);

      if (itemsList && itemsList.length > 0) {
        const mappedPosts: FeedPostProps[] = itemsList.map((wrapper: any) => {
          const postObj = wrapper.post || wrapper;
          const reason = wrapper.reason || wrapper.postReason || '';
          const authorProf = postObj.authorProfile || postObj.author || {};
          const authorId = postObj.authorProfileId || authorProf.id;

          const authorProfId = authorProf.id || authorProf.profileId || postObj.authorProfileId;
          const authorUserId = authorProf.userId || authorProf.id;
          const activeMyProfileId = currentProfileId || user?.profile?.id || user?.id || (userSession as any)?.profile?.id || (userSession as any)?.id;
          const activeMyUserId = user?.id || (userSession as any)?.id;

          const isSelfPost = reason === 'SELF' ||
            (!!activeMyProfileId && (authorProfId === activeMyProfileId || authorProf.profileId === activeMyProfileId || postObj.authorProfileId === activeMyProfileId)) ||
            (!!activeMyUserId && (authorUserId === activeMyUserId || authorProfId === activeMyUserId));

          const roleSubtitle = authorProf.roleTag ||
            (authorProf.teamName && authorProf.position ? `${authorProf.teamName} • ${authorProf.position}` : null) ||
            authorProf.teamName ||
            (authorProf.position ? `${authorProf.position}${authorProf.jerseyNumber ? ` • #${authorProf.jerseyNumber}` : ''}` : null) ||
            authorProf.type ||
            authorProf.primaryRole ||
            'Official Team';

          return {
            id: postObj.id || `post_${Math.random()}`,
            authorId: authorId || authorProf.id || authorProf.displayName,
            authorName: authorProf.displayName || '-',
            authorRole: roleSubtitle,
            authorTime: postObj.publishedAt ? new Date(postObj.publishedAt).toLocaleDateString() : 'Recently',
            authorAvatar: authorProf.avatarUrl || '/userPlaceholder.png',
            content: postObj.body || '',
            postImage: postObj.media?.[0]?.url,
            likesCount: postObj.likeCount ?? postObj.reactionsCount ?? 0,
            commentsCount: postObj.commentCount ?? postObj.commentsCount ?? 0,
            repostCount: postObj.repostCount ?? postObj.repostsCount ?? postObj.sharesCount ?? 0,
            isFollowing: postObj.isFollowing ?? authorProf.isFollowing ?? false,
            isSelf: isSelfPost,
            userReaction: postObj.userReaction || postObj.post?.userReaction || null,
          };
        });

        setFeedPosts(mappedPosts);
      } else {
        setFeedPosts([]);
      }
      setFeedError(null);
    } catch (err: any) {
      if (!silent) {
        setFeedPosts([]);
        setFeedError({
          isServerError: true,
          statusCode: err?.statusCode || 502,
          message: err?.message || 'Something went wrong while connecting to the server. Please try again.',
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
      } catch (err: any) {
        console.warn('HomePage data fetch notice:', err.message || err);
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

  const handleCreatePost = async (content: string, postImage?: string, privacySettings?: any, imageFile?: File) => {
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

    setIsCreatingPost(true);
    try {
      let mediaIds: string[] | undefined = undefined;

      // Execute media upload pipeline if an image file was selected
      if (imageFile) {
        const uploadRes = await uploadMediaFile(imageFile, 'POST_IMAGE');
        const mediaId = uploadRes.mediaId || uploadRes.storageKey;
        if (mediaId) {
          mediaIds = [mediaId];
          try {
            await completeMediaUpload(mediaId);
          } catch (compErr) {
            console.warn('Media complete notice:', compErr);
          }
        }
      }

      const dto = {
        body: content,
        audience: audienceEnum,
        mediaIds,
        placeName: privacySettings?.locationTag || undefined,
        shareWithEmails: parseEmails(privacySettings?.shareWith),
        hideFromEmails: parseEmails(privacySettings?.dontShareWith),
      };

      const res = await createPost(dto);
      const isPendingApproval = Boolean(
        res?.message === 'POST_PENDING_APPROVAL' ||
        res?.pendingGuardianApproval ||
        res?.data?.pendingGuardianApproval ||
        res?.data?.post?.isDraft
      );

      if (isPendingApproval) {
        showInfoToast(HELPER_MESSAGES.GUARDIAN_APPROVAL_SUBMITTED);
      } else {
        const newPost: FeedPostProps = {
          id: res?.data?.post?.id || res?.id || `post-${feedPosts.length + 1}`,
          authorName: userSession?.profile?.displayName || currentUserName,
          authorRole: userSession?.primaryRole || currentUserRole,
          authorTime: 'Just now',
          authorAvatar: userSession?.profile?.avatarUrl || '/userPlaceholder.png',
          content,
          postImage,
          likesCount: 0,
          commentsCount: 0,
          isFollowing: false,
        };
        setFeedPosts([newPost, ...feedPosts]);
        globalQueryClient.invalidateQueries(QueryKeys.FEED_POSTS);
        showSuccessToast(SUCCESS_MESSAGES.POST_CREATED);
      }
      setIsCreatePostOpen(false);
    } catch (err: any) {
      if (err?.statusCode === 403 && (err?.message?.includes('GUARDIAN_DISABLED') || err?.message?.includes('guardian'))) {
        showErrorToast(err, ERROR_MESSAGES.GUARDIAN_DISABLED_THIS_ACTION);
      } else {
        showErrorToast(err, ERROR_MESSAGES.FAILED_CREATE_POST);
      }
    } finally {
      setIsCreatingPost(false);
    }
  };

  const currentUserRole = userSession?.profile?.type || userSession?.primaryRole || 'PLAYER';

  if (isPageLoading) {
    return (
      <div className="mhn-home-page-root">
        <Header
          activeTab={activeNavTab}
          onTabChange={handleTabChange}
          onLogout={onLogout}
        />
        <HomeSkeletonLoader />
      </div>
    );
  }

  return (
    <div className="mhn-home-page-root">
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

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

      <main className="mhn-home-main-layout">
        <aside className="mhn-layout-col-left">
          <ProfileSummaryCard
            coverUrl={resolveCoverUrl((user?.profile as any)?.coverImageUrl || (user?.profile as any)?.coverUrl, "/cover.png")}
            location={user?.profile?.city || "-"}
            teamLogo="/HC.png"
            followers="-"
            following="-"
            onPostClick={() => {
              if (requirePermission('CREATE_POST')) {
                setIsCreatePostOpen(true);
              }
            }}
          />
        </aside>

        <section className="mhn-layout-col-center">
          {(filteredPosts.length > 0 || searchQuery.trim().length > 0) && (
            <div className="mhn-feed-header-bar">
              <div className="mhn-feed-search-wrapper">
                <svg className="mhn-feed-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="mhn-feed-search-input"
                />
              </div>

              <div className="mhn-feed-sort-wrapper">
                <Dropdown
                  value={sortBy}
                  options={[
                    { value: 'RECENT', label: 'Sort by' },
                    { value: 'RECENT', label: 'Newest First' },
                    { value: 'POPULAR', label: 'Most Popular' },
                    { value: 'TRENDING', label: 'Trending (48h)' },
                  ]}
                  onChange={(val) => setSortBy(val as any)}
                  placeholder=""
                />
              </div>
            </div>
          )}

          {isFeedRefreshing ? (
            <div className="mhn-col-flex-gap-16">
              <FeedPostSkeleton />
            </div>
          ) : feedError?.isServerError ? (
            <ServerDown
              title="We’re having trouble loading your feed"
              description={feedError.message || "Something went wrong while connecting to the server. Please try again."}
              statusCode={feedError.statusCode || 502}
              onRetry={() => fetchFeedPosts(userSession?.profile?.id || userSession?.id)}
            />
          ) : filteredPosts.length === 0 ? (
            <NoDataFound
              title="No Posts Found"
              description={searchQuery ? `No posts match your search "${searchQuery}".` : "There are no posts in your feed right now. Be the first to share an update with your network!"}
              actionLabel="Create Post"
              onAction={() => setIsCreatePostOpen(true)}
            />
          ) : (
            <div className="mhn-feed-posts-stack">
              {filteredPosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  {...post}
                  onNavigate={onNavigate}
                  onFollowChange={handleFollowChange}
                  onDeleteSuccess={(deletedId, msg) => {
                    showSuccessToast(msg || SUCCESS_MESSAGES.POST_DELETED);
                    setFeedPosts((prev) => prev.filter((p) => p.id !== deletedId));
                    const profileId = userSession?.profile?.id || userSession?.id;
                    fetchFeedPosts(profileId, searchQuery, sortBy, true);
                  }}

                  onRepostComplete={() => {
                    const profileId = userSession?.profile?.id || userSession?.id;
                    fetchFeedPosts(profileId, searchQuery, sortBy, true);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="mhn-layout-col-right">
          <MatchesWidget
            onViewAll={() => alert('View all matches')}
          />

          <UpcomingEventsWidget
            onViewAll={() => handleTabChange('events')}
            onEventClick={() => handleTabChange('event-detail')}
          />

          <InviteGrowWidget
            onInviteClick={() => alert('Invite members modal')}
            illustrationUrl="/player.png"
          />
        </aside>
      </main>

      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmit={handleCreatePost}
          isLoading={isCreatingPost}
          userName={currentUserName}
          userAvatar={currentUserAvatar}
        />
      )}
    </div>
  );
};

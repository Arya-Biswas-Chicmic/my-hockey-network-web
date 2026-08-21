import React, { useState, useEffect, useRef } from 'react';
import { Header, PendingBanner, Toast, NoDataFound, ServerDown } from '../components/common';
import { ProfileSummaryCard } from '../components/features/home/ProfileSummaryCard';
import { FeedPostCard, FeedPostProps } from '../components/features/home/FeedPostCard';
import { MatchesWidget } from '../components/features/home/MatchesWidget';
import { UpcomingEventsWidget } from '../components/features/home/UpcomingEventsWidget';
import { InviteGrowWidget } from '../components/features/home/InviteGrowWidget';
import { CreatePostModal } from '../components/features/home/CreatePostModal';
import { EmptyState } from '../components/features/network/EmptyState';
import { HomeSkeletonLoader, FeedPostSkeleton } from '../components/features/home/HomeSkeletonLoader';
import { saveUserProfile, AuthMeResponse, createPost, getFeed, uploadMediaFile, completeMediaUpload } from '@my-hockey-network/core';
import { useAuth } from '../hooks/use-auth';

import { resolveCoverUrl } from '../utils/mediaUtils';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const HomePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { user, loadAuthMe } = useAuth();
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [userSession] = useState<AuthMeResponse | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
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

      const feedResValue = await getFeed({
        query: q && q.trim().length >= 2 ? q.trim() : undefined,
        sortBy: s,
        limit: 20,
      });

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
    if (searchQuery.trim().length === 1) return;

    const timer = setTimeout(() => {
      const profileId = user?.profile?.id || user?.id;
      fetchFeedPosts(profileId, searchQuery, sortBy);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, sortBy]);

  const filteredPosts = feedPosts;

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePost = async (content: string, postImage?: string, privacySettings?: any, imageFile?: File) => {
    let audienceEnum: 'PUBLIC' | 'CONNECTIONS' | 'GROUP' | 'CUSTOM' = 'PUBLIC';
    if (privacySettings?.audience === 'Groups') {
      audienceEnum = 'GROUP';
    } else if (privacySettings?.audience === 'Custom') {
      audienceEnum = 'CUSTOM';
    }

    const parseEmails = (input?: string): string[] | undefined => {
      if (!input || !input.trim()) return undefined;
      return input.split(/[, \n]+/).map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
    };

    setIsCreatingPost(true);
    try {
      let mediaIds: string[] | undefined = undefined;

      // Execute media upload pipeline if an image file was selected
      if (imageFile) {
        console.log('🚀 [MediaUpload] Uploading post image file to storage slot...');
        const uploadRes = await uploadMediaFile(imageFile, 'POST_IMAGE');
        const mediaId = uploadRes.mediaId || uploadRes.storageKey;
        if (mediaId) {
          mediaIds = [mediaId];
          try {
            await completeMediaUpload(mediaId);
            console.log('✅ [MediaUpload] Media upload completed for UUID:', mediaId);
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
      const isPendingApproval = res?.message === 'POST_PENDING_APPROVAL' || res?.data?.pendingGuardianApproval || res?.pendingGuardianApproval;

      if (isPendingApproval) {
        setToast({ message: 'Post submitted for guardian approval', type: 'info' });
      } else {
        const newPost: FeedPostProps = {
          id: res?.data?.post?.id || res?.id || `post-${Date.now()}`,
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
        setToast({ message: 'Post added successfully', type: 'success' });
      }
      setIsCreatePostOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to create post. Please try again.', type: 'error' });
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

      <PendingBanner
        message="Guardian invitation pending. Your guardian has not yet accepted your request to connect."
        actionText="Manage Invitations"
        onActionClick={() => alert('Manage invitations clicked')}
      />

      <main className="mhn-home-main-layout">
        <aside className="mhn-layout-col-left">
          <ProfileSummaryCard
            coverUrl={resolveCoverUrl((user?.profile as any)?.coverImageUrl || (user?.profile as any)?.coverUrl, "/cover.png")}
            location={user?.profile?.city || "-"}
            teamName="HC Bloemendaal"
            teamLogo="/HC.png"
            followers="-"
            following="-"
            onPostClick={() => setIsCreatePostOpen(true)}
          />
        </aside>

        <section className="mhn-layout-col-center">
          <div className="mhn-feed-header-bar">
            <div className="mhn-feed-search-wrapper">
              <svg className="mhn-feed-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="mhn-feed-search-input"
              />
            </div>

            <div className="mhn-feed-filter-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="mhn-feed-filter-select"
              >
                <option value="RECENT">Newest First</option>
                <option value="POPULAR">Most Popular</option>
                <option value="TRENDING">Trending (48h)</option>
              </select>
              <svg className="mhn-feed-filter-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {isFeedRefreshing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  onFollowChange={handleFollowChange}
                  onDeleteSuccess={(deletedId, msg) => {
                    setToast({ message: msg || 'Post deleted successfully!', type: 'success' });
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

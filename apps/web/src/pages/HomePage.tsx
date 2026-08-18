import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { Toast } from '../components/common/Toast';
import { ProfileSummaryCard } from '../components/features/home/ProfileSummaryCard';
import { FeedPostCard, FeedPostProps } from '../components/features/home/FeedPostCard';
import { MatchesWidget } from '../components/features/home/MatchesWidget';
import { UpcomingEventsWidget } from '../components/features/home/UpcomingEventsWidget';
import { InviteGrowWidget } from '../components/features/home/InviteGrowWidget';
import { CreatePostModal } from '../components/features/home/CreatePostModal';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/features/network/EmptyState';
import { HomeSkeletonLoader } from '../components/features/home/HomeSkeletonLoader';
import { getAuthMe, saveUserProfile, AuthMeResponse, createPost, getFeed } from '@my-hockey-network/core';
import { useAuth } from '../context/AuthContext';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const HomePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<AuthMeResponse | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { setUserProfile } = useAuth();

  // Hit GET /v1/auth/me & GET /v1/feed on Home page mount
  useEffect(() => {
    async function loadInitialData() {
      setIsPageLoading(true);
      try {
        console.log('🚀 [HomePage Mounted] Hitting GET /v1/auth/me & GET /v1/feed APIs...');
        const [meRes, feedRes] = await Promise.allSettled([
          getAuthMe(),
          getFeed(),
        ]);

        if (meRes.status === 'fulfilled' && meRes.value) {
          setUserSession(meRes.value);
          setUserProfile(meRes.value);
          console.log('✅ [HomePage] Auth Me API Response:', meRes.value);
        }

        if (feedRes.status === 'fulfilled' && feedRes.value) {
          const feedData = (feedRes.value as any)?.data || feedRes.value;
          const itemsList = feedData?.items || (Array.isArray(feedData) ? feedData : []);

          if (itemsList && itemsList.length > 0) {
            const meData = meRes.status === 'fulfilled' ? meRes.value : null;
            const currentProfileId = meData?.profile?.id || meData?.id;

            const mappedPosts: FeedPostProps[] = itemsList.map((wrapper: any) => {
              const postObj = wrapper.post || wrapper;
              const reason = wrapper.reason || wrapper.postReason || '';
              const authorProf = postObj.authorProfile || postObj.author || {};
              const authorId = postObj.authorProfileId || authorProf.id;

              const isSelfPost = reason === 'SELF' || (currentProfileId && authorId === currentProfileId);

              return {
                id: postObj.id || `post_${Math.random()}`,
                authorName: authorProf.displayName || '-',
                authorRole: authorProf.type || authorProf.primaryRole || '-',
                authorTime: postObj.publishedAt ? new Date(postObj.publishedAt).toLocaleDateString() : 'Recently',
                authorAvatar: authorProf.avatarUrl || '/userPlaceholder.png',
                content: postObj.body || '',
                postImage: postObj.media?.[0]?.url,
                likesCount: postObj.likeCount ?? postObj.reactionsCount ?? 0,
                commentsCount: postObj.commentCount ?? postObj.commentsCount ?? 0,
                isFollowing: false,
                isSelf: isSelfPost,
              };
            });

            setFeedPosts(mappedPosts);
            console.log('✅ [HomePage] Feed API Response Mapped:', mappedPosts);
          } else {
            setFeedPosts([]);
            console.log('ℹ️ [HomePage] Feed API returned empty items array');
          }
        }
      } catch (err: any) {
        console.warn('⚠️ [HomePage] Data fetch warning:', err.message || err);
      } finally {
        setIsPageLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Initialize feedPosts state as empty [] (no dummy posts on empty API data)
  const [feedPosts, setFeedPosts] = useState<FeedPostProps[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'latest'>('recent');

  const filteredPosts = feedPosts
    .filter((post) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(q) ||
        post.authorName.toLowerCase().includes(q) ||
        (post.authorRole && post.authorRole.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      return 0;
    });

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePost = async (content: string, postImage?: string, privacySettings?: any) => {
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

    const dto = {
      body: content,
      audience: audienceEnum,
      placeName: privacySettings?.locationTag || undefined,
      shareWithEmails: parseEmails(privacySettings?.shareWith),
      hideFromEmails: parseEmails(privacySettings?.dontShareWith),
    };

    setIsCreatingPost(true);
    try {
      console.log('🚀 [HomePage] Creating post API call (POST /v1/posts)...', dto);
      const res = await createPost(dto);
      console.log('✅ [HomePage] Create Post API Success:', res);

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
      console.error('❌ [HomePage] Create Post Error:', err);
      setToast({ message: err.message || 'Failed to create post. Please try again.', type: 'error' });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const currentUserName = userSession?.profile?.displayName || 'Player';
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
      {/* Top Navigation Bar Header */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Pending Guardian Notice Banner */}
      <PendingBanner
        message="Guardian invitation pending. Your guardian has not yet accepted your request to connect."
        actionText="Manage Invitations"
        onActionClick={() => alert('Manage invitations clicked')}
      />

      {/* Main 3-Column Content Layout */}
      <main className="mhn-home-main-layout">
        {/* Left Column: Profile Summary & Post Action */}
        <aside className="mhn-layout-col-left">
          <ProfileSummaryCard
            coverUrl="/cover.png"
            location="Austria, Europe"
            teamName="HC Bloemendaal"
            teamLogo="/HC.png"
            followers="-"
            following="-"
            onPostClick={() => setIsCreatePostOpen(true)}
          />
        </aside>

        {/* Center Column: Feed Posts */}
        <section className="mhn-layout-col-center">
          {/* Top Search Bar & Filter Dropdown above posts */}
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
                <option value="recent">Sort by</option>
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
              </select>
              <svg className="mhn-feed-filter-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState
              title="No Posts Found"
              message={searchQuery ? `No posts match your search "${searchQuery}".` : "There are no posts in your feed right now. Be the first to share an update with your network!"}
              iconType="posts"
              actionLabel="Create Post"
              onAction={() => setIsCreatePostOpen(true)}
            />
          ) : (
            <div className="mhn-feed-posts-stack">
              {filteredPosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  {...post}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Widgets */}
        <aside className="mhn-layout-col-right">
          {/* Matches Schedule Widget */}
          <MatchesWidget
            onViewAll={() => alert('View all matches')}
          />

          {/* Upcoming Events Widget */}
          <UpcomingEventsWidget
            onViewAll={() => handleTabChange('events')}
            onEventClick={() => handleTabChange('event-detail')}
          />

          {/* Invite & Grow Widget */}
          <InviteGrowWidget
            onInviteClick={() => alert('Invite members modal')}
            illustrationUrl="/player.png"
          />
        </aside>
      </main>

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmit={handleCreatePost}
          isLoading={isCreatingPost}
          userName={currentUserName}
          userAvatar="/ovechkin.png"
        />
      )}

      {/* Global Toast Notification */}
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

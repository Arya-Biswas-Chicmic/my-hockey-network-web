import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { ProfileSummaryCard } from '../components/features/home/ProfileSummaryCard';
import { FeedPostCard, FeedPostProps } from '../components/features/home/FeedPostCard';
import { MatchesWidget } from '../components/features/home/MatchesWidget';
import { UpcomingEventsWidget } from '../components/features/home/UpcomingEventsWidget';
import { InviteGrowWidget } from '../components/features/home/InviteGrowWidget';
import { CreatePostModal } from '../components/features/home/CreatePostModal';
import { Spinner } from '../components/common/Spinner';
import { getAuthMe, saveUserProfile, AuthMeResponse } from '@my-hockey-network/core';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const HomePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userSession, setUserSession] = useState<AuthMeResponse | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // Hit GET /v1/auth/me on Home page mount
  useEffect(() => {
    async function loadUserSession() {
      setIsPageLoading(true);
      try {
        console.log('🚀 [HomePage Mounted] Hitting GET /v1/auth/me API...');
        const res = await getAuthMe();
        if (res) {
          setUserSession(res);
          saveUserProfile(res);
          console.log('✅ [HomePage] Auth Me API Response:', res);
        }
      } catch (err: any) {
        console.warn('⚠️ [HomePage] Auth Me API Error:', err.message || err);
      } finally {
        setIsPageLoading(false);
      }
    }

    loadUserSession();
  }, []);

  // Sample feed posts matching the Figma screenshot
  const [feedPosts, setFeedPosts] = useState<FeedPostProps[]>([
    {
      id: 'p1',
      authorName: 'KC Blueknocks',
      authorRole: 'Official Team',
      authorTime: '1d',
      authorAvatar: '/kcBlue.png',
      content: "First tournament of the season! Let's go!",
      postImage: '/playHockey.png',
      likesCount: 13,
      commentsCount: 2,
      isFollowing: false,
    },
    {
      id: 'p2',
      authorName: 'MHN STARS',
      authorRole: 'Official Team',
      authorTime: '1d',
      authorAvatar: '/kcBlue.png',
      content: "First tournament of the season! Let's go!",
      postImage: '/mhnStars.png',
      likesCount: 18,
      commentsCount: 5,
      isFollowing: false,
    }
  ]);

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePost = (content: string, postImage?: string) => {
    const newPost = {
      id: `post-${Date.now()}`,
      authorName: 'Alexander Ovechkin',
      authorRole: 'LW • #8',
      authorTime: 'Just now',
      authorAvatar: '/ovechkin.png',
      content,
      postImage,
      likesCount: 0,
      commentsCount: 0,
      isFollowing: false,
    };
    setFeedPosts([newPost, ...feedPosts]);
  };

  const currentUserName = userSession?.profile?.displayName || 'Alexander Ovechkin';
  const currentUserRole = userSession?.profile?.type || userSession?.primaryRole || 'LW • #8';

  if (isPageLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      }}>
        <img src="/logo.png" alt="My Hockey Network" style={{ height: '48px', objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0F172A', fontWeight: 600, fontSize: '15px' }}>
          <Spinner size="md" color="#0091FF" />
          <span>Loading Home Network...</span>
        </div>
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
        userName={currentUserName}
        userAvatar="/ovechkin.png"
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
            name={currentUserName}
            role={currentUserRole}
            avatarUrl="/ovechkin.png"
            coverUrl="/cover.png"
            location="Austria, Europe"
            teamName="HC Bloemendaal"
            teamLogo="/HC.png"
            followers="1M"
            following="700"
            onPostClick={() => setIsCreatePostOpen(true)}
          />
        </aside>

        {/* Center Column: Feed Posts */}
        <section className="mhn-layout-col-center">
          <div className="mhn-feed-posts-stack">
            {feedPosts.map((post) => (
              <FeedPostCard 
                key={post.id}
                {...post}
              />
            ))}
          </div>
        </section>

        {/* Right Column: Search & Widgets */}
        <aside className="mhn-layout-col-right">
          {/* Search Input Bar */}
          <div className="mhn-search-bar-widget">
            <div className="mhn-search-input-wrapper">
              <svg className="mhn-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="mhn-search-input"
              />
            </div>
          </div>

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
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePost}
        userName="Alexander Ovechkin"
        userAvatar="/ovechkin.png"
      />
    </div>
  );
};

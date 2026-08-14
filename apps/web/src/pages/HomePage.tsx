import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { ProfileSummaryCard } from '../components/features/home/ProfileSummaryCard';
import { FeedPostCard } from '../components/features/home/FeedPostCard';
import { MatchesWidget } from '../components/features/home/MatchesWidget';
import { UpcomingEventsWidget } from '../components/features/home/UpcomingEventsWidget';
import { InviteGrowWidget } from '../components/features/home/InviteGrowWidget';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const HomePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  // Sample feed posts matching the Figma screenshot
  const posts = [
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
  ];

  return (
    <div className="mhn-home-page-root">
      {/* Top Navigation Bar Header */}
      <Header 
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        userName="Jack Ruffle"
        userAvatar="/jack.png"
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
            name="Jack Ruffle"
            role="Player"
            avatarUrl="/player.png"
            onPostClick={() => alert('Create new post modal')}
          />
        </aside>

        {/* Center Column: Feed Posts */}
        <section className="mhn-layout-col-center">
          <div className="mhn-feed-posts-stack">
            {posts.map((post) => (
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
    </div>
  );
};

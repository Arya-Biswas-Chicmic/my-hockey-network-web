import { Button } from '../../common/Button';
import { Input } from '../../common/FormControls';
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { FeedPostCard, FeedPostProps } from '../home/FeedPostCard';
import { CreatePostModal } from '../home/CreatePostModal';

interface GroupDetailViewProps {
  groupId?: string;
  groupName?: string;
  onBackToGroups?: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  groupId = 'g1',
  groupName = 'San Jose Sharks',
  onBackToGroups
}) => {
  const { user } = useAuth();
  const resolvedName = user?.profile?.displayName || (user as any)?.displayName || 'Player';
  const resolvedAvatar = user?.profile?.avatarUrl || (user as any)?.avatarUrl || '/userPlaceholder.png';
  const resolvedRole = user?.primaryRole || user?.profile?.type || 'PLAYER';

  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'people' | 'media' | 'files'>('posts');
  const [isJoined, setIsJoined] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample group posts matching Figma screenshot
  const [posts, setPosts] = useState<FeedPostProps[]>([
    {
      id: 'gp1',
      authorName: 'KC Blueknocks',
      authorRole: 'Official Team • 1d',
      authorTime: '1d',
      authorAvatar: '/kcBlue.png',
      content: "First tournament of the season! Let's go!",
      postImage: '/playHockey.png',
      likesCount: 18,
      commentsCount: 2,
      isFollowing: false,
    }
  ]);

  const handleCreatePost = (content: string, postImage?: string) => {
    const newPost: FeedPostProps = {
      id: `post-${Date.now()}`,
      authorName: resolvedName,
      authorRole: resolvedRole,
      authorTime: 'Just now',
      authorAvatar: resolvedAvatar,
      content,
      postImage,
      likesCount: 0,
      commentsCount: 0,
      isFollowing: false,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="mhn-group-detail-page-container">
      {/* 2-Column Main Layout */}
      <div className="mhn-group-detail-layout">
        {/* Left Column: Joined Profile Summary Card & Post in Group button */}
        <aside className="mhn-group-col-left">
          <div className="mhn-group-member-card">
            {/* Cover Banner */}
            <div 
              className="mhn-group-member-banner"
              style={{ backgroundImage: 'url(/cover.png)' }}
            />
            {/* Avatar Circle */}
            <div className="mhn-group-member-avatar-wrapper">
              <div className="mhn-group-member-avatar-circle">
                <img 
                  src={resolvedAvatar} 
                  alt={resolvedName} 
                  className="mhn-group-member-avatar-img" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
              </div>
            </div>
            {/* Info */}
            <div className="mhn-group-member-info">
              <h3 className="mhn-group-member-name">{resolvedName}</h3>
              <p className="mhn-group-member-joined">Joined Group 1 August 2025</p>
            </div>
          </div>

          {/* Post in Group Button */}
          <Button
            className="mhn-btn-post-in-group"
            onClick={() => setIsPostModalOpen(true)}
          >
            Post in Group
          </Button>
        </aside>

        {/* Right Main Column */}
        <section className="mhn-group-col-main">
          {/* Top Hero Banner & Header Card */}
          <div className="mhn-group-hero-card">
            <div 
              className="mhn-group-cover-banner"
              style={{ backgroundImage: 'url(/event1.png)' }}
            />

            {/* Header Title & Actions Bar */}
            <div className="mhn-group-hero-body">
              <div className="mhn-group-title-row">
                <div className="mhn-group-title-info">
                  <h1 className="mhn-group-main-name">{groupName}</h1>
                  <span className="mhn-group-members-count">54.7k Members</span>
                </div>

                <div className="mhn-group-action-btns">
                  <Button className="mhn-btn-group-outline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Invite</span>
                  </Button>

                  <Button className="mhn-btn-group-outline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span>Share</span>
                  </Button>

                  <Button
                    className={`mhn-btn-group-joined ${isJoined ? 'joined' : ''}`}
                    onClick={() => setIsJoined(!isJoined)}
                  >
                    <span>{isJoined ? 'Joined' : 'Join'}</span>
                    {isJoined && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>

              {/* Sub-navigation Tabs */}
              <div className="mhn-group-subnav-tabs">
                {(['posts', 'about', 'people', 'media', 'files'] as const).map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`mhn-group-subnav-tab ${activeTab === tab ? 'active' : ''}`}
                  >
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    {activeTab === tab && <div className="mhn-group-tab-active-line" />}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-content Area (Feed + Right Widgets) */}
          <div className="mhn-group-content-columns">
            {/* Left Sub-column: Posts Feed */}
            <div className="mhn-group-feed-column">
              <div className="mhn-feed-posts-stack">
                {posts.map((post) => (
                  <FeedPostCard key={post.id} {...post} />
                ))}
              </div>
            </div>

            {/* Right Sub-column: Sidebar Widgets */}
            <aside className="mhn-group-widgets-column">
              {/* Search Widget */}
              <div className="mhn-group-widget-box">
                <div className="mhn-groups-search-input-wrapper">
                  <svg className="mhn-groups-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="mhn-groups-search-input"
                  />
                </div>
              </div>

              {/* Admin Widget */}
              <div className="mhn-group-widget-box">
                <h3 className="mhn-group-widget-title">Admin</h3>
                <div className="mhn-group-admin-row">
                  <img src="/lucas.png" alt="Matthew Schaefer" className="mhn-admin-avatar" />
                  <div className="mhn-admin-meta">
                    <span className="mhn-admin-name">Matthew Schaefer</span>
                    <span className="mhn-admin-role">Coach</span>
                    <div className="mhn-admin-team-badge">
                      <img src="/HC.png" alt="HC Bloemendaal" className="mhn-admin-team-logo" />
                      <span>HC Bloemendaal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Groups you might be interested in Widget */}
              <div className="mhn-group-widget-box">
                <h3 className="mhn-group-widget-title">Groups you might be interested in</h3>
                <div className="mhn-suggested-groups-list">
                  {/* Item 1 */}
                  <div className="mhn-suggested-group-item">
                    <img src="/event1.png" alt="San Jose Sharks" className="mhn-suggested-group-thumb" />
                    <div className="mhn-suggested-group-info">
                      <h4 className="mhn-suggested-group-name">San Jose Sharks</h4>
                      <span className="mhn-suggested-group-members">1M members</span>
                      <Button className="mhn-btn-suggested-join">Join</Button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="mhn-suggested-group-item">
                    <img src="/mhnStars.png" alt="New York Rangers" className="mhn-suggested-group-thumb" />
                    <div className="mhn-suggested-group-info">
                      <h4 className="mhn-suggested-group-name">New York Rangers</h4>
                      <span className="mhn-suggested-group-members">750k members</span>
                      <Button className="mhn-btn-suggested-join">Join</Button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

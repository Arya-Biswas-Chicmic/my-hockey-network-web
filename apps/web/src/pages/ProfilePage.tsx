import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { FeedPostCard } from '../components/features/home/FeedPostCard';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('profile');
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'media' | 'stats' | 'about'>('stats');
  const [activeAboutSection, setActiveAboutSection] = useState<'intro' | 'career' | 'details'>('career');

  const [selectedSeason, setSelectedSeason] = useState('2025-26');
  const [selectedSeasonType, setSelectedSeasonType] = useState('Regular Season');
  const [selectedUnit, setSelectedUnit] = useState('Miles • MI');

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  // Sample User Posts matching Figma Screenshot 4
  const userPosts = [
    {
      id: 'post-1',
      authorName: 'Jack Ruffle',
      authorRole: 'C • #97',
      authorTime: '17 Aug',
      authorAvatar: '/jack.png',
      content: "First tournament of the season! Let's go!",
      postImage: '/playHockey.png',
      likesCount: 13,
      commentsCount: 2,
    },
    {
      id: 'post-2',
      authorName: 'Jack Ruffle',
      authorRole: 'C • #97',
      authorTime: '20 July',
      authorAvatar: '/jack.png',
      content: "FINAL MATCH DAY! 🏆 Everything we've trained for comes down to this. The ice is ready, and we're ready. #IceHockey #FinalMatch #GameDay",
      postImage: '/mhnStars.png',
      likesCount: 24,
      commentsCount: 5,
    }
  ];

  // Sample Media Photos matching Figma Screenshot 2
  const mediaPhotos = [
    '/playHockey.png',
    '/event1.png',
    '/event2.png',
    '/mhnStars.png',
    '/event3.png',
    '/event4.png'
  ];

  // Sample About Career Teams matching Figma Screenshot 3
  const careerTeams = [
    {
      id: 't1',
      name: 'Boston Bruins',
      subtitle: 'Center • 2 January 2024 - Present • Dagestan, Russia',
      logo: '/kcBlue.png',
    },
    {
      id: 't2',
      name: 'Carolina Hurricanes',
      subtitle: 'Center • 2022 - 2024 • Toronto, Canada',
      logo: '/HC.png',
    }
  ];

  return (
    <div className="mhn-profile-page-root">
      {/* Top Header Navigation Bar */}
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

      {/* Main Centered Content Container */}
      <main className="mhn-profile-main-container">
        {/* Profile Hero Card */}
        <div className="mhn-profile-hero-card">
          {/* Cover Banner Area */}
          <div
            className="mhn-profile-cover-banner"
            style={{
              backgroundImage: 'url(/cover.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Edit Cover Pencil Button */}
            <button className="mhn-btn-edit-cover" aria-label="Edit cover photo">
              <img src="/edit2.png" className="edit2-icon" alt="edit-icon" />
            </button>
          </div>

          {/* Profile Header Content Row */}
          <div className="mhn-profile-header-content">
            {/* Overlapping Avatar Circle */}
            <div className="mhn-profile-avatar-outer">
              <div className="mhn-profile-avatar-inner">
                <img
                  src="/jack.png"
                  alt="Jack Ruffle"
                  className="mhn-profile-hero-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
              </div>
            </div>

            {/* User Meta & Action Buttons */}
            <div className="mhn-profile-meta-and-actions">
              <div className="mhn-profile-text-meta">
                <h2 className="mhn-profile-hero-name">Jack Ruffle</h2>
                <div className="mhn-profile-hero-stats">
                  <span><strong>1M</strong> Followers</span>
                  <span><strong>289</strong> Following</span>
                </div>
                <p className="mhn-profile-hero-role" style={{ marginTop: '4px' }}>
                  Center • #97 • @HC Bloemendaal
                </p>
                <div className="mhn-profile-location-line" style={{ marginTop: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Austria, Europe</span>
                </div>
              </div>

              <div className="mhn-profile-action-buttons">
                <button
                  onClick={() => alert('Share profile link copied!')}
                  className="mhn-btn-share-profile"
                >
                  <div className="share-profile-text">Share Profile</div>
                </button>
                <button
                  onClick={() => alert('Edit profile modal')}
                  className="mhn-btn-edit-profile"
                >
                  <div className="edit-profile-text">Edit Profile</div>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content Navigation Tabs Bar */}
          <div className="mhn-profile-tabs-bar">
            <button
              onClick={() => setActiveProfileTab('posts')}
              className={`mhn-profile-tab-btn ${activeProfileTab === 'posts' ? 'mhn-profile-tab-active' : ''}`}
            >
              <span>Posts</span>
              {activeProfileTab === 'posts' && <div className="mhn-profile-tab-indicator" />}
            </button>
            <button
              onClick={() => setActiveProfileTab('media')}
              className={`mhn-profile-tab-btn ${activeProfileTab === 'media' ? 'mhn-profile-tab-active' : ''}`}
            >
              <span>Media</span>
              {activeProfileTab === 'media' && <div className="mhn-profile-tab-indicator" />}
            </button>
            <button
              onClick={() => setActiveProfileTab('stats')}
              className={`mhn-profile-tab-btn ${activeProfileTab === 'stats' ? 'mhn-profile-tab-active' : ''}`}
            >
              <span>Stats</span>
              {activeProfileTab === 'stats' && <div className="mhn-profile-tab-indicator" />}
            </button>
            <button
              onClick={() => setActiveProfileTab('about')}
              className={`mhn-profile-tab-btn ${activeProfileTab === 'about' ? 'mhn-profile-tab-active' : ''}`}
            >
              <span>About</span>
              {activeProfileTab === 'about' && <div className="mhn-profile-tab-indicator" />}
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div>
          {/* 1. POSTS TAB */}
          {activeProfileTab === 'posts' && (
            <div className="mhn-posts-container-card">
              <div className="mhn-posts-header-bar">
                <h3 className="mhn-posts-title">Posts</h3>
                <button className="mhn-btn-create-post" onClick={() => alert('Create post')}>Create Post</button>
              </div>

              {/* 2 Side-by-Side Post Cards matching Figma */}
              <div className="mhn-posts-grid-wrapper">
                {/* Left Card */}
                <div 
                  className="mhn-post-figma-card" 
                  onClick={() => onNavigate && onNavigate('event-detail')}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="mhn-post-figma-header">
                      <div className="mhn-post-figma-author">
                        <img src="/jack.png" alt="Jack Ruffle" className="mhn-post-figma-avatar" />
                        <div className="mhn-post-figma-meta">
                          <h4 className="mhn-post-figma-author-name">Jack Ruffle</h4>
                          <span className="mhn-post-figma-subtitle">C • #97 • 1 Aug</span>
                        </div>
                      </div>
                      <button className="mhn-post-figma-more-btn" aria-label="More">
                        <img src='/threeDots.png' className='three-dots-icon' alt='three-dots'/>
                      </button>
                    </div>

                    <p className="mhn-post-figma-text">
                      <strong>First tournament of the season! Let's go!</strong>
                    </p>
                    <p className="mhn-post-figma-text-more">... more</p>

                    <div className="mhn-post-figma-image-box">
                      <img src="/playHockey.png" alt="Hockey match" className="mhn-post-figma-image" />
                    </div>
                  </div>

                  <div className="mhn-post-figma-footer">
                    <div className="mhn-post-figma-action">
                      <img src="/like.png" alt="" className="like-count-icon" />
                      <span>13</span>
                    </div>

                    <div className="mhn-post-figma-action">
                      <img src="/comment.png" alt="" className="comment-count-icon" />
                      <span>2</span>
                    </div>

                    <div className="mhn-post-figma-action">
                      <img src="/share.png" alt="" className="share-count-icon" />
                    </div>
                  </div>
                </div>

                {/* Right Card */}
                <div 
                  className="mhn-post-figma-card"
                  onClick={() => onNavigate && onNavigate('event-detail')}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="mhn-post-figma-header">
                      <div className="mhn-post-figma-author">
                        <img src="/jack.png" alt="Jack Ruffle" className="mhn-post-figma-avatar" />
                        <div className="mhn-post-figma-meta">
                          <h4 className="mhn-post-figma-author-name">Jack Ruffle</h4>
                          <span className="mhn-post-figma-subtitle">C • #97 • 20 July</span>
                        </div>
                      </div>
                       <img src='/threeDots.png' className='three-dots-icon' alt='three-dots'/>
                    </div>

                    <p className="mhn-post-figma-text">
                      🏒 <strong>FINAL MATCH DAY! 🏆</strong>
                    </p>
                    <p className="mhn-post-figma-text" style={{ fontSize: '13px', color: '#475569' }}>
                      Everything we've trained for comes down to pressure is high, the ice is ready, and we're ready. everything we've got.<br />
                      No fear. No excuses. Just heart, teamwork, One final battle. One chance to become champions trophy home! 🔥🏆
                    </p>
                    <p className="mhn-post-figma-hashtags">
                      #IceHockey #FinalMatch #GameDay
                    </p>
                  </div>

                  <div className="mhn-post-figma-footer">
                    <div className="mhn-post-figma-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span>13</span>
                    </div>

                    <div className="mhn-post-figma-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>2</span>
                    </div>

                    <div className="mhn-post-figma-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Floating Next Arrow Button */}
                <button className="mhn-posts-next-arrow" aria-label="Next posts">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Bottom Show All Button */}
              <div className="mhn-posts-show-all-divider">
                <button className="mhn-btn-show-all">Show All</button>
              </div>
            </div>
          )}

          {/* 2. MEDIA TAB */}
          {activeProfileTab === 'media' && (
            <div className="mhn-profile-tab-content-card-full mhn-media-card-override">
              <div className="mhn-media-grid">
                {mediaPhotos.map((photo, idx) => (
                  <div key={idx} className="mhn-media-item-card">
                    <img src={photo} alt={`Media ${idx + 1}`} className="mhn-media-img" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. STATS TAB */}
          {activeProfileTab === 'stats' && (
            <div className="mhn-profile-tab-content-card-full">
              <div className="mhn-profile-stats-container">
                {/* Filter Dropdowns Row */}
                <div className="mhn-stats-filters-row">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="mhn-stats-select"
                  >
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                  </select>

                  <select
                    value={selectedSeasonType}
                    onChange={(e) => setSelectedSeasonType(e.target.value)}
                    className="mhn-stats-select"
                  >
                    <option value="Regular Season">Regular Season</option>
                    <option value="Playoffs">Playoffs</option>
                  </select>

                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="mhn-stats-select"
                  >
                    <option value="Miles • MI">Miles • MI</option>
                    <option value="KM • KPH">KM • KPH</option>
                  </select>
                </div>

                {/* Season Summary Bar */}
                <div className="mhn-season-summary-card">
                  <h3 className="mhn-season-title">2025-26 Regular Season</h3>
                  <div className="mhn-season-metrics-group">
                    <div className="mhn-season-metric-col">
                      <span className="mhn-season-metric-label">GP</span>
                      <span className="mhn-season-metric-value">81</span>
                    </div>
                    <div className="mhn-season-metric-divider" />
                    <div className="mhn-season-metric-col">
                      <span className="mhn-season-metric-label">G</span>
                      <span className="mhn-season-metric-value">7</span>
                    </div>
                    <div className="mhn-season-metric-divider" />
                    <div className="mhn-season-metric-col">
                      <span className="mhn-season-metric-label">A</span>
                      <span className="mhn-season-metric-value">7</span>
                    </div>
                    <div className="mhn-season-metric-divider" />
                    <div className="mhn-season-metric-col">
                      <span className="mhn-season-metric-label">P</span>
                      <span className="mhn-season-metric-value">14</span>
                    </div>
                  </div>
                </div>

                {/* 3 Percentile Cards Grid */}
                <div className="mhn-percentile-cards-grid">
                  {/* Card 1 */}
                  <div className="mhn-percentile-card">
                    <div className="mhn-percentile-card-header">
                      <span className="mhn-percentile-badge-blue">60th PERCENTILE</span>
                      <div className="mhn-percentile-info-icon" title="Hardest Shot Info">i</div>
                    </div>
                    <div className="mhn-percentile-value">86.45</div>
                    <p className="mhn-percentile-label">Hardest Shot • MPH</p>
                  </div>

                  {/* Card 2 */}
                  <div className="mhn-percentile-card">
                    <div className="mhn-percentile-card-header">
                      <span className="mhn-percentile-badge-dark">99th PERCENTILE</span>
                      <div className="mhn-percentile-info-icon" title="Max Skating Speed Info">i</div>
                    </div>
                    <div className="mhn-percentile-value">24.94</div>
                    <p className="mhn-percentile-label">Max Skating Speed • MPH</p>
                  </div>

                  {/* Card 3 */}
                  <div className="mhn-percentile-card">
                    <div className="mhn-percentile-card-header">
                      <span className="mhn-percentile-badge-outline">&lt;50th PERCENTILE</span>
                      <div className="mhn-percentile-info-icon" title="Most Miles Skated Info">i</div>
                    </div>
                    <div className="mhn-percentile-value">2.63</div>
                    <p className="mhn-percentile-label">Most Miles Skated • Game</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ABOUT TAB */}
          {activeProfileTab === 'about' && (
            <div className="mhn-profile-tab-content-card-full mhn-about-card-padding-override">
              <div className="mhn-about-2col-container">
                {/* Left Sidebar */}
                <div className="mhn-about-sidebar">
                  <h3 className="mhn-about-sidebar-title">About</h3>

                  <nav className="mhn-about-menu-nav">
                    <button
                      onClick={() => setActiveAboutSection('intro')}
                      className={`mhn-about-menu-btn ${activeAboutSection === 'intro' ? 'mhn-about-btn-active' : ''}`}
                    >
                      Intro
                    </button>
                    <button
                      onClick={() => setActiveAboutSection('career')}
                      className={`mhn-about-menu-btn ${activeAboutSection === 'career' ? 'mhn-about-btn-active' : ''}`}
                    >
                      Career
                    </button>
                    <button
                      onClick={() => setActiveAboutSection('details')}
                      className={`mhn-about-menu-btn ${activeAboutSection === 'details' ? 'mhn-about-btn-active' : ''}`}
                    >
                      Personal details
                    </button>
                  </nav>
                </div>

                {/* Right Detail Panel */}
                <div className="mhn-about-main-panel">
                  {activeAboutSection === 'intro' && (
                    <div className="mhn-about-section-content">
                      <p className="mhn-about-placeholder-text">Center player passionate about competitive hockey.</p>
                    </div>
                  )}

                  {activeAboutSection === 'career' && (
                    <div className="mhn-about-section-content">
                      <div className="mhn-about-teams-header">
                        <h4 className="mhn-about-teams-title">Teams</h4>
                        <button className="mhn-btn-add-team" title="Add Team">+</button>
                      </div>
                      <div className="mhn-about-team-list">
                        {careerTeams.map((team) => (
                          <div key={team.id} className="mhn-about-team-item">
                            <div className="mhn-about-team-left">
                              <img src={team.logo} alt={team.name} className="mhn-about-team-logo" />
                              <div className="mhn-about-team-info">
                                <span className="mhn-about-team-name">{team.name}</span>
                                <span className="mhn-about-team-subtitle">{team.subtitle}</span>
                              </div>
                            </div>
                            <button className="mhn-about-team-edit-btn" aria-label="Edit team">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeAboutSection === 'details' && (
                    <div className="mhn-about-section-content">
                      <p className="mhn-about-placeholder-text">Location: Austria, Europe • Height: 6'1" • Weight: 185 lbs</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

